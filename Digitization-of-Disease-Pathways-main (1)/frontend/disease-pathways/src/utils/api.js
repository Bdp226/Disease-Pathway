import axios from 'axios';
import { API_BASE_URL } from './constants.js';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 50000
});

// Token management
const TOKEN_KEY = 'disease_pathway_token';
const USER_KEY = 'disease_pathway_user';

let currentToken = localStorage.getItem(TOKEN_KEY);
let currentUser = JSON.parse(localStorage.getItem(USER_KEY) || 'null');

// Request interceptor - Add auth token to headers
api.interceptors.request.use((config) => {
  if (currentToken) {
    config.headers.Authorization = `Bearer ${currentToken}`;
  }
  return config;
});

// Response interceptor - Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      clearAuthData();
      // Redirect to login only if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// Auth helper functions
const setAuthData = (token, user) => {
  currentToken = token;
  currentUser = user;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const clearAuthData = () => {
  currentToken = null;
  currentUser = null;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

const isAuthenticated = () => {
  return !!localStorage.getItem(TOKEN_KEY);
};
const getCurrentUser = () => currentUser;
const isAdmin = () => {
  const user = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  return user ? user.is_superuser === true : false;
};

// Authentication API
export const authAPI = {
  // User registration
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Registration failed');
    }
  },

  // User login
  login: async (email, password, isAdminLogin = false) => {
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      
      const endpoint = isAdminLogin ? '/auth/login/admin' : '/auth/login/user';
      
      const response = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      const token = response.data.access_token;
      
      // Get user profile
      const profileResponse = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAuthData(token, profileResponse.data);
      return { token, user: profileResponse.data };
    } catch (error) {
      console.error('Login Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Invalid credentials');
    }
  },

  // Get current user profile
  getProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch profile');
    }
  },

  // Logout
  logout: () => {
    clearAuthData();
  },

  // Health check
  getAuthHealth: async () => {
    try {
      const response = await api.get('/auth/health');
      return response.data;
    } catch (error) {
      throw new Error('Auth service unavailable');
    }
  }
};

// Disease API (Updated for auth protection)
export const diseaseAPI = {
  // PUBLIC - All data viewing remains open
  getAllDiseases: async () => {
    try {
      const response = await api.get('/diseases');
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      throw new Error('Failed to fetch diseases');
    }
  },

  getDiseaseDetails: async (diseaseName) => {
    try {
      const response = await api.get(`/diseases/${encodeURIComponent(diseaseName)}`);
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      throw new Error(`Failed to fetch details for ${diseaseName}`);
    }
  },

  getDiseasePathway: async (diseaseName, full = false) => {
    try {
      const encodedName = encodeURIComponent(diseaseName);
      const url = `/diseases/${encodedName}/pathway${full ? '?full=true' : ''}`;
      const response = await api.get(url);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching disease pathway:', error);
      throw new Error(error.response?.data?.detail || 'Failed to fetch disease pathway');
    }
  },

  getDiseaseRaw: async (diseaseName) => {
    try {
      const response = await api.get(`/diseases/${encodeURIComponent(diseaseName)}/raw`);
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      throw new Error(`Failed to fetch raw data for ${diseaseName}`);
    }
  },

  // CSV download (Public)
  downloadDiseaseCSV: async (diseaseName) => {
    try {
      const response = await api.get(`/diseases/${encodeURIComponent(diseaseName)}/download-csv`, {
        responseType: 'blob'
      });
      
      const contentDisposition = response.headers['content-disposition'];
      let filename = `${diseaseName}_pathway.csv`;
      
      if (contentDisposition && contentDisposition.includes('filename=')) {
        filename = contentDisposition.split('filename=')[1].replace(/"/g, '');
      }
      
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true, filename };
    } catch (error) {
      console.error('Download Error:', error.response?.data || error.message);
      throw new Error('Failed to download pathway data');
    }
  },

  // PROTECTED - Admin only endpoints
  uploadExcel: async (diseaseName, file, diseaseGroup = '') => {
    try {
      if (!isAdmin()) {
        throw new Error('Admin access required');
      }

      const formData = new FormData();
      formData.append('file', file);
      
      let url = `/upload-excel?disease_name=${encodeURIComponent(diseaseName)}`;
      if (diseaseGroup) {
        url += `&disease_group=${encodeURIComponent(diseaseGroup)}`;
      }
      
      const response = await api.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload Progress: ${percentCompleted}%`);
        }
      });

      return response.data;
    } catch (error) {
      if (error.response?.status === 403 || error.response?.status === 401) {
        throw new Error('Admin authentication required');
      }
      throw new Error(error.response?.data?.detail || 'Upload failed');
    }
  },

  deleteDisease: async (diseaseName) => {
    try {
      if (!isAdmin()) {
        throw new Error('Admin access required');
      }

      const response = await api.delete(`/diseases/${encodeURIComponent(diseaseName)}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 403 || error.response?.status === 401) {
        throw new Error('Admin authentication required');
      }
      throw new Error(`Failed to delete ${diseaseName}`);
    }
  },

  // System endpoints (Public)
  getHealth: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      throw new Error('API health check failed');
    }
  },

  getStats: async () => {
    try {
      const response = await api.get('/stats');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch system statistics');
    }
  }
};

// NEW: Pain Point API
export const painPointAPI = {
  // Submit verified pain point
  submitPainPoint: async (diseaseName, stageId, painPointData) => {
    try {
      if (!isAdmin()) {
        throw new Error('Admin access required to add verified pain points');
      }
      const response = await api.post(`/diseases/${encodeURIComponent(diseaseName)}/stages/${stageId}/pain-points`, painPointData);
      return response.data;
    } catch (error) {
      console.error('Submit Pain Point Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Failed to submit pain point');
    }
  },

  // Get pain points for admin (Admin only)
  getPainPoints: async (status = 'pending', page = 1, perPage = 25) => {
    try {
      if (!isAdmin()) {
        throw new Error('Admin access required');
      }

      const response = await api.get('/auth/admin/pain-points', {
        params: {
          status,
          page,
          per_page: perPage
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get Pain Points Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Failed to fetch pain points');
    }
  },

  // Approve pain point (Admin only)
  approvePainPoint: async (painPointId) => {
    try {
      if (!isAdmin()) {
        throw new Error('Admin access required');
      }

      const response = await api.put(`/auth/admin/pain-points/${painPointId}/approve`);
      return response.data;
    } catch (error) {
      console.error('Approve Pain Point Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Failed to approve pain point');
    }
  },

  // Deny pain point (Admin only)
  denyPainPoint: async (painPointId) => {
    try {
      if (!isAdmin()) {
        throw new Error('Admin access required');
      }

      const response = await api.put(`/auth/admin/pain-points/${painPointId}/deny`);
      return response.data;
    } catch (error) {
      console.error('Deny Pain Point Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Failed to deny pain point');
    }
  }
};

// Fix the contactUsAPI
export const contactUsAPI = {
  // Submit contact form (No authentication required) 
  submitContactForm: async (contactData) => {
    try {
      const response = await api.post('/auth/contact-us/submit', contactData);
      return response.data;
    } catch (error) {
      console.error('Submit Contact Form Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Failed to submit contact form');
    }
  },

  // Admin: Get contact submissions (Admin only) 
  getContactSubmissions: async (page = 1, perPage = 20, search = '') => {
    try {
      // ✅ Use existing functions instead of undefined checkAuthAndAdmin
      if (!isAuthenticated()) {
        throw new Error('Authentication required');
      }
      if (!isAdmin()) {
        throw new Error('Admin access required');
      }
      
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString()
      });
      
      if (search && search.trim()) {
        params.append('search', search.trim());
      }
      
      const response = await api.get(`/auth/admin/contact-us?${params}`);
      return response.data;
    } catch (error) {
      console.error('Get Contact Submissions Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Failed to fetch contact submissions');
    }
  },

  // Admin: Get specific contact submission (Admin only) 
  getContactSubmissionDetail: async (contactId) => {
    try {
      if (!isAuthenticated()) {
        throw new Error('Authentication required');
      }
      if (!isAdmin()) {
        throw new Error('Admin access required');
      }
      
      const response = await api.get(`/auth/admin/contact-us/${contactId}`);
      return response.data;
    } catch (error) {
      console.error('Get Contact Submission Detail Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Failed to fetch contact submission details');
    }
  },

  // Admin: Delete contact submission (Admin only) 
  deleteContactSubmission: async (contactId) => {
    try {
      if (!isAuthenticated()) {
        throw new Error('Authentication required');
      }
      if (!isAdmin()) {
        throw new Error('Admin access required');
      }
      
      const response = await api.delete(`/auth/admin/contact-us/${contactId}`);
      return response.data;
    } catch (error) {
      console.error('Delete Contact Submission Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || 'Failed to delete contact submission');
    }
  }
};

// NEW: Machine Learning API
export const mlAPI = {
  getRiskClassification: async (text) => {
    try {
      const response = await api.post('/ml/classify', { text });
      return response.data;
    } catch (error) {
      console.error('Classification Error:', error);
      throw error;
    }
  },
  getRecommendations: async (diseaseName, query) => {
    try {
      const disease = (diseaseName || 'cad').toLowerCase();
      const response = await api.post(`/ml/${disease}/recommend`, { query, top_k: 2 });
      return response.data;
    } catch (error) {
      console.error('Recommendation Error:', error);
      throw error;
    }
  }
};

// Export helper functions
export {
  isAuthenticated,
  getCurrentUser,
  isAdmin,
  clearAuthData
};

