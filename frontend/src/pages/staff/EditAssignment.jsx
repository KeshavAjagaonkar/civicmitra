import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/use-toast';
import useApi from '@/hooks/useApi';
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import AssignmentUpdateForm from '@/components/AssignmentUpdateForm';

const EditAssignment = () => {
  const { id: complaintId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { request, isLoading } = useApi();

  const [complaint, setComplaint] = useState(null);

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const complaintRes = await request(`/api/complaints/${complaintId}`);
        if (complaintRes.success) {
          setComplaint(complaintRes.data);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load complaint data.",
          variant: "destructive"
        });
      }
    };
    fetchComplaint();
  }, [complaintId, request, toast]);

  const handleUpdateSuccess = () => {
    navigate('/staff/complaints');
  };

  if (isLoading && !complaint) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-8 w-8 text-red-500" />
        <p className="mt-2">Complaint not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
      <div className="max-w-lg mx-auto">
        <AssignmentUpdateForm
          complaint={complaint}
          onUpdateSuccess={handleUpdateSuccess}
          onCancel={() => navigate(-1)}
        />
      </div>
    </div>
  );
};

export default EditAssignment;
