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
import SlugRedirect from './components/SlugRedirect';

// --- CORE PAGES ---
// Public & Auth
import LandingPage from './pages/LandingPage';
import UnifiedLogin from './pages/auth/UnifiedLogin';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import NotFound from './pages/NotFound';
import PublicTransparency from './pages/PublicTransparency';

// Unified Profile Page (Used for all roles)
import ProfilePage from './pages/ProfilePage';

// Citizen Pages
import PublicFeed from './pages/citizen/PublicFeed';
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import MyComplaints from './pages/citizen/MyComplaints';
import FileComplaint from './pages/citizen/FileComplaint';
import ComplaintDetails from './pages/citizen/ComplaintDetails';
import FeedbackPage from './pages/citizen/Feedback';
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
import EditAssignment from './pages/staff/EditAssignment';
import StaffStats from './pages/staff/StaffStats';
import StaffChatPage from './pages/staff/ChatPage';
import WorkerManagement from './pages/staff/WorkerManagement';

// Worker Pages
import WorkerDashboard from './pages/worker/WorkerDashboard';
import AssignedTasks from './pages/worker/AssignedTasks';
import TaskDetails from './pages/worker/TaskDetails';
import WorkerReports from './pages/worker/WorkerReports';

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

          {/* Transparency dashboard — fully public, no login */}
          <Route path="/transparency" element={<PublicTransparency />} />

          {/* Authentication Routes */}
          <Route element={<PublicRoute><AuthLayout /></PublicRoute>}>
            <Route path="/auth" element={<UnifiedLogin />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
          </Route>

          {/* Protected App Routes */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>

            {/* ==== CITIZEN ROUTES (Slug-based — primary) ==== */}
            <Route path="/:slug/dashboard" element={<CitizenRoute><CitizenDashboard /></CitizenRoute>} />
            <Route path="/:slug/public" element={<CitizenRoute><PublicFeed /></CitizenRoute>} />
            <Route path="/:slug/complaints" element={<CitizenRoute><MyComplaints /></CitizenRoute>} />
            <Route path="/:slug/complaints/create" element={<CitizenRoute><FileComplaint /></CitizenRoute>} />
            <Route path="/:slug/complaints/:id" element={<CitizenRoute><ComplaintDetails /></CitizenRoute>} />
            <Route path="/:slug/complaints/:id/feedback" element={<CitizenRoute><FeedbackPage /></CitizenRoute>} />
            <Route path="/:slug/chat" element={<CitizenRoute><CitizenChatPage /></CitizenRoute>} />
            <Route path="/:slug/feedback" element={<CitizenRoute><FeedbackList /></CitizenRoute>} />
            <Route path="/:slug/profile" element={<CitizenRoute><ProfilePage /></CitizenRoute>} />
            <Route path="/:slug/settings" element={<CitizenRoute><ProfilePage /></CitizenRoute>} />

            {/* ==== CITIZEN ROUTES (Legacy — auto-redirect to slug-based when slug is available) ==== */}
            <Route path="/dashboard" element={<CitizenRoute><SlugRedirect type="citizen"><CitizenDashboard /></SlugRedirect></CitizenRoute>} />
            <Route path="/public" element={<CitizenRoute><SlugRedirect type="citizen"><PublicFeed /></SlugRedirect></CitizenRoute>} />
            <Route path="/complaints" element={<CitizenRoute><SlugRedirect type="citizen"><MyComplaints /></SlugRedirect></CitizenRoute>} />
            <Route path="/complaints/create" element={<CitizenRoute><SlugRedirect type="citizen"><FileComplaint /></SlugRedirect></CitizenRoute>} />
            <Route path="/complaints/:id" element={<CitizenRoute><SlugRedirect type="citizen"><ComplaintDetails /></SlugRedirect></CitizenRoute>} />
            <Route path="/complaints/:id/feedback" element={<CitizenRoute><SlugRedirect type="citizen"><FeedbackPage /></SlugRedirect></CitizenRoute>} />
            <Route path="/chat" element={<CitizenRoute><SlugRedirect type="citizen"><CitizenChatPage /></SlugRedirect></CitizenRoute>} />
            <Route path="/feedback" element={<CitizenRoute><SlugRedirect type="citizen"><FeedbackList /></SlugRedirect></CitizenRoute>} />
            <Route path="/profile" element={<CitizenRoute><SlugRedirect type="citizen"><ProfilePage /></SlugRedirect></CitizenRoute>} />
            <Route path="/settings" element={<CitizenRoute><SlugRedirect type="citizen"><ProfilePage /></SlugRedirect></CitizenRoute>} />

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

            {/* ==== STAFF ROUTES (Department slug-based — primary) ==== */}
            <Route path="/:departmentSlug/staff" element={<StaffRoute><StaffDashboard /></StaffRoute>} />
            <Route path="/:departmentSlug/staff/complaints" element={<StaffRoute><StaffComplaintManagement /></StaffRoute>} />
            <Route path="/:departmentSlug/staff/complaints/:id" element={<StaffRoute><ComplaintDetails /></StaffRoute>} />
            <Route path="/:departmentSlug/staff/complaints/:id/assign" element={<StaffRoute><AssignWorker /></StaffRoute>} />
            <Route path="/:departmentSlug/staff/complaints/:id/edit-assignment" element={<StaffRoute><EditAssignment /></StaffRoute>} />
            <Route path="/:departmentSlug/staff/stats" element={<StaffRoute><StaffStats /></StaffRoute>} />
            <Route path="/:departmentSlug/staff/workers" element={<StaffRoute><WorkerManagement /></StaffRoute>} />
            <Route path="/:departmentSlug/staff/complaints/:id/chat" element={<StaffRoute><StaffChatPage /></StaffRoute>} />
            <Route path="/:departmentSlug/staff/chat" element={<StaffRoute><StaffChatPage /></StaffRoute>} />
            <Route path="/:departmentSlug/staff/profile" element={<StaffRoute><ProfilePage /></StaffRoute>} />
            <Route path="/:departmentSlug/staff/settings" element={<StaffRoute><ProfilePage /></StaffRoute>} />

            {/* ==== STAFF ROUTES (Legacy — auto-redirect to slug-based) ==== */}
            <Route path="/staff" element={<StaffRoute><SlugRedirect type="staff"><StaffDashboard /></SlugRedirect></StaffRoute>} />
            <Route path="/staff/complaints" element={<StaffRoute><SlugRedirect type="staff"><StaffComplaintManagement /></SlugRedirect></StaffRoute>} />
            <Route path="/staff/complaints/:id" element={<StaffRoute><SlugRedirect type="staff"><ComplaintDetails /></SlugRedirect></StaffRoute>} />
            <Route path="/staff/stats" element={<StaffRoute><SlugRedirect type="staff"><StaffStats /></SlugRedirect></StaffRoute>} />
            <Route path="/staff/workers" element={<StaffRoute><SlugRedirect type="staff"><WorkerManagement /></SlugRedirect></StaffRoute>} />
            <Route path="/staff/profile" element={<StaffRoute><SlugRedirect type="staff"><ProfilePage /></SlugRedirect></StaffRoute>} />
            <Route path="/staff/settings" element={<StaffRoute><SlugRedirect type="staff"><ProfilePage /></SlugRedirect></StaffRoute>} />

            {/* ==== WORKER ROUTES ==== */}
            <Route path="/worker" element={<WorkerRoute><WorkerDashboard /></WorkerRoute>} />
            <Route path="/worker/tasks" element={<WorkerRoute><AssignedTasks /></WorkerRoute>} />
            <Route path="/worker/tasks/:id" element={<WorkerRoute><TaskDetails /></WorkerRoute>} />
            <Route path="/worker/reports" element={<WorkerRoute><WorkerReports /></WorkerRoute>} />
            <Route path="/worker/profile" element={<WorkerRoute><ProfilePage /></WorkerRoute>} />
            <Route path="/worker/settings" element={<WorkerRoute><ProfilePage /></WorkerRoute>} />

          </Route>

          {/* Catch-all for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </ThemeProvider>
    </Router>
  );
}

export default App;
