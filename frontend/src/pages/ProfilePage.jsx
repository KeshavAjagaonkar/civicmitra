import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Separator } from '@/components/ui/Separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import useApi from '@/hooks/useApi';
import {
  User, Mail, Phone, MapPin, Calendar, Edit, Save, X, Key, Eye, EyeOff,
  Shield, UserCheck, Wrench, Users as CitizenIcon
} from 'lucide-react';

const roleConfig = {
  admin: { name: 'Administrator', icon: Shield, color: 'bg-red-100 dark:bg-red-900/20', textColor: 'text-red-600' },
  staff: { name: 'Staff Member', icon: UserCheck, color: 'bg-green-100 dark:bg-green-900/20', textColor: 'text-green-600' },
  worker: { name: 'Field Worker', icon: Wrench, color: 'bg-orange-100 dark:bg-orange-900/20', textColor: 'text-orange-600' },
  citizen: { name: 'Citizen', icon: CitizenIcon, color: 'bg-blue-100 dark:bg-blue-900/20', textColor: 'text-blue-600' },
};

const ProfilePage = () => {
  const { user, setAuth } = useAuth();
  const { request, isLoading } = useApi();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  
  const [profileData, setProfileData] = useState({ name: '', email: '', phone: '', address: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const currentRoleConfig = roleConfig[user?.role] || roleConfig.citizen;
  const RoleIcon = currentRoleConfig.icon;

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      const response = await request('/api/auth/profile', {
        method: 'PUT',
        body: profileData,
      });

      if (response?.success) {
        toast({ title: "Profile Updated", description: "Your information has been saved." });
        setIsEditing(false);
        // Update user in AuthContext
        setAuth({ user: response.data, token: localStorage.getItem('token') });
      }
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast({ title: "Error", description: "New passwords do not match.", variant: "destructive" });
    }
    if (passwordData.newPassword.length < 6) {
      return toast({ title: "Error", description: "Password must be at least 6 characters long.", variant: "destructive" });
    }

    try {
      const response = await request('/api/auth/password', {
        method: 'PUT',
        body: {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
      });

      if (response?.success) {
        toast({ title: "Password Updated", description: "Your password has been changed successfully." });
        setIsPasswordModalOpen(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">My Profile</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Manage your account settings and personal information.</p>
        </div>
        <Badge variant="outline" className="w-fit px-3 py-1">
          <RoleIcon className="w-4 h-4 mr-2" />
          {currentRoleConfig.name}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2"><User className="w-5 h-5" />Profile Information</CardTitle>
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}><Edit className="w-4 h-4 mr-2" />Edit</Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancelEdit} disabled={isLoading}><X className="w-4 h-4 mr-2" />Cancel</Button>
                    <Button size="sm" onClick={handleSaveProfile} loading={isLoading} loadingText="Saving..."><Save className="w-4 h-4 mr-2" />Save</Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  {isEditing ? <Input id="name" name="name" value={profileData.name} onChange={handleProfileInputChange} /> : <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">{user?.name || 'Not provided'}</div>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  {isEditing ? <Input id="email" name="email" type="email" value={profileData.email} onChange={handleProfileInputChange} /> : <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md flex items-center gap-2"><Mail className="w-4 h-4 text-gray-500" />{user?.email || 'Not provided'}</div>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                {isEditing ? <Input id="phone" name="phone" value={profileData.phone} onChange={handleProfileInputChange} /> : <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md flex items-center gap-2"><Phone className="w-4 h-4 text-gray-500" />{user?.phone || 'Not provided'}</div>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                {isEditing ? <Textarea id="address" name="address" value={profileData.address} onChange={handleProfileInputChange} rows={3} /> : <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md flex items-start gap-2"><MapPin className="w-4 h-4 text-gray-500 mt-0.5" />{user?.address || 'Not provided'}</div>}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader><CardTitle className="text-lg">Account Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center p-6">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${currentRoleConfig.color}`}>
                  <RoleIcon className={`w-10 h-10 ${currentRoleConfig.textColor}`} />
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg">{user?.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{currentRoleConfig.name}</p>
              </div>
              <Separator />
              <div className="space-y-3 text-sm">
                {user?.role === 'staff' && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Department:</span>
                    <span className="text-xs">{user?.department?.name || 'N/A'}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Member Since:</span>
                  <span className="text-xs">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Key className="w-5 h-5" />Security</CardTitle></CardHeader>
            <CardContent>
              <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                <DialogTrigger asChild><Button variant="outline" className="w-full"><Key className="w-4 h-4 mr-2" />Change Password</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Change Password</DialogTitle></DialogHeader>
                  <div className="space-y-4 pt-4">
                    {/* Password Fields */}
                    {/* ... (Password fields are identical, no changes needed) ... */}
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;