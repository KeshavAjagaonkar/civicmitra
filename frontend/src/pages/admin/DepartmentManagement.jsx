import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/Table';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { MoreHorizontal, PlusCircle, Loader2, AlertTriangle, Edit, Trash2, Building } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import useApi from '@/hooks/useApi';

const DepartmentManagement = () => {
  const { request, isLoading: isApiLoading } = useApi();
  const { toast } = useToast();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState(null); // For editing or deleting

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await request('/api/departments');
      if (response.success) {
        setDepartments(response.data);
      }
    } catch (err) {
      setError(err.message);
      toast({ title: "Error", description: "Failed to fetch departments.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenModal = (department = null) => {
    setCurrentDepartment(department ? { ...department } : { name: '', description: '' });
    setIsModalOpen(true);
  };

  const handleSaveDepartment = async () => {
    const isEditing = currentDepartment?._id;
    const url = isEditing ? `/api/departments/${currentDepartment._id}` : '/api/departments';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await request(url, { method, body: currentDepartment });
      if (response.success) {
        toast({ title: 'Success', description: `Department ${isEditing ? 'updated' : 'created'} successfully.` });
        setIsModalOpen(false);
        fetchDepartments(); // Refresh the list
      }
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };
  
  const handleDeleteDepartment = async () => {
    if (!currentDepartment?._id) return;

    try {
      await request(`/api/departments/${currentDepartment._id}`, { method: 'DELETE' });
      toast({ title: 'Success', description: 'Department deleted successfully.' });
      setIsDeleteConfirmOpen(false);
      fetchDepartments(); // Refresh the list
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Department Management</h1>
        <Button onClick={() => handleOpenModal()}><PlusCircle className="mr-2 h-4 w-4" /> Add Department</Button>
      </div>

      <Card className="glass-card overflow-x-auto">
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div>
          ) : error ? (
            <div className="text-center py-12 text-red-600"><AlertTriangle className="mx-auto w-8 h-8 mb-2" />Error: {error}</div>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {departments.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="text-center py-12">No departments found. Add one to get started.</TableCell></TableRow>
                ) : (
                  departments.map((dept) => (
                    <TableRow key={dept._id}>
                      <TableCell className="font-medium">{dept.name}</TableCell>
                      <TableCell className="max-w-md truncate">{dept.description}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => handleOpenModal(dept)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500" onSelect={() => { setCurrentDepartment(dept); setIsDeleteConfirmOpen(true); }}>
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Department Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentDepartment?._id ? 'Edit' : 'Create'} Department</DialogTitle>
            <DialogDescription>Fill in the details for the department.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Department Name</Label>
              <Input id="name" value={currentDepartment?.name || ''} onChange={e => setCurrentDepartment({...currentDepartment, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={currentDepartment?.description || ''} onChange={e => setCurrentDepartment({...currentDepartment, description: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSaveDepartment} loading={isApiLoading}>{currentDepartment?._id ? 'Save Changes' : 'Create Department'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete the <span className="font-bold">{currentDepartment?.name}</span> department. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button variant="destructive" onClick={handleDeleteDepartment} loading={isApiLoading}>Delete Department</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepartmentManagement;
