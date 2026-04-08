import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import ComplaintTimeline from '@/components/ComplaintTimeline';
import Chat from '@/components/Chat';
import { Button } from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import FormFieldBox from '@/components/FormFieldBox';
import useApi from '@/hooks/useApi';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Star, Sparkles, AlertCircle, MapPin, TrendingUp } from 'lucide-react';
import { STATUS_BADGE_VARIANT, PRIORITY_CLASSES, VALID_TRANSITIONS } from '@/lib/constants';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/Dialog';
import { useAuth } from '@/hooks/useAuth';
import 'leaflet/dist/leaflet.css';

// Embedded location map — lazy loads Leaflet only when coords exist
const LocationMap = ({ complaint }) => {
  const [MapComponents, setMapComponents] = useState(null);

  const coords = complaint.location?.coordinates;
  const hasCoords = Array.isArray(coords) && coords.length === 2 &&
    typeof coords[0] === 'number' && typeof coords[1] === 'number';

  useEffect(() => {
    if (!hasCoords) return;
    Promise.all([import('react-leaflet'), import('leaflet')]).then(([rl, L]) => {
      delete L.default.Icon.Default.prototype._getIconUrl;
      L.default.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      setMapComponents(rl);
    });
  }, [hasCoords]);

  if (!hasCoords) return null;

  const [lng, lat] = coords;

  if (!MapComponents) {
    return (
      <Card className="glass-card mt-4">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><MapPin className="w-4 h-4" />Location</CardTitle></CardHeader>
        <CardContent className="h-36 flex items-center justify-center text-gray-400 text-sm">Loading map…</CardContent>
      </Card>
    );
  }

  const { MapContainer, TileLayer, Marker } = MapComponents;

  return (
    <Card className="glass-card mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />Location
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 rounded-b-lg overflow-hidden" style={{ height: '192px' }}>
        <MapContainer
          center={[lat, lng]}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
          zoomControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[lat, lng]} />
        </MapContainer>
      </CardContent>
    </Card>
  );
};

// statusVariant and priorityStyles now sourced from @/lib/constants

const ComplaintDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { request, isLoading } = useApi();
  const { toast } = useToast();
  const [complaint, setComplaint] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('');
  const [assignedWorker, setAssignedWorker] = useState('');
  const [workers, setWorkers] = useState([]);
  const [feedback, setFeedback] = useState(null);

  const [selectedImage, setSelectedImage] = useState(null);
  const userRole = user?.role || 'citizen';

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const result = await request(`/api/complaints/${id}`);
        if (result.success) {
          setComplaint(result.data);
          setCurrentStatus(result.data.status);
          setAssignedWorker(result.data.workerId || 'unassigned');

          // Fetch feedback if complaint is resolved
          if (result.data.status === 'Resolved') {
            const feedbackResult = await request(`/api/feedback/${id}`);
            if (feedbackResult.success) {
              setFeedback(feedbackResult.data);
            }
          }
        }
      } catch (err) {
        toast({
          title: 'Failed to fetch complaint',
          description: err.message,
          variant: 'destructive'
        });
      }
    };

    if (id) {
      fetchComplaint();
    }
  }, [id, request, toast, userRole]);

  // Fetch workers after complaint is loaded
  useEffect(() => {
    if (complaint && (userRole === 'staff' || userRole === 'admin')) {
      const fetchWorkers = async () => {
        try {
          let endpoint = '/api/admin/users?role=worker';
          if (userRole === 'staff' && complaint?.department?._id) {
            endpoint += `&department=${complaint.department._id}`;
          }
          const result = await request(endpoint, 'GET');
          if (result.success) {
            setWorkers(result.data);
          }
        } catch (err) {
          // Silently handled — non-critical
        }
      };
      fetchWorkers();
    }
  }, [complaint, userRole, request]);

  const handleStatusChange = async (value) => {
    const rejectionReason = complaint._rejectionReason;
    if (value === 'Rejected' && (!rejectionReason || rejectionReason.trim().length < 10)) {
      toast({ title: 'Rejection reason required', description: 'Please enter a rejection reason (min 10 characters).', variant: 'destructive' });
      return;
    }
    try {
      const body = { status: value };
      if (value === 'Rejected') body.rejectionReason = rejectionReason.trim();
      const result = await request(`/api/complaints/${id}/status`, 'PATCH', body);
      if (result.success) {
        setCurrentStatus(value);
        setComplaint(prev => ({ ...prev, status: value, _rejectionReason: undefined }));
        toast({ title: 'Status updated', description: `Complaint is now "${value}".`, variant: 'success' });
      }
    } catch (err) {
      toast({ title: 'Failed to update status', description: err.message, variant: 'destructive' });
    }
  };

  const handleAppeal = async () => {
    if (!window.confirm("Are you sure you want to appeal this decision? You can only do this once.")) return;
    try {
      const result = await request(`/api/complaints/${id}/appeal`, 'POST', { reason: 'Citizen formally appealed the decision.' });
      if (result.success) {
        setCurrentStatus('Under Review');
        setComplaint(prev => ({ ...prev, status: 'Under Review', isAppealed: true }));
        toast({ title: 'Appeal Submitted', description: 'Your complaint is back under review.', variant: 'success' });
      }
    } catch (err) {
      toast({ title: 'Appeal Failed', description: err.message, variant: 'destructive' });
    }
  };

  const handleWorkerChange = async (value) => {
    try {
      const workerId = value === 'unassigned' ? null : value;
      const result = await request(`/api/complaints/${id}/assign-worker`, 'PATCH', {
        workerId: workerId
      });
      if (result.success) {
        setAssignedWorker(value);
        setComplaint(prev => ({ ...prev, workerId: workerId }));
        toast({
          title: workerId ? 'Worker assigned' : 'Worker unassigned',
          description: workerId ? 'Worker has been assigned successfully.' : 'Worker has been unassigned.',
          variant: 'success'
        });
      }
    } catch (err) {
      toast({
        title: 'Failed to assign worker',
        description: err.message,
        variant: 'destructive'
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading complaint details...</div>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Complaint not found</h3>
            <p className="text-gray-600">The complaint you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{complaint.title}</h1>
            <p className="text-gray-500">Complaint ID: {id}</p>
          </div>
        </div>
        {userRole === 'citizen' && complaint.status === 'Resolved' && !feedback && (
          <Button
            onClick={() => navigate(`/complaints/${id}/feedback`)}
            className="flex items-center gap-2"
          >
            <Star className="w-4 h-4" />
            Give Feedback
          </Button>
        )}
      </div>

      <div className={`grid gap-6 lg:gap-8 ${(() => {
        const currentUserId = (user?._id || user?.id || '').toString();
        const isOwner = complaint.citizenId && (complaint.citizenId._id || complaint.citizenId).toString() === currentUserId;
        const canChat = isOwner || userRole === 'staff' || userRole === 'admin' || (userRole === 'worker' && complaint.workerId && (complaint.workerId._id || complaint.workerId).toString() === currentUserId);
        return canChat ? 'lg:grid-cols-3' : 'lg:grid-cols-1 max-w-4xl';
      })()}`}>
        {/* Left Column: Details & Timeline */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* AI Summary Section */}
              {complaint.aiSummary && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 space-y-3">
                      <div>
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">AI Summary</h4>
                        <p className="text-sm text-blue-800 dark:text-blue-200">{complaint.aiSummary.shortSummary}</p>
                      </div>

                      {complaint.aiSummary.keyPoints && complaint.aiSummary.keyPoints.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-1">Key Points:</p>
                          <ul className="space-y-1">
                            {complaint.aiSummary.keyPoints.map((point, idx) => (
                              <li key={idx} className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                                <span className="text-blue-500 mt-0.5">•</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {complaint.aiSummary.extractedInfo?.urgency && (
                          <Badge variant="outline" className="text-xs border-blue-300 dark:border-blue-700">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {complaint.aiSummary.extractedInfo.urgency} Urgency
                          </Badge>
                        )}
                        {complaint.aiSummary.sentiment && complaint.aiSummary.sentiment !== 'Neutral' && (
                          <Badge variant="outline" className="text-xs border-blue-300 dark:border-blue-700">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {complaint.aiSummary.sentiment}
                          </Badge>
                        )}
                        {complaint.aiSummary.extractedInfo?.affectedArea && (
                          <Badge variant="outline" className="text-xs border-blue-300 dark:border-blue-700">
                            <MapPin className="w-3 h-3 mr-1" />
                            {complaint.aiSummary.extractedInfo.affectedArea}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <strong>Status:</strong>
                {(userRole === 'staff' || userRole === 'admin') ? (
                  // Terminal states have no valid transitions — show badge only
                  ['Rejected', 'Closed', 'Transferred'].includes(complaint.status) ? (
                    <Badge variant={STATUS_BADGE_VARIANT[complaint.status] || 'secondary'}>
                      {complaint.status}
                      {complaint.status === 'Transferred' && (
                        <span className="ml-1 text-xs opacity-70">(legacy)</span>
                      )}
                    </Badge>
                  ) : (
                    <Select value={currentStatus} onValueChange={handleStatusChange}>
                      <SelectTrigger className="w-[200px] glass-input">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {(VALID_TRANSITIONS[complaint.status] || []).map(nextStatus => (
                          <SelectItem key={nextStatus} value={nextStatus}>{nextStatus}</SelectItem>
                        ))}
                        {(VALID_TRANSITIONS[complaint.status] || []).length === 0 && (
                          <div className="px-3 py-2 text-xs text-gray-500">No transitions available</div>
                        )}
                      </SelectContent>
                    </Select>
                  )
                ) : userRole === 'worker' ? (
                  // Workers mark as Resolved through the Timeline below (with notes + proof photos)
                  // PATCH /status is staff/admin only — worker uses PUT /worker-update endpoint
                  <Badge variant={STATUS_BADGE_VARIANT[complaint.status] || 'secondary'}>{complaint.status}</Badge>
                ) : (
                  <Badge variant={STATUS_BADGE_VARIANT[complaint.status] || 'secondary'}>{complaint.status}</Badge>
                )}
              </div>
              {/* Citizen dispute / accept buttons — only shown when Resolved and user is the complaint owner */}
              {userRole === 'citizen' && complaint.status === 'Resolved' && (() => {
                const currentUserId = (user?._id || user?.id || '').toString();
                const isOwner = complaint.citizenId && (complaint.citizenId._id || complaint.citizenId).toString() === currentUserId;
                return isOwner ? (
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                      onClick={() => handleStatusChange('Closed')}
                    >
                      Accept &amp; Close
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                      onClick={() => handleStatusChange('Reopened')}
                    >
                      Dispute Resolution
                    </Button>
                  </div>
                ) : null;
              })()}

              {/* Citizen Appeal (One-Time) for Rejected/Closed */}
              {userRole === 'citizen' && ['Rejected', 'Closed'].includes(complaint.status) && !complaint.isAppealed && (() => {
                const currentUserId = (user?._id || user?.id || '').toString();
                const isOwner = complaint.citizenId && (complaint.citizenId._id || complaint.citizenId).toString() === currentUserId;
                return isOwner ? (
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={handleAppeal}
                    >
                      Appeal Rejection (One-Time)
                    </Button>
                  </div>
                ) : null;
              })()}
              
              {/* Rejection reason field — shown only when Rejected is selected by staff/admin */}
              {(userRole === 'staff' || userRole === 'admin') && currentStatus === 'Rejected' && (
                <div className="flex flex-col gap-1">
                  <strong className="text-sm">Rejection Reason <span className="text-red-500">*</span></strong>
                  <textarea
                    className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                    rows={2}
                    placeholder="Explain why this complaint is being rejected (min 10 characters)..."
                    value={complaint._rejectionReason || ''}
                    onChange={e => setComplaint(prev => ({ ...prev, _rejectionReason: e.target.value }))}
                  />
                </div>
              )}
              <div className="flex justify-between items-center">
                <strong>Priority:</strong>
                <Badge variant="outline" className={PRIORITY_CLASSES[complaint.priority]}>
                  {complaint.priority}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <strong>Department:</strong>
                <span>{complaint.department?.name || 'Pending Assignment'}</span>
              </div>
              {(userRole === 'staff' || userRole === 'admin') && (
                <div className="flex justify-between items-center">
                  <strong>Assigned Worker:</strong>
                  <Select value={assignedWorker} onValueChange={handleWorkerChange}>
                    <SelectTrigger className="w-[180px] glass-input">
                      <SelectValue placeholder="Assign worker" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {workers.map((worker) => (
                        <SelectItem key={worker._id} value={worker._id}>
                          {worker.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex justify-between">
                <strong>Date Filed:</strong>
                <span>{formatDate(complaint.createdAt)}</span>
              </div>
              <div>
                <strong>Description:</strong>
                <p className="text-gray-600 mt-1">{complaint.description}</p>
              </div>
              <div>
                <strong>Location:</strong>
                <p className="text-gray-600 mt-1">{typeof complaint.location === 'object' ? complaint.location.address : complaint.location}</p>
              </div>
              <LocationMap complaint={complaint} />
              {complaint.attachments && complaint.attachments.length > 0 && (
                <div>
                  <strong>Attachments:</strong>
                  <div className="mt-2 space-y-2">
                    {complaint.attachments.map((attachment, index) => (<div key={index} className="flex items-center gap-2">                        <img src={attachment.url} alt={`Attachment ${index + 1}`} className="w-20 h-20 object-cover rounded-xl border-2 border-gray-200 cursor-pointer hover:scale-105 transition-transform hover:shadow-lg" onClick={() => setSelectedImage(attachment.url)} />                      </div>))}
                  </div>
                </div>
              )}
              {feedback && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <strong>Citizen Feedback:</strong>
                  <div className="mt-2 space-y-2 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Rating:</span>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, index) => (
                          <Star
                            key={index}
                            className={`w-4 h-4 ${index < feedback.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300 dark:text-gray-600'
                              }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        ({feedback.rating}/5)
                      </span>
                    </div>
                    {feedback.comments && (
                      <div>
                        <span className="font-medium">Comments:</span>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">{feedback.comments}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <ComplaintTimeline
            isEditable={userRole === 'worker'}
            complaintId={complaint._id}
            timeline={complaint.timeline}
            complaintStatus={complaint.status}
          />
        </div>

        {/* Right Column: Chat — only for authorized participants */}
        {(() => {
          const currentUserId = (user?._id || user?.id || '').toString();
          const isOwner = complaint.citizenId && (complaint.citizenId._id || complaint.citizenId).toString() === currentUserId;
          const isAssignedStaff = userRole === 'staff';
          const isAssignedWorker = userRole === 'worker' && complaint.workerId && (complaint.workerId._id || complaint.workerId).toString() === currentUserId;
          const isAdmin = userRole === 'admin';
          const canChat = isOwner || isAssignedStaff || isAssignedWorker || isAdmin;

          return canChat ? (
            <div className="lg:col-span-1">
              <Chat complaintId={complaint._id} />
            </div>
          ) : null;
        })()}
      </div>

      {/* Image Preview Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl glass-card">
          <DialogTitle>Attachment Preview</DialogTitle>
          {selectedImage && (
            <div className="flex items-center justify-center">
              <img
                src={selectedImage}
                alt="Full size attachment"
                className="max-w-full max-h-[80vh] object-contain rounded-xl"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComplaintDetails;
