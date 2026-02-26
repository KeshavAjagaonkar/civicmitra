import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Moon, Sun, ArrowLeft } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

const AuthLayout = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-950 relative">
      {/* Header with theme toggle and back button */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <Link to="/" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleDarkMode}
          className="p-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>

      {/* Main content */}
      <div className="min-h-screen w-full flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
