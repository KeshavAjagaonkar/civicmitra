import { Link, useLocation, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { Sun, Moon, Bell, User, Search, Menu, UserCircle, Settings, LogOutIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import { useNotifications } from '@/context/NotificationContext';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const Navbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { user, logout } = useAuth();
  
  // A handler to navigate to the correct complaint page based on user role
  const handleNotificationClick = (notification) => {
    markAsRead(notification._id);
    if (notification.complaintId) {
      // Construct role-aware path
      let path;
      switch (user.role) {
        case 'admin':
          path = `/admin/complaints/${notification.complaintId}`;
          break;
        case 'staff':
          path = `/staff/complaints/${notification.complaintId}`;
          break;
        case 'worker':
          path = `/worker/tasks/${notification.complaintId}`;
          break;
        case 'citizen':
        default:
          path = `/complaints/${notification.complaintId}`;
          break;
      }
      navigate(path);
    }
  };

  const getProfilePath = () => {
    switch (user?.role) {
      case 'admin': return '/admin/profile';
      case 'staff': return '/staff/profile';
      case 'worker': return '/worker/profile';
      default: return '/profile';
    }
  };
  
  const getLogoPath = () => {
     switch (user?.role) {
      case 'admin': return '/admin';
      case 'staff': return '/staff';
      case 'worker': return '/worker';
      case 'citizen':
        return user?.slug ? `/${user.slug}/dashboard` : '/dashboard';
      default: return '/dashboard';
    }
  };

  return (
    <header className="sticky top-0 z-40 glass-navbar">
      <div className="container mx-auto flex items-center justify-between h-16 px-4 md:px-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar}>
              <Menu className="h-6 w-6" />
          </Button>
          <Link to={getLogoPath()} className="text-2xl font-bold text-blue-600">
            CivicMitra
          </Link>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
                <Bell className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 md:w-96 glass-card p-0 rounded-2xl" align="end">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                   <h4 className="font-semibold leading-none">Notifications</h4>
                   {unreadCount > 0 && (
                     <Button variant="link" size="sm" className="p-0 h-auto" onClick={markAllAsRead}>Mark all as read</Button>
                   )}
                </div>
                 <p className="text-sm text-muted-foreground mt-1">You have {unreadCount} unread messages.</p>
              </div>
              <div className="max-h-80 overflow-y-auto p-2">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={cn(
                        "grid grid-cols-[auto_1fr] items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer",
                        "hover:bg-gray-100 dark:hover:bg-gray-800",
                        !notification.read && "bg-blue-50 dark:bg-blue-900/20"
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="mt-1">
                        {!notification.read && (
                           <span className="block h-2.5 w-2.5 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold leading-none">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8 text-sm text-muted-foreground">
                    You have no new notifications.
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 border-2 border-blue-700 dark:border-blue-400">
                <User className="h-5 w-5 text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(getProfilePath())}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(getProfilePath())}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { logout(); navigate('/'); }}>
                <LogOutIcon className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
