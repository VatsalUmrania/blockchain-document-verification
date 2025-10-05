import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

// 1. Create a configured instance of axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 2. Use a request interceptor to automatically add the JWT to every API call
api.interceptors.request.use(
  (config) => {
    // Get the token from local storage
    const token = localStorage.getItem('authToken');
    
    // If the token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // Handle any errors that occur during request setup
    return Promise.reject(error);
  }
);

// 3. Use a response interceptor to handle global errors, like authentication failures
api.interceptors.response.use(
  (response) => {
    // If the response is successful, just return it
    return response;
  },
  (error) => {
    // --- ENHANCEMENT: Handle 401 Unauthorized errors ---
    // This is crucial for security. If the server says our token is invalid,
    // we log the user out and redirect them to the home page.
    if (error.response?.status === 401) {
      console.log('Authentication error: Token is invalid or expired. Logging out.');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Redirect to the home page, but only if we are not already there
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    
    // Return the error so it can be handled by the component that made the call
    return Promise.reject(error);
  }
);

export default api;