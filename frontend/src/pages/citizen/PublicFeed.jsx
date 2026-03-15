import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import useApi from '@/hooks/useApi';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MapPin, Clock, Tag, Loader2, List, Map as MapIcon, ThumbsUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import UpvoteButton from '@/components/ui/UpvoteButton';
import { useNavigate } from 'react-router-dom';

// Lazy-load leaflet only in map view
import 'leaflet/dist/leaflet.css';
import { COMPLAINT_CATEGORIES, COMPLAINT_STATUSES } from '@/lib/constants';

const CATEGORIES = ['All', ...COMPLAINT_CATEGORIES];
const STATUSES = ['All', ...COMPLAINT_STATUSES];
const SORTS = [
  { label: 'Priority (Highest First)', value: '-communityPriority.score' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Most Upvoted', value: 'most-upvoted' }
];

const PRIORITY_COLORS = {
  High: '#dc2626',
  Medium: '#d97706',
  Low: '#16a34a',
};

const priorityMarkerColor = (priority) => PRIORITY_COLORS[priority] || '#6b7280';

// ---- Map View ----
const MapView = ({ complaints, onViewComplaint }) => {
  const [MapComponents, setMapComponents] = useState(null);

  useEffect(() => {
    // Dynamically import react-leaflet to avoid SSR issues
    Promise.all([
      import('react-leaflet'),
      import('leaflet'),
    ]).then(([rl, L]) => {
      // Fix default marker icon path issue with webpack
      delete L.default.Icon.Default.prototype._getIconUrl;
      L.default.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      setMapComponents(rl);
    });
  }, []);

  // Compute map center from complaint coords
  const validComplaints = complaints.filter(c =>
    c.location?.coordinates?.length === 2 &&
    typeof c.location.coordinates[0] === 'number' &&
    typeof c.location.coordinates[1] === 'number'
  );

  const center = validComplaints.length > 0
    ? [
        validComplaints.reduce((s, c) => s + c.location.coordinates[1], 0) / validComplaints.length,
        validComplaints.reduce((s, c) => s + c.location.coordinates[0], 0) / validComplaints.length,
      ]
    : [20.59, 78.96];

  if (!MapComponents) {
    return (
      <div className="flex items-center justify-center h-80 glass-card">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
        Loading map…
      </div>
    );
  }

  const { MapContainer, TileLayer, CircleMarker, Popup } = MapComponents;

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
      <MapContainer
        center={center}
        zoom={validComplaints.length > 0 ? 13 : 5}
        style={{ height: '480px', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {validComplaints.map(complaint => {
          const [lng, lat] = complaint.location.coordinates;
          const color = priorityMarkerColor(complaint.priority);
          return (
            <CircleMarker
              key={complaint._id}
              center={[lat, lng]}
              radius={8}
              pathOptions={{ fillColor: color, color: 'white', weight: 1.5, fillOpacity: 0.9 }}
            >
              <Popup>
                <div className="min-w-[180px]">
                  <p className="font-semibold text-sm text-gray-900 mb-1 leading-tight">{complaint.title}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={complaint.status === 'Resolved' ? 'success' : complaint.status === 'In Progress' ? 'warning' : 'default'} className="text-xs">
                      {complaint.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                    <ThumbsUp className="w-3 h-3" />
                    <span>{complaint.upvotes?.count || 0} supporters</span>
                  </div>
                  <button
                    onClick={() => onViewComplaint(complaint._id)}
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    View →
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div className="flex items-center gap-6 px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400">
        {Object.entries(PRIORITY_COLORS).map(([label, color]) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

// ---- Main Component ----
const PublicFeed = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [sort, setSort] = useState('-communityPriority.score');
  const [view, setView] = useState('list'); // 'list' | 'map'
  const [isAuditLog, setIsAuditLog] = useState(false);
  const [isNearMe, setIsNearMe] = useState(false); // Default to city-wide
  const [userLocation, setUserLocation] = useState(null);

  // Try to get user location for localized feed
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.log('Geolocation not granted, showing city-wide feed')
      );
    }
  }, []);

  const { request } = useApi();
  const { user } = useAuth();
  const navigate = useNavigate();

  // RADIUS LOGIC:
  // - Audit Log: no geo filtering — must show everything for full transparency
  // - Active Feed (default): 25km — scopes to same municipal corporation
  // - Near Me (toggle): 5km — hyper-local neighborhood view
  const MUNICIPAL_RADIUS = 25000;  // 25km — covers most municipal corps
  const NEAR_ME_RADIUS   =  5000;  //  5km — hyperlocal

  const getActiveRadius = () => {
    if (isAuditLog) return null;          // no filter for audit log
    if (isNearMe) return NEAR_ME_RADIUS;  // near me pressed
    return MUNICIPAL_RADIUS;              // always default to municipal scope
  };

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      let url = `/api/complaints/public?page=${page}&limit=10&sort=${sort}`;
      if (category !== 'All') url += `&category=${encodeURIComponent(category)}`;
      if (status !== 'All') url += `&status=${encodeURIComponent(status)}`;
      if (isAuditLog) url += '&audit=true';

      // Apply geo-scope if we have user location AND are not in audit log
      const radius = getActiveRadius();
      if (userLocation && radius) {
        url += `&lat=${userLocation.lat}&lng=${userLocation.lng}&radius=${radius}`;
      }

      const res = await request(url);
      if (res.success) {
        setComplaints(res.data);
        if (res.pagination) {
          setTotalPages(res.pagination.pages || Math.ceil(res.pagination.total / 10));
        }
      }
    } catch (error) {
      // Silently handled — loading state will show
    } finally {
      setLoading(false);
    }
  }, [page, category, status, sort, isAuditLog, isNearMe, userLocation, request]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleCardClick = (id) => {
    navigate(user?.slug ? `/${user.slug}/complaints/${id}` : `/complaints/${id}`);
  };

  // Dynamic subtitle
  const getSubtitle = () => {
    if (isAuditLog) return 'Transparent record of all rejected and closed complaints.';
    if (!userLocation)  return 'Showing all public complaints (enable location for local results).';
    if (isNearMe)       return 'Hyperlocal view — complaints within 5km of your position.';
    return 'Showing complaints within your Municipal Corporation (25km radius).';
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {isAuditLog ? 'Public Audit Log' : 'Public Feed'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {getSubtitle()}
          </p>
        </div>

        {/* View toggles */}
        <div className="flex flex-col gap-3 md:items-end">
          {/* Active vs Audit Log */}
          <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
              onClick={() => { setIsAuditLog(false); setPage(1); }}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${!isAuditLog ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              Active Feed
            </button>
            <button
              onClick={() => { setIsAuditLog(true); setPage(1); }}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${isAuditLog ? 'bg-amber-600 text-white' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              Audit Log (Rejected/Closed)
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Near Me Toggle */}
            {!isAuditLog && userLocation && (
              <button
                onClick={() => { setIsNearMe(!isNearMe); setPage(1); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${isNearMe ? 'bg-green-600 text-white border-green-600 hover:bg-green-700' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              >
                <MapPin className="w-4 h-4" />
                Near Me (5km)
              </button>
            )}

            {/* List vs Map */}
            <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden w-fit">
              <button
                onClick={() => setView('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              >
                <List className="w-4 h-4" />
                List
              </button>
              <button
                onClick={() => setView('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${view === 'map' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              >
                <MapIcon className="w-4 h-4" />
                Map
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Geolocated helper bubble */}
      {userLocation && isNearMe && !isAuditLog && (
        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm px-4 py-2 rounded-lg border border-blue-100 dark:border-blue-800 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Showing complaints strictly within a 5km radius of your current location.
        </div>
      )}

      {/* Filters & Sort */}
      <div className="flex flex-col sm:flex-row gap-4 glass-card p-4">
        <div className="w-full sm:w-48">
          <Select value={category} onValueChange={(val) => { setCategory(val); setPage(1); }}>
            <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-48">
          <Select value={status} onValueChange={(val) => { setStatus(val); setPage(1); }}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-56 ml-auto">
          <Select value={sort} onValueChange={(val) => { setSort(val); setPage(1); }}>
            <SelectTrigger><SelectValue placeholder="Sort By" /></SelectTrigger>
            <SelectContent>
              {SORTS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-10 text-gray-500">
          <Loader2 className="h-6 w-6 animate-spin mr-2 text-blue-600" />
          Loading complaints...
        </div>
      ) : view === 'map' ? (
        <MapView complaints={complaints} onViewComplaint={handleCardClick} />
      ) : (
        <>
          <div className="space-y-4">
            {complaints.length === 0 ? (
              <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-gray-500">No public complaints found matching your filters.</p>
              </div>
            ) : (
              complaints.map(complaint => (
                <Card
                  key={complaint._id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleCardClick(complaint._id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg line-clamp-1">{complaint.title}</CardTitle>
                      <Badge variant={
                        complaint.status === 'Resolved' ? 'success' :
                          complaint.status === 'In Progress' ? 'warning' : 'default'
                      }>
                        {complaint.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2 text-sm text-gray-600 dark:text-gray-300">
                    <p className="line-clamp-2 mb-3">{complaint.description}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Tag className="w-3 h-3" /> {complaint.category}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {typeof complaint.location === 'object' ? complaint.location.address : complaint.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(complaint.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 border-t mt-2 flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">Priority Score:</span> {complaint.communityPriority?.score || 0}
                    </div>
                    <UpvoteButton
                      complaintId={complaint._id}
                      initialCount={complaint.upvotes?.count || 0}
                      initialHasUpvoted={complaint.hasUserSupported || false}
                      disabled={['Resolved', 'Closed', 'Rejected'].includes(complaint.status)}
                    />
                  </CardFooter>
                </Card>
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PublicFeed;
