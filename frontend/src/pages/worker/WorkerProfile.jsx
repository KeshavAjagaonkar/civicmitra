import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import { User, Mail, Phone, MapPin, Calendar, Award, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const WorkerProfile = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Mike Johnson',
    email: 'mike.johnson@civicmitra.com',
    phone: '+1 (555) 987-6543',
    address: '123 Worker Street, City, State 12345',
    department: 'Public Works',
    employeeId: 'WRK-001',
    joinDate: '2023-06-15',
    specialization: 'Road Maintenance',
    experience: '5 years',
    emergencyContact: '+1 (555) 123-4567'
  });

  // Mock performance data
  const performanceData = {
    totalTasks: 156,
    completedTasks: 142,
    inProgressTasks: 8,
    overdueTasks: 6,
    averageCompletionTime: '2.3 days',
    rating: 4.7,
    thisMonth: {
      completed: 18,
      inProgress: 3,
      overdue: 1
    }
  };

  const recentAchievements = [
    {
      id: 1,
      title: 'Employee of the Month',
      description: 'Outstanding performance in January 2024',
      date: '2024-01-31',
      type: 'award'
    },
    {
      id: 2,
      title: 'Perfect Attendance',
      description: 'No absences for 6 months',
      date: '2024-01-15',
      type: 'achievement'
    },
    {
      id: 3,
      title: 'Safety Excellence',
      description: 'Zero safety incidents for 1 year',
      date: '2023-12-20',
      type: 'safety'
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // In a real app, this would save to backend
    toast({
      title: 'Profile Updated',
      description: 'Your profile has been updated successfully.',
      variant: 'success'
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original values
    setFormData({
      name: 'Mike Johnson',
      email: 'mike.johnson@civicmitra.com',
      phone: '+1 (555) 987-6543',
      address: '123 Worker Street, City, State 12345',
      department: 'Public Works',
      employeeId: 'WRK-001',
      joinDate: '2023-06-15',
      specialization: 'Road Maintenance',
      experience: '5 years',
      emergencyContact: '+1 (555) 123-4567'
    });
  };

  const getAchievementIcon = (type) => {
    switch (type) {
      case 'award': return <Award className="w-5 h-5 text-yellow-500" />;
      case 'achievement': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'safety': return <AlertCircle className="w-5 h-5 text-blue-500" />;
      default: return <Award className="w-5 h-5 text-gray-500" />;
    }
  };

  const getAchievementColor = (type) => {
    switch (type) {
      case 'award': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'achievement': return 'bg-green-100 text-green-800 border-green-200';
      case 'safety': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{formData.name}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{formData.employeeId}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{formData.email}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone
                  </Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{formData.phone}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Address
                </Label>
                {isEditing ? (
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{formData.address}</p>
                )}
              </div>

              <div>
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                {isEditing ? (
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  />
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{formData.emergencyContact}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Work Information */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Work Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">Department</Label>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{formData.department}</p>
                </div>
                <div>
                  <Label htmlFor="specialization">Specialization</Label>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{formData.specialization}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="experience">Experience</Label>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{formData.experience}</p>
                </div>
                <div>
                  <Label htmlFor="joinDate">Join Date</Label>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {new Date(formData.joinDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAchievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      {getAchievementIcon(achievement.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{achievement.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(achievement.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <Badge variant="outline" className={getAchievementColor(achievement.type)}>
                      {achievement.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Performance Stats */}
        <div className="space-y-6">
          {/* Performance Overview */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{performanceData.rating}</div>
                <p className="text-sm text-gray-500">Average Rating</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{performanceData.completedTasks}</div>
                  <p className="text-xs text-gray-500">Completed</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{performanceData.inProgressTasks}</div>
                  <p className="text-xs text-gray-500">In Progress</p>
                </div>
              </div>

              <div className="text-center">
                <div className="text-lg font-semibold">{performanceData.averageCompletionTime}</div>
                <p className="text-xs text-gray-500">Avg. Completion Time</p>
              </div>
            </CardContent>
          </Card>

          {/* This Month's Performance */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>This Month</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Completed Tasks</span>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  {performanceData.thisMonth.completed}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">In Progress</span>
                <Badge variant="outline" className="bg-orange-100 text-orange-800">
                  {performanceData.thisMonth.inProgress}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Overdue</span>
                <Badge variant="outline" className="bg-red-100 text-red-800">
                  {performanceData.thisMonth.overdue}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium">{performanceData.totalTasks}</p>
                  <p className="text-xs text-gray-500">Total Tasks</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium">{performanceData.averageCompletionTime}</p>
                  <p className="text-xs text-gray-500">Avg. Time</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="font-medium">{performanceData.rating}/5</p>
                  <p className="text-xs text-gray-500">Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WorkerProfile;
