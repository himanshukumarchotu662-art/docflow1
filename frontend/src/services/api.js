import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);
export const getProfile = () => api.get('/auth/me');
export const updateProfile = (profileData) => {
  // Check if profileData is FormData (for photo upload)
  if (profileData instanceof FormData) {
    const token = localStorage.getItem('token');
    return axios.put(`${API_URL}/auth/update-profile`, profileData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
  }
  return api.put('/auth/update-profile', profileData);
};

// Documents API calls
export const uploadDocument = (formData) => {
  const token = localStorage.getItem('token');
  return axios.post(`${API_URL}/documents/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getMyDocuments = () => api.get('/documents/my-documents');
export const getPendingDocuments = () => api.get('/documents/pending');
export const getApprovalHistory = () => api.get('/documents/approval-history');
export const getDocumentById = (id) => api.get(`/documents/${id}`);
export const updateDocumentStatus = (id, data) => api.put(`/documents/${id}/status`, data);
export const assignDocumentToSelf = (id) => api.put(`/documents/${id}/assign`);
export const getDocumentStats = () => api.get('/documents/stats');
export const getAllDocuments = () => api.get('/documents');

export const getFileUrl = (filePath) => {
  if (!filePath) return '';
  if (filePath.startsWith('http')) return filePath;
  
  // Use VITE_SOCKET_URL if available, otherwise fallback to localhost:5000
  // This avoids issues with API_URL string manipulation
  const baseUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
  
  // Ensure filePath starts with /
  const path = filePath.startsWith('/') ? filePath : `/${filePath}`;
  return `${baseUrl}${path}`;
};

export default api;