import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentRole, setCurrentRole] = useState('citizen');
  
  let location;
  try {
    location = useLocation();
  } catch (error) {
    console.warn('ThemeProvider: useLocation failed, using fallback', error);
    location = { pathname: '/' };
  }

  // Determine current role based on route
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/admin')) {
      setCurrentRole('admin');
    } else if (path.startsWith('/staff')) {
      setCurrentRole('staff');
    } else if (path.startsWith('/worker')) {
      setCurrentRole('worker');
    } else {
      setCurrentRole('citizen');
    }
  }, [location]);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        setIsDarkMode(true);
        if (document.documentElement) {
          document.documentElement.classList.add('dark');
        }
      } else {
        setIsDarkMode(false);
        if (document.documentElement) {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch (error) {
      console.warn('ThemeProvider: Failed to initialize theme', error);
      setIsDarkMode(false);
    }
  }, []);

  // Apply role-based theme classes to body
  useEffect(() => {
    // Remove all role theme classes
    document.body.classList.remove('citizen-theme', 'admin-theme', 'staff-theme', 'worker-theme');
    // Add current role theme class
    document.body.classList.add(`${currentRole}-theme`);
  }, [currentRole]);

  const toggleDarkMode = () => {
    try {
      const newDarkMode = !isDarkMode;
      setIsDarkMode(newDarkMode);
      
      if (document.documentElement) {
        if (newDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      
      if (typeof Storage !== 'undefined') {
        localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
      }
    } catch (error) {
      console.warn('ThemeProvider: Failed to toggle theme', error);
    }
  };

  const getRoleConfig = (role) => {
    const configs = {
      citizen: {
        name: 'Citizen',
        primaryColor: '#3B82F6', // Blue
        secondaryColor: '#1E40AF',
        accentColor: '#60A5FA',
        icon: '👤',
        description: 'File and track your complaints'
      },
      admin: {
        name: 'Administrator',
        primaryColor: '#DC2626', // Red
        secondaryColor: '#B91C1C',
        accentColor: '#F87171',
        icon: '⚙️',
        description: 'Manage system and users'
      },
      staff: {
        name: 'Department Staff',
        primaryColor: '#059669', // Green
        secondaryColor: '#047857',
        accentColor: '#34D399',
        icon: '👔',
        description: 'Manage department complaints'
      },
      worker: {
        name: 'Field Worker',
        primaryColor: '#D97706', // Orange
        secondaryColor: '#B45309',
        accentColor: '#FBBF24',
        icon: '🔧',
        description: 'Update task progress'
      }
    };
    
    return configs[role] || configs.citizen;
  };

  const value = {
    isDarkMode,
    toggleDarkMode,
    currentRole,
    setCurrentRole,
    getRoleConfig,
    roleConfig: getRoleConfig(currentRole)
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};