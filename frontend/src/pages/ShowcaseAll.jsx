import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { 
  User, Shield, Users, Wrench, Home, Search, ExternalLink, Eye, Code
} from 'lucide-react';

// Import all pages for direct rendering
import LandingPage from './LandingPage';
import UnifiedLogin from './auth/UnifiedLogin'; // <-- Use the unified component

// Citizen Pages
import CitizenDashboard from './citizen/CitizenDashboard';
import MyComplaints from './citizen/MyComplaints';
import FileComplaint from './citizen/FileComplaint';
import ComplaintDetails from './citizen/ComplaintDetails';
import Feedback from './citizen/Feedback';

// Admin Pages
import AdminDashboard from './admin/AdminDashboard';
import UserManagement from './admin/UserManagement';
import DepartmentManagement from './admin/DepartmentManagement';
import ComplaintManagement from './admin/ComplaintManagement';
import Reports from './admin/Reports';
import SystemAnalytics from './admin/SystemAnalytics';
import ProfilePage from './ProfilePage'; // <-- Use the unified component

// Staff Pages
import StaffDashboard from './staff/StaffDashboard';
import StaffComplaintManagement from './staff/ComplaintManagement';
import AssignWorker from './staff/AssignWorker';

// Worker Pages
import WorkerDashboard from './worker/WorkerDashboard';
import AssignedTasks from './worker/AssignedTasks';
import TaskDetails from './worker/TaskDetails';
import WorkerReports from './worker/WorkerReports';

import NotFound from './NotFound';
import Debug from './Debug';
import TestLogin from './TestLogin';

const ShowcaseAll = () => {
  const [selectedPage, setSelectedPage] = useState('landing');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Updated pages array without the deleted components
  const pages = [
    // Public & Auth
    { id: 'landing', name: 'Landing Page', component: LandingPage, category: 'public', route: '/' },
    { id: 'auth', name: 'Unified Login/Register', component: UnifiedLogin, category: 'auth', route: '/auth' },

    // Citizen Pages
    { id: 'citizen-dashboard', name: 'Citizen Dashboard', component: CitizenDashboard, category: 'citizen', route: '/dashboard' },
    { id: 'my-complaints', name: 'My Complaints', component: MyComplaints, category: 'citizen', route: '/complaints' },
    { id: 'file-complaint', name: 'File Complaint', component: FileComplaint, category: 'citizen', route: '/complaints/create' },
    { id: 'complaint-details', name: 'Complaint Details', component: ComplaintDetails, category: 'citizen', route: '/complaints/:id' },
    { id: 'feedback', name: 'Feedback', component: Feedback, category: 'citizen', route: '/complaints/:id/feedback' },
    { id: 'profile-page', name: 'Unified Profile Page', component: ProfilePage, category: 'citizen', route: '/profile' },

    // Admin Pages
    { id: 'admin-dashboard', name: 'Admin Dashboard', component: AdminDashboard, category: 'admin', route: '/admin' },
    { id: 'user-management', name: 'User Management', component: UserManagement, category: 'admin', route: '/admin/users' },
    { id: 'department-management', name: 'Department Management', component: DepartmentManagement, category: 'admin', route: '/admin/departments' },
    { id: 'admin-complaints', name: 'Admin Complaints', component: ComplaintManagement, category: 'admin', route: '/admin/complaints' },
    { id: 'reports', name: 'Reports', component: Reports, category: 'admin', route: '/admin/reports' },
    { id: 'analytics', name: 'System Analytics', component: SystemAnalytics, category: 'admin', route: '/admin/analytics' },

    // Staff Pages
    { id: 'staff-dashboard', name: 'Staff Dashboard', component: StaffDashboard, category: 'staff', route: '/staff' },
    { id: 'staff-complaints', name: 'Staff Complaints', component: StaffComplaintManagement, category: 'staff', route: '/staff/complaints' },
    { id: 'assign-worker', name: 'Assign Worker', component: AssignWorker, category: 'staff', route: '/staff/complaints/:id/assign' },

    // Worker Pages
    { id: 'worker-dashboard', name: 'Worker Dashboard', component: WorkerDashboard, category: 'worker', route: '/worker' },
    { id: 'assigned-tasks', name: 'Assigned Tasks', component: AssignedTasks, category: 'worker', route: '/worker/tasks' },
    { id: 'task-details', name: 'Task Details', component: TaskDetails, category: 'worker', route: '/worker/tasks/:id' },
    { id: 'worker-reports', name: 'Worker Reports', component: WorkerReports, category: 'worker', route: '/worker/reports' },

    // Utility Pages
    { id: 'not-found', name: '404 Not Found', component: NotFound, category: 'utility', route: '/404' },
    { id: 'debug', name: 'Debug', component: Debug, category: 'utility', route: '/debug' },
    { id: 'test-login', name: 'Test Login', component: TestLogin, category: 'utility', route: '/test-login' }
  ];

  // The rest of the component logic remains the same...
  // (JSX for rendering is omitted for brevity but is unchanged from your original file)
  const categories = [
    { value: 'all', label: 'All Pages', icon: Home },
    { value: 'public', label: 'Public Pages', icon: Eye },
    { value: 'auth', label: 'Authentication', icon: Shield },
    { value: 'citizen', label: 'Citizen Pages', icon: User },
    { value: 'admin', label: 'Admin Pages', icon: Users },
    { value: 'staff', label: 'Staff Pages', icon: Users },
    { value: 'worker', label: 'Worker Pages', icon: Wrench },
    { value: 'utility', label: 'Utility Pages', icon: Code }
  ];

  const filteredPages = pages.filter(page => {
    const matchesCategory = selectedCategory === 'all' || page.category === selectedCategory;
    const matchesSearch = page.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selectedPageData = pages.find(page => page.id === selectedPage);
  const SelectedComponent = selectedPageData?.component;
  
  return (
     <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
        <div className="lg:col-span-1"><Card className="sticky top-6">
        <CardHeader><CardTitle className="flex items-center gap-2"><Eye/>Page Showcase</CardTitle></CardHeader>
        <CardContent className="space-y-4">
        <Input placeholder="Search pages..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>
            {categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
        </SelectContent></Select>
        <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredPages.map(p => <Button key={p.id} variant={selectedPage === p.id ? 'default':'ghost'} className="w-full justify-start" onClick={() => setSelectedPage(p.id)}>{p.name}</Button>)}
        </div>
        </CardContent>
        </Card></div>
        <div className="lg:col-span-3">
            {selectedPageData && <Card className="mb-4"><CardHeader><CardTitle>{selectedPageData.name}</CardTitle></CardHeader></Card>}
            <Card className="min-h-[600px]"><CardContent className="p-0">
                {SelectedComponent ? <SelectedComponent /> : <div>Select a page</div>}
            </CardContent></Card>
        </div>
      </div>
     </div>
  )
};

export default ShowcaseAll;
