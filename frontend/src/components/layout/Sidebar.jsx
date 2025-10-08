import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Home, FileText, Shield, Users, Building, Briefcase, Wrench, MessageSquare, HelpCircle, LogOut, User, BarChart3, CheckSquare } from 'lucide-react';
import { BarChart } from 'lucide-react';

const navItems = {
  citizen: [
    { name: 'Dashboard', icon: Home, path: '/dashboard' },
    { name: 'My Complaints', icon: FileText, path: '/complaints' },
    { name: 'File Complaint', icon: FileText, path: '/complaints/create' },
    { name: 'Chat', icon: MessageSquare, path: '/chat' },
    { name: 'Feedback', icon: HelpCircle, path: '/feedback' },
  ],
  staff: [
    { name: 'Dashboard', icon: Home, path: '/staff' },
    { name: 'Complaints', icon: FileText, path: '/staff/complaints' },
    { name: 'Workers', icon: Users, path: '/staff/workers' },
    { name: 'Statistics', icon: BarChart3, path: '/staff/stats' },
    { name: 'Chat', icon: MessageSquare, path: '/staff/chat' },
  ],
  worker: [
    { name: 'Dashboard', icon: Home, path: '/worker' },
    { name: 'All Assignments', icon: CheckSquare, path: '/worker/tasks' },
    { name: 'Profile', icon: User, path: '/worker/profile' },
    { name: 'My Reports', icon: BarChart3, path: '/worker/reports' },
  ],
  admin: [
    { name: 'Dashboard', icon: Shield, path: '/admin' },
    { name: 'Users', icon: Users, path: '/admin/users' },
    { name: 'Departments', icon: Building, path: '/admin/departments' },
    { name: 'Complaints', icon: FileText, path: '/admin/complaints' },
    { name: 'Reports', icon: FileText, path: '/admin/reports' },
    { name: 'Analytics', icon: BarChart, path: '/admin/analytics' },
  ],
};

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  // Use actual user role from authentication
  const currentRole = user?.role || 'citizen';
  const navigation = (navItems[currentRole] || navItems.citizen).map((item) => {
    if (currentRole === 'citizen' && user?.slug) {
      const base = `/${user.slug}`;
      // Remove leading slash from item.path if it exists to avoid double slashes
      const cleanPath = item.path.startsWith('/') ? item.path.slice(1) : item.path;
      return { ...item, path: `${base}/${cleanPath}` };
    } else if (currentRole === 'staff' && user?.department?.slug) {
      const base = `/${user.department.slug}`;
      // Remove leading slash from item.path if it exists to avoid double slashes
      const cleanPath = item.path.startsWith('/') ? item.path.slice(1) : item.path;
      return { ...item, path: `${base}/${cleanPath}` };
    }
    return item;
  });

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 bg-white/30 dark:bg-gray-900/30 backdrop-blur-lg border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 ease-in-out",
        "lg:translate-x-0", // Always visible on large screens
        isOpen ? "translate-x-0" : "-translate-x-full" // Mobile toggle
      )}
    >
      <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
        {/* Logo: context-aware link */}
        <Link
          to={
            location.pathname.startsWith('/admin') ? '/admin'
            : location.pathname.startsWith('/staff') ? '/staff'
            : location.pathname.startsWith('/worker') ? '/worker'
            : (user?.slug ? `/${user.slug}/dashboard` : '/dashboard')
          }
          className="text-2xl font-bold text-blue-600"
        >
          CivicMitra
        </Link>
        {/* Close button for mobile, if needed */}
        {/* <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
          <X className="h-6 w-6" />
        </Button> */}
      </div>
      <nav className="flex flex-col p-4 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={onClose} // Close sidebar on navigation for mobile
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-50 transition-all hover:bg-gray-100 dark:hover:bg-gray-800",
                isActive ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300" : ""
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={() => {
            logout();
            onClose();
          }}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-900 dark:text-gray-50 transition-all hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left"
        >
          <LogOut className="h-5 w-5" />
          Log out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
