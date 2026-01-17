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
    const errorMessageLower = (errorMessage as string).toLowerCase();

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
      case 400:
        // For 400 errors, check if it's a vendor profile error - let components handle it
        // Otherwise show generic error
        if (errorMessageLower.includes('vendor profile not found') || 
            errorMessageLower.includes('create a vendor profile')) {
          // Don't show toast here - let the component handle it with custom UI
          break;
        }
        toast.error(errorMessage);
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
        // Don't show toast for every 429 error to avoid spam
        // Only show if it's a user-initiated action (login, etc.)
        const isUserAction = error.config?.method === 'post' && 
          (error.config?.url?.includes('/auth/login') || 
           error.config?.url?.includes('/auth/register'));
        if (isUserAction) {
          toast.error('Too many requests. Please try again later.');
        }
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

// Companies API functions
export const companiesApi = {
  // Get all companies (for superadmin)
  getCompanies: async () => {
    const response = await api.get<ApiResponse>('/companies');
    return response.data;
  },

  // Get company by ID
  getCompany: async (id: string) => {
    const response = await api.get<ApiResponse>(`/companies/${id}`);
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

// Institution API functions (for solutions-hub-main compatibility)
export const institutionApi = {
  // Get institution profile
  getInstitution: async () => {
    const response = await api.get<ApiResponse>('/institution');
    return response.data;
  },

  // Get institution by user ID
  getInstitutionByUserId: async (userId: string) => {
    const response = await api.get<ApiResponse>(`/institution/${userId}`);
    return response.data;
  },

  // Create or update institution profile
  createOrUpdateInstitution: async (data: any) => {
    const response = await api.post<ApiResponse>('/institution', data);
    return response.data;
  },
};

// Vendor API functions (for solutions-hub-main compatibility)
export const vendorApi = {
  // Get vendor profile
  getVendor: async () => {
    const response = await api.get<ApiResponse>('/vendor');
    return response.data;
  },

  // Get vendor by user ID
  getVendorByUserId: async (userId: string) => {
    const response = await api.get<ApiResponse>(`/vendor/${userId}`);
    return response.data;
  },

  // Create or update vendor profile
  createOrUpdateVendor: async (data: any) => {
    const response = await api.post<ApiResponse>('/vendor', data);
    return response.data;
  },
};

// User API functions (for solutions-hub-main compatibility)
export const userApi = {
  // Get user data with profile flags
  getUserData: async () => {
    const response = await api.get<ApiResponse>('/user');
    return response.data;
  },

  // Update user role
  updateUserRole: async (role: 'buyer' | 'seller') => {
    const response = await api.post<ApiResponse>('/user', { role });
    return response.data;
  },
};

// Automation API functions
export const automationApi = {
  // Parse vendor website (extracts vendor info + multiple products)
  parseVendorWebsite: async (url: string) => {
    const response = await api.post<ApiResponse>('/automation/vendor/parse-website', { url }, {
      timeout: 120000, // 2 minutes - scraping + 5 AI extractions can take time
    });
    return response.data;
  },

  // Parse solution website (legacy - for single solution parsing)
  parseSolutionWebsite: async (url: string) => {
    const response = await api.post<ApiResponse>('/automation/solutions/parse-website', { url }, {
      timeout: 60000, // 1 minute - scraping + AI extraction
    });
    return response.data;
  },
};

// Proposals API functions
export const proposalsApi = {
  // Get all proposals with filtering
  getProposals: async (params: {
    page?: number;
    limit?: number;
    category?: string;
    industry?: string;
    status?: string;
    creatorType?: string;
    createdBy?: string;
  } = {}) => {
    const response = await api.get<PaginatedResponse<any>>('/proposals', { params });
    return response.data;
  },

  // Get single proposal
  getProposal: async (id: string) => {
    const response = await api.get<ApiResponse>(`/proposals/${id}`);
    return response.data;
  },

  // Create new proposal
  createProposal: async (proposalData: any) => {
    const response = await api.post<ApiResponse>('/proposals', proposalData);
    return response.data;
  },

  // Update proposal
  updateProposal: async (id: string, proposalData: any) => {
    const response = await api.put<ApiResponse>(`/proposals/${id}`, proposalData);
    return response.data;
  },

  // Delete proposal
  deleteProposal: async (id: string) => {
    const response = await api.delete<ApiResponse>(`/proposals/${id}`);
    return response.data;
  },

  // Add vendor response to proposal
  addResponse: async (proposalId: string, responseData: {
    solutionId?: string;
    proposalText: string;
    proposedPrice?: string;
    proposedTimeline?: string;
  }) => {
    const response = await api.post<ApiResponse>(`/proposals/${proposalId}/responses`, responseData);
    return response.data;
  },

  // Update response status (accept/reject)
  updateResponseStatus: async (proposalId: string, responseId: string, status: 'accepted' | 'rejected' | 'pending') => {
    const response = await api.put<ApiResponse>(`/proposals/${proposalId}/responses/${responseId}`, { status });
    return response.data;
  },

  // Update response content
  updateResponse: async (proposalId: string, responseId: string, responseData: {
    solutionId?: string;
    proposalText: string;
    proposedPrice?: string;
    proposedTimeline?: string;
    caseStudyLink?: string;
    attachments?: Array<{
      name: string;
      type: string;
      url?: string;
    }>;
  }) => {
    const response = await api.put<ApiResponse>(`/proposals/${proposalId}/responses/${responseId}/update`, responseData);
    return response.data;
  },
};

// Data Fields API functions
export const dataFieldsApi = {
  // Get all available data fields
  getAllFields: async (params?: { category?: string; section?: string; isActive?: boolean }) => {
    const response = await api.get<ApiResponse>('/data-fields', { params });
    return response.data;
  },

  // Get fields mapped to a vendor
  getVendorFields: async (vendorId: string) => {
    const response = await api.get<ApiResponse>(`/data-fields/vendor/${vendorId}`);
    return response.data;
  },

  // Update vendor field mappings
  updateVendorMappings: async (vendorId: string, fieldIds: string[]) => {
    const response = await api.post<ApiResponse>(`/data-fields/vendor/${vendorId}/mappings`, { fieldIds });
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
