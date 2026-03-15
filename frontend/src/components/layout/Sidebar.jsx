import React from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import {
  Home, FileText, Shield, Users, Building, Wrench, MessageSquare, HelpCircle,
  LogOut, BarChart3, CheckSquare, Globe, Building2, BarChart
} from 'lucide-react';

// Nav item config with per-item icon bubble colors
const navItems = {
  citizen: [
    { name: 'Dashboard', icon: Home, path: '/dashboard', color: 'blue' },
    { name: 'Public Feed', icon: Globe, path: '/public', color: 'cyan' },
    { name: 'My Complaints', icon: FileText, path: '/complaints', color: 'violet' },
    { name: 'File Complaint', icon: FileText, path: '/complaints/create', color: 'indigo' },
    { name: 'Chat', icon: MessageSquare, path: '/chat', color: 'green' },
    { name: 'Feedback', icon: HelpCircle, path: '/feedback', color: 'amber' },
  ],
  staff: [
    { name: 'Dashboard', icon: Home, path: '/staff', color: 'blue' },
    { name: 'Complaints', icon: FileText, path: '/staff/complaints', color: 'violet' },
    { name: 'Workers', icon: Users, path: '/staff/workers', color: 'pink' },
    { name: 'Statistics', icon: BarChart3, path: '/staff/stats', color: 'indigo' },
    { name: 'Chat', icon: MessageSquare, path: '/staff/chat', color: 'green' },
  ],
  worker: [
    { name: 'Dashboard', icon: Home, path: '/worker', color: 'blue' },
    { name: 'All Assignments', icon: CheckSquare, path: '/worker/tasks', color: 'violet' },
    { name: 'Profile', icon: Users, path: '/worker/profile', color: 'pink' },
    { name: 'My Reports', icon: BarChart3, path: '/worker/reports', color: 'indigo' },
  ],
  admin: [
    { name: 'Dashboard', icon: Shield, path: '/admin', color: 'blue' },
    { name: 'Users', icon: Users, path: '/admin/users', color: 'pink' },
    { name: 'Departments', icon: Building, path: '/admin/departments', color: 'amber' },
    { name: 'Complaints', icon: FileText, path: '/admin/complaints', color: 'violet' },
    { name: 'Reports', icon: FileText, path: '/admin/reports', color: 'indigo' },
    { name: 'Analytics', icon: BarChart, path: '/admin/analytics', color: 'slate' },
  ],
};

const colorMap = {
  blue:   { bubble: 'bg-blue-100 dark:bg-blue-900/30',   icon: 'text-blue-600 dark:text-blue-400' },
  cyan:   { bubble: 'bg-cyan-100 dark:bg-cyan-900/30',   icon: 'text-cyan-600 dark:text-cyan-400' },
  violet: { bubble: 'bg-violet-100 dark:bg-violet-900/30', icon: 'text-violet-600 dark:text-violet-400' },
  indigo: { bubble: 'bg-indigo-100 dark:bg-indigo-900/30', icon: 'text-indigo-600 dark:text-indigo-400' },
  green:  { bubble: 'bg-green-100 dark:bg-green-900/30', icon: 'text-green-600 dark:text-green-400' },
  amber:  { bubble: 'bg-amber-100 dark:bg-amber-900/30', icon: 'text-amber-600 dark:text-amber-400' },
  pink:   { bubble: 'bg-pink-100 dark:bg-pink-900/30',   icon: 'text-pink-600 dark:text-pink-400' },
  slate:  { bubble: 'bg-slate-100 dark:bg-slate-800',    icon: 'text-slate-600 dark:text-slate-400' },
};

const roleLabels = {
  citizen: 'Citizen',
  staff: 'Staff',
  worker: 'Field Worker',
  admin: 'Administrator',
};

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // LOGOUT FIX: navigate to public page first, clear auth state in next tick
  const handleLogout = () => {
    onClose();
    navigate('/', { replace: true });
    setTimeout(() => logout(), 0);
  };

  const currentRole = user?.role || 'citizen';
  const navigation = (navItems[currentRole] || navItems.citizen).map((item) => {
    if (currentRole === 'citizen' && user?.slug) {
      const base = `/${user.slug}`;
      const cleanPath = item.path.startsWith('/') ? item.path.slice(1) : item.path;
      return { ...item, path: `${base}/${cleanPath}` };
    } else if (currentRole === 'staff' && user?.department?.slug) {
      const base = `/${user.department.slug}`;
      const cleanPath = item.path.startsWith('/') ? item.path.slice(1) : item.path;
      return { ...item, path: `${base}/${cleanPath}` };
    }
    return item;
  });

  const logoPath =
    location.pathname.startsWith('/admin') ? '/admin'
      : location.pathname.startsWith('/staff') ? '/staff'
        : location.pathname.startsWith('/worker') ? '/worker'
          : (user?.slug ? `/${user.slug}/dashboard` : '/dashboard');

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 ease-in-out flex flex-col",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center px-5 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <Link to={logoPath} className="flex items-center gap-2.5" onClick={onClose}>
          <Building2 className="h-5 w-5 text-blue-600" />
          <span className="text-xl font-bold text-blue-600">CivicMitra</span>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {navigation.map((item) => {
          const colors = colorMap[item.color] || colorMap.blue;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              end
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all text-sm",
                  "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100",
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/20 border-l-2 border-l-blue-600 text-blue-700 dark:text-blue-400 font-medium"
                    : ""
                )
              }
            >
              <div className={cn("flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0", colors.bubble)}>
                <item.icon className={cn("h-3.5 w-3.5", colors.icon)} />
              </div>
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User card at bottom */}
      <div className="flex-shrink-0 p-3 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
            <span className="text-sm font-bold text-blue-700 dark:text-blue-400">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user?.name || 'User'}</p>
            <span className="inline-block mt-0.5 text-xs px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium">
              {roleLabels[currentRole] || currentRole}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
