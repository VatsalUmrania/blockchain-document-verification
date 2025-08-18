// src/services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('📤 API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`📥 API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('📥 API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API methods
export const apiService = {
  // Health check
  healthCheck: () => api.get('/health'),

  // Document operations
  createDocument: (documentData) => api.post('/documents', documentData),
  
  getUserDocuments: (walletAddress) => api.get(`/documents/user/${walletAddress}`),
  
  getDocumentStats: (walletAddress) => api.get(`/documents/stats/${walletAddress}`),
  
  verifyDocument: (documentHash, userWalletAddress, verificationData) => 
    api.put(`/documents/${documentHash}/verify`, {
      userWalletAddress,
      verificationData
    }),
  
  getDocumentStatus: (documentHash, userWalletAddress) => 
    api.get(`/documents/status/${documentHash}/${userWalletAddress}`),
  
  getRecentActivity: (walletAddress, limit = 10) => 
    api.get(`/documents/activity/${walletAddress}?limit=${limit}`)
};

export default api;
