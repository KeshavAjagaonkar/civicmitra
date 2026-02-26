import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/Table';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { MoreHorizontal, PlusCircle, Loader2, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import useApi from '@/hooks/useApi';
import { COMPLAINT_CATEGORIES } from '@/lib/constants';

const DepartmentManagement = () => {
  const { request, isLoading: isApiLoading } = useApi();
  const { toast } = useToast();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState(null);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await request('/api/departments');
      if (response.success) {
        setDepartments(response.data);
      }
    } catch (err) {
      setError(err.message);
      toast({ title: 'Error', description: 'Failed to fetch departments.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenModal = (department = null) => {
    setCurrentDepartment(
      department
        ? { ...department, categories: department.categories || [] }
        : { name: '', description: '', categories: [] }
    );
    setIsModalOpen(true);
  };

  const toggleCategory = (cat) => {
    setCurrentDepartment(prev => {
      const cats = prev.categories || [];
      return {
        ...prev,
        categories: cats.includes(cat) ? cats.filter(c => c !== cat) : [...cats, cat],
      };
    });
  };

  const handleSaveDepartment = async () => {
    const isEditing = currentDepartment?._id;
    const url = isEditing ? `/api/departments/${currentDepartment._id}` : '/api/departments';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      // Correct useApi signature: request(url, method, body)
      const response = await request(url, method, currentDepartment);
      if (response.success) {
        toast({ title: 'Success', description: `Department ${isEditing ? 'updated' : 'created'} successfully.` });
        setIsModalOpen(false);
        fetchDepartments();
      }
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleDeleteDepartment = async () => {
    if (!currentDepartment?._id) return;
    try {
      await request(`/api/departments/${currentDepartment._id}`, 'DELETE');
      toast({ title: 'Success', description: 'Department deleted successfully.' });
      setIsDeleteConfirmOpen(false);
      fetchDepartments();
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Department Management</h1>
          <p className="text-sm text-gray-500 mt-1">Assign complaint categories to departments to control AI routing.</p>
        </div>
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
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Handles Categories</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-12">No departments found. Add one to get started.</TableCell></TableRow>
                ) : (
                  departments.map((dept) => (
                    <TableRow key={dept._id}>
                      <TableCell className="font-medium">{dept.name}</TableCell>
                      <TableCell className="max-w-xs truncate text-gray-500">{dept.description || '—'}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(dept.categories || []).length === 0 ? (
                            <span className="text-xs text-amber-600 font-medium">No categories — complaints won't auto-route here</span>
                          ) : (
                            dept.categories.map(cat => (
                              <Badge key={cat} variant="outline" className="text-xs">{cat}</Badge>
                            ))
                          )}
                        </div>
                      </TableCell>
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{currentDepartment?._id ? 'Edit' : 'Create'} Department</DialogTitle>
            <DialogDescription>Fill in the details. Categories control which complaints auto-route here.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Department Name</Label>
              <Input id="name" value={currentDepartment?.name || ''} onChange={e => setCurrentDepartment({ ...currentDepartment, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={currentDepartment?.description || ''} onChange={e => setCurrentDepartment({ ...currentDepartment, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Handles Complaint Categories</Label>
              <p className="text-xs text-gray-500">AI auto-routing sends complaints of these types to this department.</p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {COMPLAINT_CATEGORIES.map(cat => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="accent-blue-600 w-4 h-4"
                      checked={(currentDepartment?.categories || []).includes(cat)}
                      onChange={() => toggleCategory(cat)}
                    />
                    <span className="text-sm">{cat}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSaveDepartment} disabled={isApiLoading}>
              {currentDepartment?._id ? 'Save Changes' : 'Create Department'}
            </Button>
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
            <Button variant="destructive" onClick={handleDeleteDepartment} disabled={isApiLoading}>Delete Department</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepartmentManagement;
