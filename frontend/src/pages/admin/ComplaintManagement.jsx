import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/Dialog';
import { 
  Search, Filter, Eye, Edit, Trash2, Download, FileText, Clock, CheckCircle, AlertCircle, Loader2, MoreHorizontal
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import useComplaintManagement from '@/hooks/useComplaintManagement';

const ComplaintManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    complaints, loading, error, refetch, updateComplaintStatus, deleteComplaint, stats
  } = useComplaintManagement();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState({});
  const [complaintToDelete, setComplaintToDelete] = useState(null);
  
  const filteredComplaints = useMemo(() => {
    return (complaints || []).filter(c => {
      const searchMatch = searchTerm === '' || 
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.citizenId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.department?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = statusFilter === 'all' || c.status === statusFilter;
      const priorityMatch = priorityFilter === 'all' || c.priority === priorityFilter;
      return searchMatch && statusMatch && priorityMatch;
    });
  }, [complaints, searchTerm, statusFilter, priorityFilter]);

  const handleStatusUpdate = async (complaintId, newStatus) => {
    setActionLoading(prev => ({ ...prev, [complaintId]: true }));
    const result = await updateComplaintStatus(complaintId, newStatus);
    if (result.success) {
      toast({ title: 'Success', description: 'Complaint status updated.' });
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
    setActionLoading(prev => ({ ...prev, [complaintId]: false }));
  };

  const handleDelete = async () => {
    if (!complaintToDelete) return;
    setActionLoading(prev => ({ ...prev, [complaintToDelete._id]: true }));
    const result = await deleteComplaint(complaintToDelete._id);
    if (result.success) {
      toast({ title: 'Success', description: 'Complaint deleted successfully.' });
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
    setActionLoading(prev => ({ ...prev, [complaintToDelete._id]: false }));
    setComplaintToDelete(null);
  };
  
  const getStatusVariant = (status) => ({ 'Submitted': 'secondary', 'In Progress': 'default', 'Resolved': 'outline', 'Closed': 'destructive' }[status] || 'secondary');
  const getPriorityColor = (priority) => ({ 'High': 'bg-red-100 text-red-800', 'Medium': 'bg-yellow-100 text-yellow-800', 'Low': 'bg-green-100 text-green-800' }[priority] || 'bg-gray-100');
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
            <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All Statuses</SelectItem><SelectItem value="Submitted">Submitted</SelectItem><SelectItem value="In Progress">In Progress</SelectItem><SelectItem value="Resolved">Resolved</SelectItem><SelectItem value="Closed">Closed</SelectItem></SelectContent></Select>
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
          {filteredComplaints.map(c => (
            <Card key={c._id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-4 mb-2">
                      <Badge className={getPriorityColor(c.priority)}>{c.priority}</Badge>
                      <Badge variant={getStatusVariant(c.status)}>{c.status}</Badge>
                    </div>
                    <h3 className="font-semibold text-lg">{c.title}</h3>
                    <p className="text-sm text-gray-500">In <span className="font-medium text-gray-700">{c.department?.name || 'N/A'}</span> by <span className="font-medium text-gray-700">{c.citizenId?.name || 'N/A'}</span> on {formatDate(c.createdAt)}</p>
                  </div>
                  <Dialog open={complaintToDelete?._id === c._id} onOpenChange={() => setComplaintToDelete(null)}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={actionLoading[c._id]}>
                          {actionLoading[c._id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => handleStatusUpdate(c._id, 'In Progress')}>Mark In Progress</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleStatusUpdate(c._id, 'Resolved')}>Mark Resolved</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleStatusUpdate(c._id, 'Closed')}>Mark Closed</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => navigate(`/admin/complaints/${c._id}/assign`)}>Assign Worker</DropdownMenuItem>
                        <DialogTrigger asChild>
                           <DropdownMenuItem className="text-red-500" onSelect={() => setComplaintToDelete(c)}>Delete</DropdownMenuItem>
                        </DialogTrigger>
                      </DropdownMenuContent>
                    </DropdownMenu>
                     <DialogContent>
                        <DialogHeader><DialogTitle>Delete Complaint?</DialogTitle><DialogDescription>Permanently delete "{complaintToDelete?.title}". This cannot be undone.</DialogDescription></DialogHeader>
                        <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button variant="destructive" onClick={handleDelete} loading={actionLoading[complaintToDelete?._id]}>Confirm Delete</Button></DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ComplaintManagement;
