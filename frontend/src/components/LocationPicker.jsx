import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Loader2, Search } from 'lucide-react';

// Fix Leaflet default marker icon (webpack/vite breaks it)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom blue marker
const blueIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

// ---- Sub-components ----

// Component to fly the map to a given position
const FlyToPosition = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, 16, { duration: 1.2 });
        }
    }, [position, map]);
    return null;
};

// Component to handle map click events
const MapClickHandler = ({ onMapClick }) => {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng);
        },
    });
    return null;
};

// Draggable marker sub-component
const DraggableMarker = ({ position, onDragEnd }) => {
    const markerRef = useRef(null);
    const eventHandlers = useMemo(() => ({
        dragend() {
            const marker = markerRef.current;
            if (marker) {
                onDragEnd(marker.getLatLng());
            }
        },
    }), [onDragEnd]);

    return (
        <Marker
            draggable
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
            icon={blueIcon}
        />
    );
};

// ---- Reverse Geocode (Nominatim — free, no API key) ----
const reverseGeocode = async (lat, lng) => {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18`,
            { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        if (data && data.display_name) {
            // Build a shorter, cleaner address
            const parts = [];
            const addr = data.address || {};
            if (addr.road) parts.push(addr.road);
            if (addr.neighbourhood || addr.suburb) parts.push(addr.neighbourhood || addr.suburb);
            if (addr.city || addr.town || addr.village) parts.push(addr.city || addr.town || addr.village);
            if (addr.state) parts.push(addr.state);
            return parts.length >= 2 ? parts.join(', ') : data.display_name;
        }
        return '';
    } catch {
        return '';
    }
};

// Forward geocode (search by text)
const forwardGeocode = async (query) => {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`,
            { headers: { 'Accept-Language': 'en' } }
        );
        return await res.json();
    } catch {
        return [];
    }
};


// ---- Main Component ----

/**
 * LocationPicker — Interactive Leaflet map for picking complaint location
 *
 * Props:
 * @param {function} onLocationChange - Called with { address, lat, lng } whenever location changes
 * @param {string}   initialAddress   - Pre-filled address text
 * @param {number}   initialLat       - Pre-filled latitude
 * @param {number}   initialLng       - Pre-filled longitude
 */
const LocationPicker = ({ onLocationChange, initialAddress = '', initialLat, initialLng }) => {
    const DEFAULT_CENTER = [20.5937, 78.9629]; // Center of India
    const DEFAULT_ZOOM = 5;

    const [position, setPosition] = useState(
        initialLat && initialLng ? [initialLat, initialLng] : null
    );
    const [address, setAddress] = useState(initialAddress);
    const [isLocating, setIsLocating] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchTimeoutRef = useRef(null);
    const searchContainerRef = useRef(null);

    // Close search results when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced search
    useEffect(() => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        if (!searchQuery || searchQuery.length < 3) {
            setSearchResults([]);
            return;
        }
        searchTimeoutRef.current = setTimeout(async () => {
            setIsSearching(true);
            const results = await forwardGeocode(searchQuery);
            setSearchResults(results);
            setShowResults(true);
            setIsSearching(false);
        }, 500);
        return () => clearTimeout(searchTimeoutRef.current);
    }, [searchQuery]);

    // Update parent whenever position/address changes
    const updateLocation = async (lat, lng, addr) => {
        const newPos = [lat, lng];
        setPosition(newPos);
        if (!addr) {
            addr = await reverseGeocode(lat, lng);
        }
        setAddress(addr);
        onLocationChange({ address: addr, lat, lng });
    };

    const handleMapClick = (latlng) => {
        updateLocation(latlng.lat, latlng.lng);
    };

    const handleMarkerDrag = (latlng) => {
        updateLocation(latlng.lat, latlng.lng);
    };

    const handleDetectLocation = () => {
        if (!navigator.geolocation) return;
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                updateLocation(pos.coords.latitude, pos.coords.longitude);
                setIsLocating(false);
            },
            () => {
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleSearchSelect = (result) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        updateLocation(lat, lng, result.display_name);
        setSearchQuery('');
        setShowResults(false);
    };

    // Auto-detect on mount if no initial position
    useEffect(() => {
        if (!position) {
            handleDetectLocation();
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="space-y-3">
            {/* Search bar */}
            <div ref={searchContainerRef} className="relative">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => searchResults.length > 0 && setShowResults(true)}
                            placeholder="Search for a place..."
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        {isSearching && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={handleDetectLocation}
                        disabled={isLocating}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 transition-all disabled:opacity-50"
                        title="Use my current location"
                    >
                        {isLocating ? (
                            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                        ) : (
                            <Navigation className="w-4 h-4 text-blue-500" />
                        )}
                        <span className="hidden sm:inline">{isLocating ? 'Detecting...' : 'My Location'}</span>
                    </button>
                </div>

                {/* Search results dropdown */}
                {showResults && searchResults.length > 0 && (
                    <div className="absolute z-[1000] top-full mt-1 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
                        {searchResults.map((result, i) => (
                            <button
                                key={i}
                                type="button"
                                className="w-full text-left px-4 py-3 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/30 border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors"
                                onClick={() => handleSearchSelect(result)}
                            >
                                <div className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <span className="line-clamp-2">{result.display_name}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Map */}
            <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg" style={{ height: '320px' }}>
                <MapContainer
                    center={position || DEFAULT_CENTER}
                    zoom={position ? 16 : DEFAULT_ZOOM}
                    scrollWheelZoom
                    style={{ height: '100%', width: '100%' }}
                    className="z-0"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapClickHandler onMapClick={handleMapClick} />
                    {position && (
                        <>
                            <FlyToPosition position={position} />
                            <DraggableMarker position={position} onDragEnd={handleMarkerDrag} />
                        </>
                    )}
                </MapContainer>
                {!position && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10 pointer-events-none">
                        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl px-6 py-4 shadow-lg text-center">
                            <MapPin className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                                Click on the map to place a pin
                            </p>
                            <p className="text-xs text-gray-400 mt-1">or use the search / auto-detect above</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Address display */}
            {address && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50/70 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-200">Selected Location</p>
                        <p className="text-sm text-blue-700 dark:text-blue-300 break-words">{address}</p>
                        {position && (
                            <p className="text-xs text-blue-500 mt-1 font-mono">
                                {position[0].toFixed(6)}, {position[1].toFixed(6)}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocationPicker;
