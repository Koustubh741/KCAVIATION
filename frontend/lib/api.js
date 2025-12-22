/**
 * API Client for AeroIntel Backend
 * 
 * This module provides a configured axios instance for making
 * authenticated requests to the backend API.
 */

import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to all requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Only redirect if not already on auth page
        if (!window.location.pathname.includes('/auth')) {
          window.location.href = '/auth';
        }
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response?.data?.error);
    }

    // Handle 429 Rate Limit
    if (error.response?.status === 429) {
      console.error('Rate limit exceeded. Please wait before trying again.');
    }

    // Handle 500+ Server Errors
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response?.data?.error);
    }

    return Promise.reject(error);
  }
);

// ==================== AUTH API ====================

export const authAPI = {
  /**
   * Login user
   * @param {string} email 
   * @param {string} password 
   */
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  /**
   * Register new user
   * @param {object} userData - { email, password, name, role }
   */
  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  /**
   * Refresh JWT token
   */
  refresh: async () => {
    const response = await api.post('/api/auth/refresh');
    return response.data;
  },
};

// ==================== VOICE API ====================

export const voiceAPI = {
  /**
   * Transcribe audio file
   * @param {Blob} audioBlob - Audio blob to transcribe
   */
  transcribe: async (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    
    const response = await api.post('/api/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000, // 60 seconds for long recordings
    });
    
    return response.data;
  },

  /**
   * Analyze transcription with AI
   * @param {string} transcription - Text to analyze
   * @param {object} context - { airline, country, recordedBy }
   */
  analyze: async (transcription, context = {}) => {
    const response = await api.post('/api/analyze', {
      transcription,
      context,
    });
    
    return response.data;
  },
};

// ==================== INSIGHTS API ====================

export const insightsAPI = {
  /**
   * Get insights with filters
   * @param {object} filters - { airline, theme, sentiment, startDate, endDate, limit, offset }
   */
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
    const response = await api.get(`/api/insights?${params.toString()}`);
    return response.data;
  },

  /**
   * Get single insight by ID
   * @param {string} id 
   */
  getById: async (id) => {
    const response = await api.get(`/api/insights/${id}`);
    return response.data;
  },

  /**
   * Create new insight
   * @param {object} insightData 
   */
  create: async (insightData) => {
    const response = await api.post('/api/insights', insightData);
    return response.data;
  },
};

// ==================== ALERTS API ====================

export const alertsAPI = {
  /**
   * Get alerts with filters
   * @param {object} filters - { severity, airline, category, limit, offset }
   */
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
    const response = await api.get(`/api/alerts?${params.toString()}`);
    return response.data;
  },

  /**
   * Create new alert (admin/manager only)
   * @param {object} alertData 
   */
  create: async (alertData) => {
    const response = await api.post('/api/alerts', alertData);
    return response.data;
  },

  /**
   * Acknowledge an alert
   * @param {string} id 
   */
  acknowledge: async (id) => {
    const response = await api.post(`/api/alerts/${id}/acknowledge`);
    return response.data;
  },
};

// ==================== DASHBOARD API ====================

export const dashboardAPI = {
  /**
   * Get dashboard statistics
   */
  getStats: async () => {
    const response = await api.get('/api/dashboard/stats');
    return response.data;
  },
};

// ==================== HEALTH API ====================

export const healthAPI = {
  /**
   * Check backend health
   */
  check: async () => {
    const response = await api.get('/api/health');
    return response.data;
  },
};

// Export default api instance for custom requests
export default api;



