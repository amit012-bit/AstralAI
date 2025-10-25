/**
 * Authentication Context
 * Provides authentication state and methods throughout the application
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { authApi, apiUtils } from '@/lib/api';
import { toast } from 'react-hot-toast';

// User type definition
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'customer' | 'vendor' | 'superadmin';
  avatar?: string;
  phone?: string;
  bio?: string;
  location?: {
    city: string;
    state: string;
    country: string;
  };
  companyId?: string;
  interests?: string[];
  industry?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Auth state interface
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth actions
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_CLEAR_ERROR' }
  | { type: 'AUTH_UPDATE_USER'; payload: Partial<User> };

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'AUTH_CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'AUTH_UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    default:
      return state;
  }
};

// Auth context interface
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: 'customer' | 'vendor';
    phone?: string;
    industry?: string;
    interests?: string[];
  }) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication status on mount
  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      const token = apiUtils.getAuthToken();
      
      if (token) {
        try {
          if (isMounted) {
            dispatch({ type: 'AUTH_START' });
          }
          
          const response = await authApi.getProfile();
          
          if (isMounted) {
            if (response.success && response.user) {
              dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
            } else {
              // Invalid token, remove it
              apiUtils.removeAuthToken();
              dispatch({ type: 'AUTH_FAILURE', payload: 'Invalid session' });
            }
          }
        } catch (error: any) {
          console.error('Auth check failed:', error);
          if (isMounted) {
            apiUtils.removeAuthToken();
            dispatch({ type: 'AUTH_FAILURE', payload: 'Authentication failed' });
          }
        }
      } else {
        if (isMounted) {
          dispatch({ type: 'AUTH_FAILURE', payload: 'No token found' });
        }
      }
    };

    checkAuth();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await authApi.login({ email, password });
      
      if (response.success && response.token && response.user) {
        // Store token in cookies
        apiUtils.setAuthToken(response.token);
        
        // Update auth state
        dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
        
        toast.success('Login successful!');
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Register function
  const register = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: 'customer' | 'vendor';
    phone?: string;
    industry?: string;
    interests?: string[];
  }) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await authApi.register(userData);
      
      if (response.success && response.token && response.user) {
        // Store token in cookies
        apiUtils.setAuthToken(response.token);
        
        // Update auth state
        dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
        
        toast.success('Registration successful!');
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout API (optional)
      await authApi.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Remove token and update state regardless of API call result
      apiUtils.removeAuthToken();
      dispatch({ type: 'AUTH_LOGOUT' });
      toast.success('Logged out successfully');
    }
  };

  // Update profile function
  const updateProfile = async (profileData: Partial<User>) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await authApi.updateProfile(profileData);
      
      if (response.success && response.user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
        toast.success('Profile updated successfully!');
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Profile update failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Change password function
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const response = await authApi.changePassword({
        currentPassword,
        newPassword,
      });
      
      if (response.success) {
        toast.success('Password changed successfully!');
      } else {
        throw new Error(response.message || 'Password change failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Password change failed';
      throw new Error(errorMessage);
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'AUTH_CLEAR_ERROR' });
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const response = await authApi.getProfile();
      
      if (response.success && response.user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  // Context value
  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Higher-order component for protecting routes
interface WithAuthProps {
  children: ReactNode;
  requiredRole?: 'customer' | 'vendor' | 'superadmin';
  fallback?: ReactNode;
}

export const WithAuth: React.FC<WithAuthProps> = ({ 
  children, 
  requiredRole, 
  fallback = null 
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Check authentication
  if (!isAuthenticated || !user) {
    return fallback as React.ReactElement;
  }

  // Check role if required
  if (requiredRole && user.role !== requiredRole && user.role !== 'superadmin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    ) as React.ReactElement;
  }

  return children as React.ReactElement;
};

export default AuthContext;
