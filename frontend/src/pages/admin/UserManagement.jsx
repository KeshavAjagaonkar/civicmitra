import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/Table';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/DropdownMenu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { MoreHorizontal, PlusCircle, Loader2, AlertTriangle, Trash2, Edit, UserCheck, Wrench, User } from 'lucide-react';
import { useUsers } from '@/hooks/useUniversalApi';
import useUserManagement from '@/hooks/useUserManagement';
import { useToast } from '@/components/ui/use-toast';
import useApi from '@/hooks/useApi';

const roleVariant = {
  admin: 'destructive',
  staff: 'secondary',
  worker: 'outline',
  citizen: 'default'
};

const UserManagement = () => {
  const { data: users, loading, error, refetch } = useUsers();
  const { deleteUser, updateUserRole, createUser } = useUserManagement();
  const { toast } = useToast();
  const { request } = useApi();
  
  const [actionLoading, setActionLoading] = useState({});
  const [userToDelete, setUserToDelete] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [departments, setDepartments] = useState([]);

  // Fetch departments for the create user form
  React.useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await request('/api/departments');
        if (res.success) setDepartments(res.data);
      } catch (err) {
        console.error("Failed to fetch departments", err);
      }
    };
    fetchDepartments();
  }, [request]);

  const handleDelete = async () => {
    if (!userToDelete) return;

    setActionLoading(prev => ({ ...prev, [userToDelete._id]: true }));
    const result = await deleteUser(userToDelete._id);
    setActionLoading(prev => ({ ...prev, [userToDelete._id]: false }));
    
    if (result.success) {
      toast({ title: 'Success', description: 'User deleted successfully.' });
      refetch();
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
    setUserToDelete(null); // Close dialog
  };

  const handleRoleChange = async (userId, newRole) => {
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    const result = await updateUserRole(userId, newRole);
    setActionLoading(prev => ({ ...prev, [userId]: false }));

    if (result.success) {
      toast({ title: 'Success', description: 'User role updated successfully.' });
      refetch();
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };
  
  // State and handler for the Create User form
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'staff', department: '' });
  const handleCreateUser = async () => {
    setActionLoading(prev => ({ ...prev, create: true }));
    const result = await createUser(newUser);
    setActionLoading(prev => ({ ...prev, create: false }));

    if (result.success) {
      toast({ title: 'User Created', description: 'The new user account has been created.' });
      setIsCreateModalOpen(false);
      setNewUser({ name: '', email: '', password: '', role: 'staff', department: '' });
      refetch();
    } else {
      toast({ title: 'Creation Failed', description: result.error, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Add New User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User Account</DialogTitle>
              <DialogDescription>Create a new Staff or Worker account and assign them to a department.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2"><Label htmlFor="name">Full Name</Label><Input id="name" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} /></div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={newUser.role === 'worker' ? "worker@gmail.com" : "email@example.com"}
                  value={newUser.email}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                />
                {newUser.role === 'worker' && (
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 flex items-start gap-1">
                    <span className="font-semibold">⚠️ Important:</span>
                    <span>Workers MUST use a real email (Gmail, Yahoo, Outlook, etc.). Dummy emails are not allowed for workers.</span>
                  </p>
                )}
                {newUser.role === 'staff' && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Staff can use dummy emails (e.g., staff@civicmitra.com) or real emails.
                  </p>
                )}
                {newUser.email.endsWith('@civicmitra.com') && newUser.role === 'worker' && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-semibold">
                    ❌ Error: Workers cannot use @civicmitra.com emails. Please use a real email address.
                  </p>
                )}
              </div>
              <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} /></div>
              <div className="space-y-2"><Label htmlFor="role">Role</Label>
                <Select value={newUser.role} onValueChange={role => setNewUser({...newUser, role})}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent><SelectItem value="staff">Staff</SelectItem><SelectItem value="worker">Worker</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label htmlFor="department">Department</Label>
                <Select value={newUser.department} onValueChange={department => setNewUser({...newUser, department})}>
                  <SelectTrigger><SelectValue placeholder="Select a department"/></SelectTrigger>
                  <SelectContent>{departments.map(d => <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button onClick={handleCreateUser} loading={actionLoading.create} loadingText="Creating...">Create User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass-card overflow-x-auto">
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div>
          ) : error ? (
            <div className="text-center py-12 text-red-600"><AlertTriangle className="mx-auto w-8 h-8 mb-2" />Error: {error}</div>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Department</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {!users || users.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-12">No users found.</TableCell></TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell><Badge variant={roleVariant[user.role]}>{user.role}</Badge></TableCell>
                      <TableCell>{user.department?.name || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <Dialog open={userToDelete?._id === user._id} onOpenChange={() => setUserToDelete(null)}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" disabled={actionLoading[user._id]}>
                                {actionLoading[user._id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => handleRoleChange(user._id, 'staff')}>
                                <UserCheck className="mr-2 h-4 w-4" /> Make Staff
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => handleRoleChange(user._id, 'worker')}>
                               <Wrench className="mr-2 h-4 w-4" /> Make Worker
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => handleRoleChange(user._id, 'citizen')}>
                                <User className="mr-2 h-4 w-4" /> Make Citizen
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DialogTrigger asChild>
                                <DropdownMenuItem className="text-red-500" onSelect={() => setUserToDelete(user)}>
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete User
                                </DropdownMenuItem>
                              </DialogTrigger>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Are you sure?</DialogTitle>
                              <DialogDescription>This will permanently delete the user <span className="font-bold">{userToDelete?.name}</span>. This action cannot be undone.</DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                              <Button variant="destructive" onClick={handleDelete} loading={actionLoading[userToDelete?._id]}>Delete User</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
