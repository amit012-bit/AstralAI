/**
 * API Client Configuration
 * Handles all API calls to the backend with proper error handling and authentication
 */

import axios, { AxiosResponse, AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';

// API base configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add authentication token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token');
    console.log('API Request - Token present:', !!token, 'URL:', config.url);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    console.log('API Error:', error.response?.status, error.response?.data, 'URL:', error.config?.url);
    
    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    const errorMessage = (data as any)?.message || 'An error occurred';

    switch (status) {
      case 401:
        // Unauthorized - clear token and redirect to login
        Cookies.remove('auth_token');
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        toast.error('Session expired. Please login again.');
        break;
      case 403:
        toast.error('Access denied. You do not have permission.');
        break;
      case 404:
        toast.error('Resource not found.');
        break;
      case 422:
        // Validation errors
        const validationErrors = (data as any)?.errors;
        if (validationErrors && Array.isArray(validationErrors)) {
          validationErrors.forEach((err: any) => {
            toast.error(err.message);
          });
        } else {
          toast.error(errorMessage);
        }
        break;
      case 429:
        toast.error('Too many requests. Please try again later.');
        break;
      case 500:
        toast.error('Server error. Please try again later.');
        break;
      default:
        toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  count: number;
  total: number;
  currentPage: number;
  totalPages: number;
}

// Auth API functions
export const authApi = {
  // Register new user
  register: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: 'customer' | 'vendor';
    phone?: string;
    industry?: string;
    interests?: string[];
  }) => {
    const response = await api.post<ApiResponse>('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post<ApiResponse>('/auth/login', credentials);
    return response.data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await api.get<ApiResponse>('/auth/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData: any) => {
    const response = await api.put<ApiResponse>('/auth/profile', profileData);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const response = await api.put<ApiResponse>('/auth/change-password', passwordData);
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post<ApiResponse>('/auth/logout');
    return response.data;
  },
};

// Solutions API functions
export const solutionsApi = {
  // Get all solutions with filtering
  getSolutions: async (params: {
    page?: number;
    limit?: number;
    category?: string;
    industry?: string;
    vendorId?: string;
    search?: string;
    sort?: string;
    minRating?: number;
    maxPrice?: number;
    pricingModel?: string;
    deploymentType?: string;
  } = {}) => {
    const response = await api.get<PaginatedResponse<any>>('/solutions', { params });
    return response.data;
  },

  // Get single solution
  getSolution: async (id: string) => {
    const response = await api.get<ApiResponse>(`/solutions/${id}`);
    return response.data;
  },

  // Create new solution
  createSolution: async (solutionData: any) => {
    const response = await api.post<ApiResponse>('/solutions', solutionData);
    return response.data;
  },

  // Update solution
  updateSolution: async (id: string, solutionData: any) => {
    const response = await api.put<ApiResponse>(`/solutions/${id}`, solutionData);
    return response.data;
  },

  // Delete solution
  deleteSolution: async (id: string) => {
    const response = await api.delete<ApiResponse>(`/solutions/${id}`);
    return response.data;
  },

  // Get featured solutions
  getFeaturedSolutions: async (limit?: number) => {
    const response = await api.get<ApiResponse>(`/solutions/featured?limit=${limit || 10}`);
    return response.data;
  },

  // Search solutions
  searchSolutions: async (params: {
    q?: string;
    category?: string;
    industry?: string;
    tags?: string[];
    minRating?: number;
    maxPrice?: number;
    pricingModel?: string;
    deploymentType?: string;
    page?: number;
    limit?: number;
    sort?: string;
  } = {}) => {
    const response = await api.get<PaginatedResponse<any>>('/solutions/search', { params });
    return response.data;
  },

  // Get recommendations
  getRecommendations: async (limit?: number) => {
    const response = await api.get<ApiResponse>(`/solutions/recommendations?limit=${limit || 10}`);
    return response.data;
  },

  // Toggle like
  toggleLike: async (id: string, action: 'like' | 'unlike') => {
    const response = await api.post<ApiResponse>(`/solutions/${id}/like`, { action });
    return response.data;
  },

  // Get solution stats
  getSolutionStats: async (id: string) => {
    const response = await api.get<ApiResponse>(`/solutions/${id}/stats`);
    return response.data;
  },
};

// Queries API functions
export const queriesApi = {
  // Get all queries
  getQueries: async (params: {
    page?: number;
    limit?: number;
    category?: string;
    industry?: string;
    status?: string;
    customerId?: string;
    isPublic?: boolean;
  } = {}) => {
    const response = await api.get<PaginatedResponse<any>>('/queries', { params });
    return response.data;
  },

  // Get single query
  getQuery: async (id: string) => {
    const response = await api.get<ApiResponse>(`/queries/${id}`);
    return response.data;
  },

  // Create new query
  createQuery: async (queryData: any) => {
    const response = await api.post<ApiResponse>('/queries', queryData);
    return response.data;
  },

  // Update query
  updateQuery: async (id: string, queryData: any) => {
    const response = await api.put<ApiResponse>(`/queries/${id}`, queryData);
    return response.data;
  },

  // Delete query
  deleteQuery: async (id: string) => {
    const response = await api.delete<ApiResponse>(`/queries/${id}`);
    return response.data;
  },

  // Get active queries
  getActiveQueries: async (params: {
    category?: string;
    industry?: string;
    limit?: number;
  } = {}) => {
    const response = await api.get<ApiResponse>('/queries/active', { params });
    return response.data;
  },

  // Mark solution as viewed
  markSolutionViewed: async (queryId: string, solutionId: string) => {
    const response = await api.post<ApiResponse>(`/queries/${queryId}/solutions/${solutionId}/view`);
    return response.data;
  },

  // Contact vendor
  contactVendor: async (queryId: string, solutionId: string, message: string) => {
    const response = await api.post<ApiResponse>(`/queries/${queryId}/solutions/${solutionId}/contact`, { message });
    return response.data;
  },

  // Resolve query
  resolveQuery: async (id: string, data: {
    selectedSolution: string;
    satisfaction?: number;
    resolutionNotes?: string;
  }) => {
    const response = await api.post<ApiResponse>(`/queries/${id}/resolve`, data);
    return response.data;
  },

  // Get query stats
  getQueryStats: async () => {
    const response = await api.get<ApiResponse>('/queries/stats');
    return response.data;
  },
};

// Utility functions
export const apiUtils = {
  // Set authentication token
  setAuthToken: (token: string) => {
    Cookies.set('auth_token', token, { expires: 7, secure: true, sameSite: 'strict' });
  },

  // Remove authentication token
  removeAuthToken: () => {
    Cookies.remove('auth_token');
  },

  // Get authentication token
  getAuthToken: () => {
    return Cookies.get('auth_token');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!Cookies.get('auth_token');
  },

  // Handle API errors
  handleError: (error: any) => {
    if (error.response) {
      return error.response.data?.message || 'An error occurred';
    }
    return error.message || 'Network error';
  },
};

export default api;
