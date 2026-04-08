import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/Dialog';
import {
  Search, Filter, Eye, Download, Loader2, MoreHorizontal, Sparkles, AlertTriangle, Ban
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import useComplaintManagement from '@/hooks/useComplaintManagement';
import { VALID_TRANSITIONS } from '@/lib/constants';

const ComplaintManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    complaints, loading, error, refetch, updateComplaintStatus, stats
  } = useComplaintManagement();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState({});

  // State for Reject as Spam dialog
  const [spamTarget, setSpamTarget] = useState(null);   // the complaint to reject
  const [spamReason, setSpamReason] = useState('');
  
  const filteredComplaints = useMemo(() => {
    return (complaints || []).filter(c => {
      const searchMatch = searchTerm === '' || 
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.citizenId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.department?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = statusFilter === 'all' || c.status === statusFilter;
      const priorityMatch = priorityFilter === 'all' || c.priority === priorityFilter;
      return searchMatch && statusMatch && priorityMatch;
    });
  }, [complaints, searchTerm, statusFilter, priorityFilter]);

  // Generic status update — validates against VALID_TRANSITIONS
  const handleStatusUpdate = async (complaint, newStatus) => {
    const allowed = VALID_TRANSITIONS[complaint.status] || [];
    if (!allowed.includes(newStatus)) {
      toast({
        title: 'Invalid Transition',
        description: `Cannot move from "${complaint.status}" to "${newStatus}".`,
        variant: 'destructive',
      });
      return;
    }
    setActionLoading(prev => ({ ...prev, [complaint._id]: true }));
    const result = await updateComplaintStatus(complaint._id, newStatus);
    if (result.success) {
      toast({ title: 'Success', description: `Status updated to "${newStatus}".` });
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
    setActionLoading(prev => ({ ...prev, [complaint._id]: false }));
  };

  // Reject as Spam — requires a reason (≥10 chars), calls PATCH /status with Rejected
  const handleRejectAsSpam = async () => {
    if (!spamTarget) return;
    if (!spamReason || spamReason.trim().length < 10) {
      toast({ title: 'Reason required', description: 'Please enter at least 10 characters.', variant: 'destructive' });
      return;
    }

    // Only possible if 'Rejected' is a valid next state
    const allowed = VALID_TRANSITIONS[spamTarget.status] || [];
    if (!allowed.includes('Rejected')) {
      toast({
        title: 'Cannot Reject',
        description: `"${spamTarget.status}" complaints cannot be rejected (terminal state).`,
        variant: 'destructive',
      });
      setSpamTarget(null);
      setSpamReason('');
      return;
    }

    setActionLoading(prev => ({ ...prev, [spamTarget._id]: true }));
    const result = await updateComplaintStatus(spamTarget._id, 'Rejected', spamReason.trim());
    if (result.success) {
      toast({ title: 'Complaint Rejected', description: 'The complaint has been marked as rejected.' });
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
    setActionLoading(prev => ({ ...prev, [spamTarget._id]: false }));
    setSpamTarget(null);
    setSpamReason('');
  };
  
  const getStatusVariant = (status) => ({ 'Submitted': 'secondary', 'In Progress': 'default', 'Resolved': 'outline', 'Closed': 'destructive' }[status] || 'secondary');
  const getPriorityColor = (priority) => ({
    'High': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    'Medium': 'bg-yellow-100 text-yellow-800 dark:bg-amber-900/20 dark:text-amber-400',
    'Low': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
  }[priority] || 'bg-gray-100 dark:bg-gray-800');
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">System-Wide Complaints</h1>
        <Button onClick={() => {}} disabled><Download className="w-4 h-4 mr-2" /> Export Data</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        <Card className="kpi-card-solid"><CardHeader><CardTitle className="text-sm font-medium">Total</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{stats.total}</div></CardContent></Card>
        <Card className="kpi-card-solid"><CardHeader><CardTitle className="text-sm font-medium">Submitted</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{stats.submitted}</div></CardContent></Card>
        <Card className="kpi-card-solid"><CardHeader><CardTitle className="text-sm font-medium">In Progress</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{stats.inProgress}</div></CardContent></Card>
        <Card className="kpi-card-solid"><CardHeader><CardTitle className="text-sm font-medium">Resolved</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{stats.resolved}</div></CardContent></Card>
        <Card className="kpi-card-solid"><CardHeader><CardTitle className="text-sm font-medium">Closed</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{stats.closed}</div></CardContent></Card>
      </div>

      <Card className="glass-card">
        <CardHeader><CardTitle className="flex items-center gap-2"><Filter /> Filter Complaints</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Input placeholder="Search by title, citizen, dept..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="md:col-span-2" />
            <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All Statuses</SelectItem><SelectItem value="Submitted">Submitted</SelectItem><SelectItem value="Under Review">Under Review</SelectItem><SelectItem value="Needs Info">Needs Info</SelectItem><SelectItem value="In Progress">In Progress</SelectItem><SelectItem value="Resolved">Resolved</SelectItem><SelectItem value="Closed">Closed</SelectItem><SelectItem value="Rejected">Rejected</SelectItem></SelectContent></Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All Priorities</SelectItem><SelectItem value="High">High</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Low">Low</SelectItem></SelectContent></Select>
          </div>
        </CardContent>
      </Card>
      
      {loading ? (
        <div className="text-center py-12"><Loader2 className="mx-auto h-12 w-12 animate-spin" /></div>
      ) : error ? (
        <div className="text-center py-12 text-red-500"><AlertTriangle className="mx-auto h-12 w-12" /><p className="mt-4">{error}</p></div>
      ) : (
        <div className="space-y-4">
          {filteredComplaints.map(c => {
            const validNextStates = VALID_TRANSITIONS[c.status] || [];
            const isTerminal = validNextStates.length === 0;

            return (
              <Card key={c._id} className="glass-card mb-4">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <Badge className={getPriorityColor(c.priority)}>{c.priority}</Badge>
                        <Badge variant={getStatusVariant(c.status)}>{c.status}</Badge>
                        {isTerminal && (
                          <span className="text-xs text-gray-400 italic">Terminal</span>
                        )}
                      </div>
                      <h3
                        className="font-semibold text-lg hover:text-blue-600 cursor-pointer transition-colors"
                        onClick={() => navigate(`/admin/complaints/${c._id}`)}
                      >
                        {c.title}
                      </h3>
                      {c.aiSummary?.shortSummary && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 flex items-start gap-1 mt-1">
                          <Sparkles className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                          <span className="italic">{c.aiSummary.shortSummary}</span>
                        </p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">In <span className="font-medium text-gray-700">{c.department?.name || 'N/A'}</span> by <span className="font-medium text-gray-700">{c.citizenId?.name || 'N/A'}</span> on {formatDate(c.createdAt)}</p>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={actionLoading[c._id]}>
                          {actionLoading[c._id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => navigate(`/admin/complaints/${c._id}`)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>

                        {/* Dynamically show only valid next states — never hardcoded */}
                        {validNextStates
                          .filter(s => s !== 'Rejected') // Rejection has its own dedicated action below
                          .map(nextStatus => (
                            <DropdownMenuItem
                              key={nextStatus}
                              onSelect={() => handleStatusUpdate(c, nextStatus)}
                            >
                              Mark {nextStatus}
                            </DropdownMenuItem>
                          ))
                        }

                        <DropdownMenuItem onSelect={() => navigate(`/admin/complaints/${c._id}/assign`)}>
                          Assign Worker
                        </DropdownMenuItem>

                        {/* Reject as Spam — only available when Rejected is a valid transition */}
                        {validNextStates.includes('Rejected') && (
                          <DropdownMenuItem
                            className="text-red-500 focus:text-red-600"
                            onSelect={() => { setSpamTarget(c); setSpamReason(''); }}
                          >
                            <Ban className="w-4 h-4 mr-2" />
                            Reject / Mark Spam
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Reject as Spam dialog — separate from the complaint list loop to avoid nested Dialog issues */}
      <Dialog open={!!spamTarget} onOpenChange={(open) => { if (!open) { setSpamTarget(null); setSpamReason(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ban className="w-5 h-5 text-red-500" />
              Reject Complaint
            </DialogTitle>
            <DialogDescription>
              Rejecting <strong>"{spamTarget?.title}"</strong>. The complaint will be marked as Rejected and the citizen will be notified. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <label className="block text-sm font-medium mb-1">
              Reason <span className="text-red-500">*</span>
              <span className="text-gray-400 font-normal"> (min 10 characters)</span>
            </label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-red-400 focus:outline-none resize-none"
              rows={3}
              placeholder="e.g. Duplicate complaint, outside jurisdiction, spam submission..."
              value={spamReason}
              onChange={e => setSpamReason(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">{spamReason.trim().length}/10 minimum characters</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleRejectAsSpam}
              disabled={spamReason.trim().length < 10 || actionLoading[spamTarget?._id]}
            >
              {actionLoading[spamTarget?._id] ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Ban className="h-4 w-4 mr-2" />}
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComplaintManagement;
