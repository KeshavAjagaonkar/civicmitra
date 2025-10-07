import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layouts
import LandingPageLayout from './components/layout/LandingPageLayout';
import AuthLayout from './components/layout/AuthLayout';
import Layout from './components/layout/Layout';

// Protected Route Components
import ProtectedRoute, { 
  AdminRoute, 
  StaffRoute, 
  WorkerRoute, 
  CitizenRoute, 
  PublicRoute 
} from './components/ProtectedRoute';

// --- CORE PAGES ---
// Public & Auth
import LandingPage from './pages/LandingPage';
import UnifiedLogin from './pages/auth/UnifiedLogin';
import NotFound from './pages/NotFound';

// Unified Profile Page (Used for all roles)
import ProfilePage from './pages/ProfilePage';

// Citizen Pages
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import MyComplaints from './pages/citizen/MyComplaints';
import FileComplaint from './pages/citizen/FileComplaint';
import ComplaintDetails from './pages/citizen/ComplaintDetails';
import FeedbackPage from './pages/citizen/Feedback'; // Renamed import for clarity
import CitizenChatPage from './pages/citizen/ChatPage';
import FeedbackList from './pages/citizen/FeedbackList';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import DepartmentManagement from './pages/admin/DepartmentManagement';
import ComplaintManagement from './pages/admin/ComplaintManagement';
import Reports from './pages/admin/Reports';
import SystemAnalytics from './pages/admin/SystemAnalytics';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffComplaintManagement from './pages/staff/ComplaintManagement';
import AssignWorker from './pages/staff/AssignWorker';
import StaffChatPage from './pages/staff/ChatPage';
import WorkerManagement from './pages/staff/WorkerManagement';

// Worker Pages
import WorkerDashboard from './pages/worker/WorkerDashboard';
import AssignedTasks from './pages/worker/AssignedTasks';
import TaskDetails from './pages/worker/TaskDetails';
import WorkerReports from './pages/worker/WorkerReports';

// --- DEV & DEBUG PAGES ---
import Debug from './pages/Debug';
import TestLogin from './pages/TestLogin';
import ShowcaseAll from './pages/ShowcaseAll';
import DevNav from './pages/DevNav';

// Toaster & Theme
import { Toaster } from "@/components/ui/Toaster";
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicRoute><LandingPageLayout /></PublicRoute>}>
            <Route index element={<LandingPage />} />
          </Route>
          
          {/* Authentication Routes */}
          <Route element={<PublicRoute><AuthLayout /></PublicRoute>}>
            <Route path="/auth" element={<UnifiedLogin />} />
            {/* The Forgot Password link inside UnifiedLogin will handle navigation */}
          </Route>

          {/* Protected App Routes */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>

            {/* ==== CITIZEN ROUTES (Slug-based) ==== */}
            <Route path="/:slug/dashboard" element={<CitizenRoute><CitizenDashboard /></CitizenRoute>} />
            <Route path="/:slug/complaints" element={<CitizenRoute><MyComplaints /></CitizenRoute>} />
            <Route path="/:slug/complaints/create" element={<CitizenRoute><FileComplaint /></CitizenRoute>} />
            <Route path="/:slug/complaints/:id" element={<CitizenRoute><ComplaintDetails /></CitizenRoute>} />
            <Route path="/:slug/complaints/:id/feedback" element={<CitizenRoute><FeedbackPage /></CitizenRoute>} />
            <Route path="/:slug/chat" element={<CitizenRoute><CitizenChatPage /></CitizenRoute>} />
            <Route path="/:slug/feedback" element={<CitizenRoute><FeedbackList /></CitizenRoute>} />
            <Route path="/:slug/profile" element={<CitizenRoute><ProfilePage /></CitizenRoute>} />
            <Route path="/:slug/settings" element={<CitizenRoute><ProfilePage /></CitizenRoute>} />

            {/* ==== CITIZEN ROUTES (Legacy/Fallback without slug) ==== */}
            <Route path="/dashboard" element={<CitizenRoute><CitizenDashboard /></CitizenRoute>} />
            <Route path="/complaints" element={<CitizenRoute><MyComplaints /></CitizenRoute>} />
            <Route path="/complaints/create" element={<CitizenRoute><FileComplaint /></CitizenRoute>} />
            <Route path="/complaints/:id" element={<CitizenRoute><ComplaintDetails /></CitizenRoute>} />
            <Route path="/complaints/:id/feedback" element={<CitizenRoute><FeedbackPage /></CitizenRoute>} />
            <Route path="/chat" element={<CitizenRoute><CitizenChatPage /></CitizenRoute>} />
            <Route path="/feedback" element={<CitizenRoute><FeedbackList /></CitizenRoute>} />
            <Route path="/profile" element={<CitizenRoute><ProfilePage /></CitizenRoute>} />
            <Route path="/settings" element={<CitizenRoute><ProfilePage /></CitizenRoute>} />

            {/* ==== ADMIN ROUTES ==== */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
            <Route path="/admin/departments" element={<AdminRoute><DepartmentManagement /></AdminRoute>} />
            <Route path="/admin/complaints" element={<AdminRoute><ComplaintManagement /></AdminRoute>} />
            <Route path="/admin/complaints/:id" element={<AdminRoute><ComplaintDetails /></AdminRoute>} />
            <Route path="/admin/complaints/:id/assign" element={<AdminRoute><AssignWorker /></AdminRoute>} />
            <Route path="/admin/reports" element={<AdminRoute><Reports /></AdminRoute>} />
            <Route path="/admin/analytics" element={<AdminRoute><SystemAnalytics /></AdminRoute>} />
            <Route path="/admin/profile" element={<AdminRoute><ProfilePage /></AdminRoute>} />
            <Route path="/admin/settings" element={<AdminRoute><ProfilePage /></AdminRoute>} />
            
            {/* ==== STAFF ROUTES (Department-based) ==== */}
            <Route path="/:departmentSlug/staff" element={<StaffRoute><StaffDashboard /></StaffRoute>} />
            <Route path="/:departmentSlug/staff/complaints" element={<StaffRoute><StaffComplaintManagement /></StaffRoute>} />
            <Route path="/:departmentSlug/staff/complaints/:id" element={<StaffRoute><ComplaintDetails /></StaffRoute>} />
            <Route path="/:departmentSlug/staff/complaints/:id/assign" element={<StaffRoute><AssignWorker /></StaffRoute>} />
            <Route path="/:departmentSlug/staff/workers" element={<StaffRoute><WorkerManagement /></StaffRoute>} />
            <Route path="/:departmentSlug/staff/complaints/:id/chat" element={<StaffRoute><StaffChatPage /></StaffRoute>} />
            <Route path="/:departmentSlug/staff/chat" element={<StaffRoute><StaffChatPage /></StaffRoute>} />
            <Route path="/:departmentSlug/staff/profile" element={<StaffRoute><ProfilePage /></StaffRoute>} />
            <Route path="/:departmentSlug/staff/settings" element={<StaffRoute><ProfilePage /></StaffRoute>} />

            {/* ==== STAFF ROUTES (Legacy fallback) ==== */}
            <Route path="/staff" element={<StaffRoute><StaffDashboard /></StaffRoute>} />
            <Route path="/staff/complaints" element={<StaffRoute><StaffComplaintManagement /></StaffRoute>} />
            <Route path="/staff/complaints/:id" element={<StaffRoute><ComplaintDetails /></StaffRoute>} />
            <Route path="/staff/workers" element={<StaffRoute><WorkerManagement /></StaffRoute>} />
            
            {/* ==== WORKER ROUTES ==== */}
            <Route path="/worker" element={<WorkerRoute><WorkerDashboard /></WorkerRoute>} />
            <Route path="/worker/tasks" element={<WorkerRoute><AssignedTasks /></WorkerRoute>} />
            <Route path="/worker/tasks/:id" element={<WorkerRoute><TaskDetails /></WorkerRoute>} />
            <Route path="/worker/reports" element={<WorkerRoute><WorkerReports /></WorkerRoute>} />
            <Route path="/worker/profile" element={<WorkerRoute><ProfilePage /></WorkerRoute>} />
            <Route path="/worker/settings" element={<WorkerRoute><ProfilePage /></WorkerRoute>} />
            
          </Route>

          {/* Debug Routes for development */}
          <Route path="/debug" element={<Debug />} />
          <Route path="/test-login" element={<TestLogin />} />
          <Route path="/showcase" element={<ShowcaseAll />} />
          <Route path="/dev" element={<DevNav />} />

          {/* Catch-all for 404 */} 
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </ThemeProvider>
    </Router>
  );
}

export default App;

