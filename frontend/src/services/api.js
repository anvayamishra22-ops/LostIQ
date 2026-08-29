import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api'),
});

// Auto-inject JWT token into requests if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Authentication endpoints
export const authAPI = {
  register: (userData) => API.post('/auth/register', userData),
  login: (credentials) => API.post('/auth/login', credentials),
  getMe: () => API.get('/auth/me'),
};

// Item endpoints
export const itemAPI = {
  create: (formData) => API.post('/items', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAll: (params) => API.get('/items', { params }),
  getById: (id) => API.get(`/items/${id}`),
  update: (id, formData) => API.put(`/items/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => API.delete(`/items/${id}`),
  recover: (id) => API.put(`/items/${id}/recover`),
  getMyReports: () => API.get('/items/myreports'),
};

// Claim endpoints
export const claimAPI = {
  create: (claimData) => API.post('/claims', claimData),
  getMyClaims: () => API.get('/claims/myclaims'),
  getReceivedClaims: () => API.get('/claims/received'),
  updateStatus: (id, status) => API.put(`/claims/${id}`, { status }),
};

// Admin endpoints
export const adminAPI = {
  getUsers: () => API.get('/admin/users'),
  getItems: () => API.get('/admin/items'),
  getClaims: () => API.get('/admin/claims'),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
};

export default API;
