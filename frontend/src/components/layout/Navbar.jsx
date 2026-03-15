import { Link, useNavigate } from 'react-router-dom';
import React from 'react';
import { Sun, Moon, Bell, User, Menu, Settings, LogOut, CheckCheck, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/DropdownMenu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import { useNotifications } from '@/context/NotificationContext';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

const Navbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { user, logout } = useAuth();

  const getProfilePath = () => {
    switch (user?.role) {
      case 'admin':  return '/admin/profile';
      case 'staff':  return user?.department?.slug ? `/${user.department.slug}/staff/profile` : '/staff/profile';
      case 'worker': return '/worker/profile';
      default:       return user?.slug ? `/${user.slug}/profile` : '/profile';
    }
  };

  const getSettingsPath = () => {
    switch (user?.role) {
      case 'admin':  return '/admin/settings';
      case 'staff':  return user?.department?.slug ? `/${user.department.slug}/staff/settings` : '/staff/settings';
      case 'worker': return '/worker/settings';
      default:       return user?.slug ? `/${user.slug}/settings` : '/settings';
    }
  };

  const getLogoPath = () => {
    switch (user?.role) {
      case 'admin':  return '/admin';
      case 'staff':  return user?.department?.slug ? `/${user.department.slug}/staff` : '/staff';
      case 'worker': return '/worker';
      default:       return user?.slug ? `/${user.slug}/dashboard` : '/dashboard';
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification._id);
    if (!notification.complaintId) return;
    const paths = {
      admin:   `/admin/complaints/${notification.complaintId}`,
      staff:   `/staff/complaints/${notification.complaintId}`,
      worker:  `/worker/tasks/${notification.complaintId}`,
      citizen: `/complaints/${notification.complaintId}`,
    };
    navigate(paths[user?.role] ?? paths.citizen);
  };

  // Navigate first → clear auth in next tick to avoid unmount crash
  const handleLogout = () => {
    navigate('/', { replace: true });
    setTimeout(() => logout(), 0);
  };

  return (
    <header className="sticky top-0 z-40 h-14 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between h-full px-4 md:px-6">

        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-1.5 rounded-md text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link to={getLogoPath()} className="flex items-center gap-2">
            <span className="text-base font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
              CivicMitra
            </span>
            {user?.role && (
              <span className="text-xs text-gray-400 dark:text-gray-500 capitalize hidden sm:block">
                / {user.role}
              </span>
            )}
          </Link>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1">

          {/* Theme toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={isDarkMode ? 'Light mode' : 'Dark mode'}
          >
            {isDarkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-[18px] w-[18px]" />}
          </button>

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="relative p-2 rounded-md text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
                )}
                <Bell className="h-[18px] w-[18px]" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-80 p-0 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950"
              align="end"
              sideOffset={6}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800/50">
                {notifications.length > 0 ? notifications.map((n) => (
                  <button
                    key={n._id}
                    className={cn(
                      'w-full text-left px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900',
                      !n.read && 'bg-blue-50/50 dark:bg-blue-950/20'
                    )}
                    onClick={() => handleNotificationClick(n)}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className={cn('mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0', !n.read ? 'bg-blue-500' : 'bg-transparent')} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-snug">{n.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </button>
                )) : (
                  <div className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                    No notifications yet
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 ml-1 px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none">
                <div className="h-7 w-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                    {getInitials(user?.name)}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-200 leading-none">
                    {user?.name?.split(' ')[0]}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 capitalize mt-0.5">
                    {user?.role}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-52 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-1"
              align="end"
              sideOffset={6}
            >
              <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 mb-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{user?.email}</p>
              </div>

              <DropdownMenuItem
                onClick={() => navigate(getProfilePath())}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <User className="h-4 w-4 text-gray-400" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate(getSettingsPath())}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Settings className="h-4 w-4 text-gray-400" />
                Settings
              </DropdownMenuItem>

              <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
