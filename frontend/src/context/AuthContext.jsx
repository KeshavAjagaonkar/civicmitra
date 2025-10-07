// src/context/AuthContext.jsx
import React, { createContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
  error: null,
};

export const AuthContext = createContext(initialState);

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_LOADING':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case 'LOGIN_ERROR':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: action.payload.error,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,
      };
    case 'SET_USER':
      return {
        ...state,
        isAuthenticated: !!action.payload.user,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case 'AUTH_LOADED':
      return { ...state, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { toast } = useToast();

  // Auto-logout after 1 hour of inactivity
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    const loginTime = localStorage.getItem('loginTime');

    if (token && userString) {
      try {
        const user = JSON.parse(userString);

        // Check if login time exists and if 1 hour has passed
        if (loginTime) {
          const currentTime = Date.now();
          const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

          if (currentTime - parseInt(loginTime) > oneHour) {
            // More than 1 hour has passed, auto-logout
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('loginTime');
            localStorage.removeItem('lastActivity');
            dispatch({ type: 'AUTH_LOADED' });
            toast({
              title: "Session Expired",
              description: "You have been logged out due to inactivity",
              variant: "destructive"
            });
            return;
          }
        }

        dispatch({ type: 'SET_USER', payload: { user, token } });
      } catch (error) {
        localStorage.clear();
        dispatch({ type: 'AUTH_LOADED' });
      }
    } else {
      dispatch({ type: 'AUTH_LOADED' });
    }
  }, [toast]);

  // Activity tracking - reset timer on user activity
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const updateActivity = () => {
      localStorage.setItem('lastActivity', Date.now().toString());
    };

    // Track user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => window.addEventListener(event, updateActivity));

    // Check for inactivity every minute
    const inactivityCheck = setInterval(() => {
      const lastActivity = localStorage.getItem('lastActivity');
      const loginTime = localStorage.getItem('loginTime');

      if (lastActivity && loginTime) {
        const currentTime = Date.now();
        const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

        // Check if 1 hour has passed since login OR last activity
        const timeSinceLogin = currentTime - parseInt(loginTime);
        const timeSinceActivity = currentTime - parseInt(lastActivity);

        if (timeSinceLogin > oneHour || timeSinceActivity > oneHour) {
          // Auto-logout
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('loginTime');
          localStorage.removeItem('lastActivity');
          dispatch({ type: 'LOGOUT' });
          toast({
            title: "Session Expired",
            description: "You have been logged out due to inactivity (1 hour)",
            variant: "destructive"
          });
          window.location.href = '/';
        }
      }
    }, 60000); // Check every minute

    return () => {
      events.forEach(event => window.removeEventListener(event, updateActivity));
      clearInterval(inactivityCheck);
    };
  }, [state.isAuthenticated, toast]);

  // --- THIS IS THE CORRECTED FUNCTION ---
  const login = useCallback(async (credentials) => { // Removed the 'role' parameter
    try {
      dispatch({ type: 'AUTH_LOADING' });

      const base = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const res = await fetch(`${base}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // The 'role' is no longer sent. The backend will determine the role.
        body: JSON.stringify(credentials), 
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('loginTime', Date.now().toString());
      localStorage.setItem('lastActivity', Date.now().toString());
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user: data.user, token: data.token } });

      return { success: true, user: data.user, token: data.token };
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: { error: error.message } });
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
      throw error; // Re-throw the error so the component knows it failed
    }
  }, [toast]);
  
  const register = useCallback(async (userData, role = 'citizen') => {
    try {
      dispatch({ type: 'AUTH_LOADING' });

      const base = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const res = await fetch(`${base}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('loginTime', Date.now().toString());
      localStorage.setItem('lastActivity', Date.now().toString());
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user: data.user, token: data.token } });

      return { success: true, user: data.user, token: data.token };
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: { error: error.message } });
      toast({ title: "Registration Failed", description: error.message, variant: "destructive" });
      throw error;
    }
  }, [toast]);
  
  const setAuth = useCallback(({ user, token }) => {
    if (token) localStorage.setItem('token', token);
    if (user) localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('loginTime', Date.now().toString());
    localStorage.setItem('lastActivity', Date.now().toString());
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('lastActivity');
    dispatch({ type: 'LOGOUT' });
    toast({ title: "Logged Out" });
  }, [toast]);

  const hasRole = useCallback((requiredRole) => {
    if (!state.user || !state.isAuthenticated) return false;
    if (Array.isArray(requiredRole)) return requiredRole.includes(state.user.role);
    return state.user.role === requiredRole;
  }, [state.user, state.isAuthenticated]);

  const contextValue = useMemo(() => ({
    ...state,
    login,
    register,
    logout,
    hasRole,
    setAuth,
  }), [state, login, register, logout, hasRole, setAuth]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
