import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';

const useApi = () => {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(
    async (url, method = 'GET', body = null) => {
      setIsLoading(true);
      setError(null);

      const isFormData = body instanceof FormData;
      const headers = {};

      // Don't set Content-Type for FormData - browser will set it with boundary
      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      try {
        const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

        console.log('API Request:', { method, url: fullUrl, hasBody: !!body, isFormData });

        const fetchOptions = {
          method,
          headers,
        };

        if (body) {
          fetchOptions.body = isFormData ? body : JSON.stringify(body);
        }

        const response = await fetch(fullUrl, fetchOptions);

        let data;
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const text = await response.text();
          data = { message: text };
        }

        if (!response.ok) {
          const serverMessage = data?.error || data?.message;
          const err = new Error(serverMessage || `Request failed (${response.status})`);
          err.status = response.status;
          throw err;
        }

        setIsLoading(false);
        return data;
      } catch (err) {
        setIsLoading(false);
        setError(err.message);
        throw err;
      }
    },
    [token]
  );

  return { isLoading, error, request };
};

export default useApi;
