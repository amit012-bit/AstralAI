/**
 * User Context
 * Provides user data with profile flags (adapted from solutions-hub-main)
 * Works with backend auth instead of Clerk
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { userApi } from '@/lib/api';

interface UserData {
  role: "buyer" | "seller" | null;
  hasInstitutionProfile: boolean;
  hasVendorProfile: boolean;
  profileCompletedAt?: Date;
  lastLoginAt?: Date;
  _id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

interface UserContextType {
  userData: UserData | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
  updateRole: (role: "buyer" | "seller" | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const CACHE_KEY = "user_data_cache";
const CACHE_TIMESTAMP_KEY = "user_data_cache_timestamp";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function UserProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from cache on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const cached = localStorage.getItem(CACHE_KEY);
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    
    if (cached && timestamp) {
      const age = Date.now() - parseInt(timestamp, 10);
      if (age < CACHE_DURATION) {
        try {
          const parsed = JSON.parse(cached);
          setUserData(parsed);
          setIsLoading(false);
          // Continue to fetch in background to refresh cache
        } catch (e) {
          // Invalid cache, clear it
          localStorage.removeItem(CACHE_KEY);
          localStorage.removeItem(CACHE_TIMESTAMP_KEY);
        }
      } else {
        // Cache expired, clear it
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem(CACHE_TIMESTAMP_KEY);
      }
    }
  }, []);

  const fetchUserData = async (skipLoadingState = false) => {
    if (!isAuthenticated || !user?._id) {
      if (!skipLoadingState) setIsLoading(false);
      return;
    }

    if (!skipLoadingState) setIsLoading(true);

    try {
      const response = await userApi.getUserData();

      if (response.success && response.data) {
        const userData: UserData = {
          role: response.data.role || null,
          hasInstitutionProfile: response.data.hasInstitutionProfile || false,
          hasVendorProfile: response.data.hasVendorProfile || false,
          profileCompletedAt: response.data.profileCompletedAt ? new Date(response.data.profileCompletedAt) : undefined,
          lastLoginAt: response.data.lastLogin ? new Date(response.data.lastLogin) : undefined,
          _id: response.data._id,
          email: response.data.email,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
        };

        setUserData(userData);

        // Cache the data
        if (typeof window !== "undefined") {
          localStorage.setItem(CACHE_KEY, JSON.stringify(userData));
          localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
        }
      } else {
        setUserData(null);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserData(null);
    } finally {
      if (!skipLoadingState) setIsLoading(false);
    }
  };

  // Fetch user data when auth user is loaded
  useEffect(() => {
    if (isAuthLoading) {
      setIsLoading(true);
      return;
    }

    if (!isAuthenticated || !user?._id) {
      setIsLoading(false);
      setUserData(null);
      return;
    }

    // Check if we have valid cache
    let hasValidCache = false;
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem(CACHE_KEY);
      const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
      
      if (cached && timestamp) {
        const age = Date.now() - parseInt(timestamp, 10);
        if (age < CACHE_DURATION) {
          hasValidCache = true;
        }
      }
    }

    // If no valid cache, fetch now with loading state
    // If we have cache, fetch in background without loading state
    fetchUserData(hasValidCache);
  }, [user?._id, isAuthenticated, isAuthLoading]);

  const refetch = async () => {
    setIsLoading(true);
    await fetchUserData();
  };

  const updateRole = (role: "buyer" | "seller" | null) => {
    if (userData) {
      const updated = { ...userData, role };
      setUserData(updated);
      
      // Update cache
      if (typeof window !== "undefined") {
        localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
      }
    }
  };

  return (
    <UserContext.Provider value={{ userData, isLoading, refetch, updateRole }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserData must be used within a UserProvider");
  }
  return context;
}
