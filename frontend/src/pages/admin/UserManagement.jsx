import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/Table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/DropdownMenu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { MoreHorizontal, PlusCircle, Loader2, AlertTriangle, UserX, UserCheck, Wrench, User, ShieldOff, RefreshCw, Users } from 'lucide-react';
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

// Only Staff ↔ Worker transitions are allowed.
// Citizens need proper dept onboarding (Create User). No demotion to citizen.
const VALID_ROLE_TRANSITIONS = {
  staff:   [{ role: 'worker', label: 'Transfer to Worker', icon: Wrench }],
  worker:  [{ role: 'staff',  label: 'Transfer to Staff',  icon: UserCheck }],
  citizen: [], // no transitions — use Create User form to onboard as staff/worker
};

const getRoleIcon = (role) => {
  switch (role) {
    case 'staff': return <UserCheck className="w-3 h-3 mr-1" />;
    case 'worker': return <Wrench className="w-3 h-3 mr-1" />;
    case 'citizen': return <User className="w-3 h-3 mr-1" />;
    default: return null;
  }
};

const UserManagement = () => {
  const { data: users, loading, error, refetch } = useUsers();
  const { deleteUser, updateUserRole, createUser } = useUserManagement();
  const { toast } = useToast();
  const { request } = useApi();

  const [actionLoading, setActionLoading] = useState({});
  const [userToDeactivate, setUserToDeactivate] = useState(null);
  const [roleTransferPending, setRoleTransferPending] = useState(null); // { user, newRole, label }
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  React.useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await request('/api/departments');
        if (res.success) setDepartments(res.data);
      } catch (err) {
        console.error('Failed to fetch departments', err);
      }
    };
    fetchDepartments();
  }, [request]);

  const handleDeactivate = async () => {
    if (!userToDeactivate) return;
    setActionLoading(prev => ({ ...prev, [userToDeactivate._id]: true }));
    const result = await deleteUser(userToDeactivate._id);
    setActionLoading(prev => ({ ...prev, [userToDeactivate._id]: false }));

    if (result.success) {
      toast({ title: 'Account Deactivated', description: `${userToDeactivate.name}'s account has been deactivated. They can no longer log in.` });
      refetch();
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
    setUserToDeactivate(null);
  };

  const handleReactivate = async (userId, userName) => {
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    try {
      const res = await request(`/api/admin/users/${userId}/reactivate`, 'PUT');
      if (res.success) {
        toast({ title: 'Account Reactivated', description: `${userName}'s account is now active again.` });
        refetch();
      }
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setActionLoading(prev => ({ ...prev, [userId]: false }));
  };

  // Step 1: Just store the intent — opens confirmation dialog
  const confirmRoleTransfer = (user, newRole, label) => {
    setRoleTransferPending({ user, newRole, label });
  };

  // Step 2: Actually execute after user confirms
  const executeRoleTransfer = async () => {
    if (!roleTransferPending) return;
    const { user, newRole } = roleTransferPending;
    setActionLoading(prev => ({ ...prev, [user._id]: true }));
    const result = await updateUserRole(user._id, newRole);
    setActionLoading(prev => ({ ...prev, [user._id]: false }));
    setRoleTransferPending(null);
    if (result.success) {
      toast({ title: 'Role Transferred', description: `${user.name} is now a ${newRole}.` });
      refetch();
    } else {
      toast({ title: 'Transfer Failed', description: result.error, variant: 'destructive' });
    }
  };

  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'staff', department: '' });
  const handleCreateUser = async () => {
    setActionLoading(prev => ({ ...prev, create: true }));
    const result = await createUser(newUser);
    setActionLoading(prev => ({ ...prev, create: false }));
    if (result.success) {
      toast({ title: 'User Created', description: 'The new user account has been created successfully.' });
      setIsCreateModalOpen(false);
      setNewUser({ name: '', email: '', password: '', role: 'staff', department: '' });
      refetch();
    } else {
      toast({ title: 'Creation Failed', description: result.error, variant: 'destructive' });
    }
  };

  const filteredUsers = (users || []).filter(u => {
    if (filterRole !== 'all' && u.role !== filterRole) return false;
    if (filterStatus === 'active' && u.isActive === false) return false;
    if (filterStatus === 'inactive' && u.isActive !== false) return false;
    return true;
  });

  const activeCount = (users || []).filter(u => u.isActive !== false).length;
  const inactiveCount = (users || []).filter(u => u.isActive === false).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage Staff, Workers and Citizens. Admin accounts are protected.
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New User
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: (users || []).length, icon: <Users className="w-5 h-5 text-blue-500" /> },
          { label: 'Active', value: activeCount, icon: <UserCheck className="w-5 h-5 text-green-500" /> },
          { label: 'Inactive', value: inactiveCount, icon: <UserX className="w-5 h-5 text-red-500" /> },
          { label: 'Workers', value: (users || []).filter(u => u.role === 'worker').length, icon: <Wrench className="w-5 h-5 text-amber-500" /> },
        ].map(({ label, value, icon }) => (
          <Card key={label} className="glass-card">
            <CardContent className="pt-4 pb-3 flex items-center gap-3">
              {icon}
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="pt-4 pb-3">
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Filter:</span>
            <div className="flex gap-1">
              {['all', 'staff', 'worker', 'citizen'].map(role => (
                <button
                  key={role}
                  onClick={() => setFilterRole(role)}
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${filterRole === role ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                >
                  {role === 'all' ? 'All Roles' : role}
                </button>
              ))}
            </div>
            <div className="flex gap-1 ml-2 border-l pl-3 border-gray-200 dark:border-gray-700">
              {[['all', 'All Status'], ['active', '✅ Active'], ['inactive', '🔴 Inactive']].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setFilterStatus(val)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterStatus === val ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="glass-card overflow-x-auto">
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">
              <AlertTriangle className="mx-auto w-8 h-8 mb-2" />
              Error: {error}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                      No users found matching the current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const isInactive = user.isActive === false;
                    return (
                      <TableRow key={user._id} className={isInactive ? 'opacity-60' : ''}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {user.name}
                            {isInactive && (
                              <Badge variant="outline" className="text-xs text-red-500 border-red-200">Deactivated</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-500 dark:text-gray-400">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={roleVariant[user.role]} className="flex items-center w-fit gap-0.5">
                            {getRoleIcon(user.role)}{user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.department?.name || <span className="text-gray-400 text-xs">N/A</span>}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${isInactive ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isInactive ? 'bg-red-500' : 'bg-green-500'}`} />
                            {isInactive ? 'Inactive' : 'Active'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" disabled={actionLoading[user._id]}>
                                {actionLoading[user._id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              {!isInactive && (() => {
                                const transitions = VALID_ROLE_TRANSITIONS[user.role] || [];
                                if (transitions.length === 0) return null;
                                return (
                                  <>
                                    <DropdownMenuLabel className="text-xs text-gray-500">
                                      Transfer Role
                                    </DropdownMenuLabel>
                                    {transitions.map(({ role: targetRole, label, icon: Icon }) => (
                                      <DropdownMenuItem
                                        key={targetRole}
                                        onSelect={() => confirmRoleTransfer(user, targetRole, label)}
                                      >
                                        <Icon className="mr-2 h-4 w-4" /> {label}
                                      </DropdownMenuItem>
                                    ))}
                                    <DropdownMenuSeparator />
                                  </>
                                );
                              })()}
                              {isInactive ? (
                                <DropdownMenuItem
                                  className="text-green-600 focus:text-green-700 focus:bg-green-50 dark:focus:bg-green-900/20"
                                  onSelect={() => handleReactivate(user._id, user.name)}
                                >
                                  <RefreshCw className="mr-2 h-4 w-4" /> Reactivate Account
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  className="text-red-500 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                                  onSelect={() => setUserToDeactivate(user)}
                                >
                                  <ShieldOff className="mr-2 h-4 w-4" /> Deactivate Account
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Deactivate Confirmation Dialog */}
      <Dialog open={!!userToDeactivate} onOpenChange={() => setUserToDeactivate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldOff className="w-5 h-5 text-amber-500" />
              Deactivate Account
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  You are about to deactivate the account for{' '}
                  <span className="font-bold text-gray-900 dark:text-gray-100">{userToDeactivate?.name}</span>.
                </p>
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-amber-800 dark:text-amber-200 text-xs space-y-1">
                  <p className="font-semibold">⚠️ What this means:</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>The user can no longer log into the system.</li>
                    <li>Their data and complaints are <strong>preserved</strong> for audit purposes.</li>
                    <li>This action <strong>can be reversed</strong> by reactivating the account.</li>
                  </ul>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDeactivate}
              disabled={actionLoading[userToDeactivate?._id]}
            >
              {actionLoading[userToDeactivate?._id] ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deactivating...</>
              ) : (
                <><ShieldOff className="mr-2 h-4 w-4" />Yes, Deactivate Account</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Transfer Confirmation Dialog */}
      <Dialog open={!!roleTransferPending} onOpenChange={() => setRoleTransferPending(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-blue-500" />
              Confirm Role Transfer
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  You are about to transfer{' '}
                  <span className="font-bold text-gray-900 dark:text-gray-100">{roleTransferPending?.user.name}</span>
                  {' '}from{' '}
                  <span className="font-semibold capitalize">{roleTransferPending?.user.role}</span>
                  {' '}→{' '}
                  <span className="font-semibold capitalize">{roleTransferPending?.newRole}</span>.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-blue-800 dark:text-blue-200 text-xs space-y-1">
                  <p className="font-semibold">ℹ️ What this means:</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>Their department assignment and active tasks are <strong>preserved</strong>.</li>
                    <li>Their access level will change immediately after confirmation.</li>
                    <li>This action <strong>can be reversed</strong> by transferring them back.</li>
                  </ul>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={executeRoleTransfer}
              disabled={actionLoading[roleTransferPending?.user._id]}
            >
              {actionLoading[roleTransferPending?.user._id] ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Transferring...</>
              ) : (
                <><RefreshCw className="mr-2 h-4 w-4" />Yes, Transfer Role</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User Account</DialogTitle>
            <DialogDescription>Create a new Staff or Worker account and assign them to a department.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder={newUser.role === 'worker' ? 'worker@gmail.com' : 'email@example.com'}
                value={newUser.email}
                onChange={e => setNewUser({...newUser, email: e.target.value})}
              />
              {newUser.role === 'worker' && (
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  ⚠️ Workers must use a real email (Gmail, Yahoo, etc.). @civicmitra.com is not allowed.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={newUser.role} onValueChange={role => setNewUser({...newUser, role})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="worker">Worker</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={newUser.department} onValueChange={department => setNewUser({...newUser, department})}>
                <SelectTrigger><SelectValue placeholder="Select a department" /></SelectTrigger>
                <SelectContent>
                  {departments.map(d => <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleCreateUser} disabled={actionLoading.create}>
              {actionLoading.create ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
