import React, { createContext, useReducer, useContext, useCallback, useMemo } from 'react';
import useApi from '../hooks/useApi';
import { useToast } from '../components/ui/use-toast';

const ComplaintContext = createContext();

const complaintReducer = (state, action) => {
  switch (action.type) {
    case 'GET_COMPLAINTS_SUCCESS':
      return {
        ...state,
        complaints: action.payload,
        loading: false,
        error: null,
      };
    case 'GET_COMPLAINT_SUCCESS':
      return {
        ...state,
        selectedComplaint: action.payload,
        loading: false,
        error: null,
      };
    case 'ADD_COMPLAINT_SUCCESS':
      return {
        ...state,
        complaints: [action.payload, ...state.complaints],
        loading: false,
        error: null,
      };
    case 'UPDATE_COMPLAINT_SUCCESS':
      return {
        ...state,
        complaints: state.complaints.map((complaint) =>
          complaint._id === action.payload._id ? action.payload : complaint
        ),
        selectedComplaint: action.payload,
        loading: false,
        error: null,
      };
    case 'COMPLAINT_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: true,
      };
    default:
      return state;
  }
};

export const ComplaintProvider = ({ children }) => {
  const initialState = {
    complaints: [],
    selectedComplaint: null,
    loading: false,
    error: null,
  };

  const [state, dispatch] = useReducer(complaintReducer, initialState);
  const { request } = useApi();
  const { toast } = useToast();

  const getMyComplaints = useCallback(async () => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const res = await request('/api/complaints/my');
      dispatch({
        type: 'GET_COMPLAINTS_SUCCESS',
        payload: res.data,
      });
    } catch (err) {
      dispatch({
        type: 'COMPLAINT_ERROR',
        payload: err.message,
      });
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  }, [request, toast]);

  const getAllComplaints = useCallback(async (params = {}) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const query = new URLSearchParams(params).toString();
      const res = await request(`/api/complaints/all${query ? `?${query}` : ''}`);
      dispatch({
        type: 'GET_COMPLAINTS_SUCCESS',
        payload: res.data,
      });
    } catch (err) {
      dispatch({
        type: 'COMPLAINT_ERROR',
        payload: err.message,
      });
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  }, [request, toast]);

  const getComplaintById = useCallback(async (id) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const res = await request(`/api/complaints/${id}`);
      dispatch({
        type: 'GET_COMPLAINT_SUCCESS',
        payload: res.data,
      });
    } catch (err) {
      dispatch({
        type: 'COMPLAINT_ERROR',
        payload: err.message,
      });
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  }, [request, toast]);

  const createComplaint = useCallback(async (formData) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const res = await request('/api/complaints', 'POST', formData);
      dispatch({
        type: 'ADD_COMPLAINT_SUCCESS',
        payload: res.data,
      });
      toast({ title: 'Success', description: 'Complaint created successfully', variant: 'success' });
    } catch (err) {
      dispatch({
        type: 'COMPLAINT_ERROR',
        payload: err.message,
      });
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  }, [request, toast]);

  const updateComplaintStatus = useCallback(async (id, status, remarks) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const res = await request(`/api/complaints/${id}/status`, 'PATCH', { status, remarks });
      dispatch({
        type: 'UPDATE_COMPLAINT_SUCCESS',
        payload: res.data,
      });
      toast({ title: 'Success', description: 'Complaint status updated', variant: 'success' });
    } catch (err) {
      dispatch({
        type: 'COMPLAINT_ERROR',
        payload: err.message,
      });
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  }, [request, toast]);

  const updateComplaintTimeline = useCallback(async (id, timelineData) => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const res = await request(`/api/complaints/${id}/timeline`, 'PUT', timelineData);
      dispatch({
        type: 'UPDATE_COMPLAINT_SUCCESS',
        payload: res.data,
      });
      toast({ title: 'Success', description: 'Timeline updated successfully', variant: 'success' });
    } catch (err) {
      dispatch({
        type: 'COMPLAINT_ERROR',
        payload: err.message,
      });
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  }, [request, toast]);

  const contextValue = useMemo(() => ({
    ...state,
    getMyComplaints,
    getAllComplaints,
    getComplaintById,
    createComplaint,
    updateComplaintStatus,
    updateComplaintTimeline,
  }), [state, getMyComplaints, getAllComplaints, getComplaintById, createComplaint, updateComplaintStatus, updateComplaintTimeline]);

  return (
    <ComplaintContext.Provider value={contextValue}>
      {children}
    </ComplaintContext.Provider>
  );
};

export const useComplaints = () => {
  const context = useContext(ComplaintContext);
  if (context === undefined) {
    throw new Error('useComplaints must be used within a ComplaintProvider');
  }
  return context;
};