import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Add response interceptor to handle 401 errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!sessionStorage.getItem('isRedirecting')) {
        sessionStorage.setItem('isRedirecting', 'true');
        console.warn('Unauthorized - Token may be expired. Logging out...');
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        // Redirect to login page ONLY if not already there
        if (window.location.pathname !== '/') {
          window.location.replace('/');
        } else {
          sessionStorage.removeItem('isRedirecting');
        }
      }
    }
    return Promise.reject(error);
  }
);

export default API;
