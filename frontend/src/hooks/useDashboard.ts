/**
 * Custom hooks for Dashboard API data fetching
 * Provides React Query integration for dashboard statistics and data
 */

import { useQuery } from 'react-query';
import { queriesApi, solutionsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

// Hook to fetch dashboard statistics based on user role
export const useDashboardStats = () => {
  const { user } = useAuth();
  
  return useQuery(
    ['dashboard', 'stats', user?.role],
    async () => {
      try {
        const [queryStats, featuredSolutions, activeQueries] = await Promise.all([
          queriesApi.getQueryStats(),
          solutionsApi.getFeaturedSolutions(4),
          queriesApi.getActiveQueries({ limit: 5 })
        ]);

        // Calculate role-specific stats
      let stats = {
        totalQueries: 0,
        activeQueries: 0,
        resolvedQueries: 0,
        totalSolutions: 0,
        totalViews: 0,
        totalInquiries: 0,
        averageRating: 0
      };

      if (user?.role === 'superadmin') {
        // Get all solutions for admin stats
        const allSolutions = await solutionsApi.getSolutions({ limit: 100 });
        const solutions = allSolutions.solutions || [];
        
        stats = {
          totalQueries: queryStats.stats?.totalQueries || 0,
          activeQueries: queryStats.stats?.activeQueries || 0,
          resolvedQueries: queryStats.stats?.resolvedQueries || 0,
          totalSolutions: solutions.length,
          totalViews: solutions.reduce((sum: number, sol: any) => sum + (sol.views || 0), 0),
          totalInquiries: solutions.reduce((sum: number, sol: any) => sum + (sol.inquiries || 0), 0),
          averageRating: solutions.length > 0 
            ? solutions.reduce((sum: number, sol: any) => sum + (sol.rating?.average || 0), 0) / solutions.length 
            : 0
        };
      } else if (user?.role === 'vendor') {
        // Get vendor's solutions
        const vendorSolutions = await solutionsApi.getSolutions({ 
          limit: 100,
          // Note: This would need vendorId filter in the API
        });
        const solutions = vendorSolutions.solutions || [];
        
        stats = {
          totalQueries: 0,
          activeQueries: 0,
          resolvedQueries: 0,
          totalSolutions: solutions.length,
          totalViews: solutions.reduce((sum: number, sol: any) => sum + (sol.views || 0), 0),
          totalInquiries: solutions.reduce((sum: number, sol: any) => sum + (sol.inquiries || 0), 0),
          averageRating: solutions.length > 0 
            ? solutions.reduce((sum: number, sol: any) => sum + (sol.rating?.average || 0), 0) / solutions.length 
            : 0
        };
      } else if (user?.role === 'customer') {
        // Get customer's queries and interactions
        const customerQueries = await queriesApi.getQueries({ 
          customerId: user._id,
          limit: 100 
        });
        const queries = customerQueries.queries || [];
        
        stats = {
          totalQueries: queries.length,
          activeQueries: queries.filter((q: any) => q.status === 'active').length,
          resolvedQueries: queries.filter((q: any) => q.status === 'closed').length,
          totalSolutions: 0,
          totalViews: 0,
          totalInquiries: queries.reduce((sum: number, q: any) => sum + (q.customerInquiries || 0), 0),
          averageRating: 0
        };
      }

        return {
          stats,
          featuredSolutions: featuredSolutions.solutions || [],
          activeQueries: activeQueries.queries || [],
          recentActivity: await generateRecentActivity(user?.role || 'customer', featuredSolutions, activeQueries, user)
        };
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        throw error;
      }
    },
    {
      enabled: !!user,
      staleTime: 2 * 60 * 1000, // 2 minutes
      onError: (error: any) => {
        toast.error(error.message || 'Failed to fetch dashboard data');
      }
    }
  );
};

// Helper function to generate recent activity based on user role
const generateRecentActivity = async (role: string, featuredSolutions: any, activeQueries: any, user: any) => {
  const activities = [];
  
  try {
    if (role === 'superadmin') {
      // Superadmin sees all global activity
      const [recentSolutions, recentQueries] = await Promise.all([
        solutionsApi.getSolutions({ limit: 5, sort: 'newest' }),
        queriesApi.getQueries({ limit: 5 })
      ]);

      // Add recent solutions (global)
      if (recentSolutions.solutions?.length > 0) {
        recentSolutions.solutions.slice(0, 2).forEach((solution: any) => {
          const timeAgo = getTimeAgo(solution.createdAt);
          activities.push({
            type: 'solution_added',
            message: 'New solution added',
            details: solution.title,
            time: timeAgo,
            icon: 'DocumentTextIcon'
          });
        });
      }

      // Add recent queries (global)
      if (recentQueries.queries?.length > 0) {
        recentQueries.queries.slice(0, 1).forEach((query: any) => {
          const timeAgo = getTimeAgo(query.postedAt);
          activities.push({
            type: 'new_query',
            message: 'New customer query posted',
            details: query.title,
            time: timeAgo,
            icon: 'MagnifyingGlassIcon'
          });
        });
      }
    } else if (role === 'vendor') {
      // Vendor sees only their own solutions
      const vendorSolutions = await solutionsApi.getSolutions({ 
        limit: 5, 
        sort: 'newest',
        vendorId: user?._id // Filter by vendor ID
      });

      if (vendorSolutions.solutions?.length > 0) {
        vendorSolutions.solutions.slice(0, 3).forEach((solution: any) => {
          const timeAgo = getTimeAgo(solution.createdAt);
          activities.push({
            type: 'solution_added',
            message: 'Your solution was added',
            details: solution.title,
            time: timeAgo,
            icon: 'DocumentTextIcon'
          });
        });
      }
    } else if (role === 'customer') {
      // Customer sees only their own queries
      const customerQueries = await queriesApi.getQueries({ 
        limit: 5,
        customerId: user?._id // Filter by customer ID
      });

      if (customerQueries.queries?.length > 0) {
        customerQueries.queries.slice(0, 3).forEach((query: any) => {
          const timeAgo = getTimeAgo(query.postedAt);
          activities.push({
            type: 'query_posted',
            message: 'You posted a query',
            details: query.title,
            time: timeAgo,
            icon: 'MagnifyingGlassIcon'
          });
        });
      }
    }
  } catch (error) {
    console.error('Error generating recent activity:', error);
    // Fallback to basic activities if API calls fail
    activities.push({
      type: 'system',
      message: 'Welcome to your dashboard',
      details: 'Start exploring solutions and queries',
      time: 'Just now',
      icon: 'SparklesIcon'
    });
  }
  
  // Return only top 3 activities
  return activities.slice(0, 3);
};

// Helper function to calculate time ago
const getTimeAgo = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
};

// Hook to fetch user-specific recommendations
export const useUserRecommendations = () => {
  const { user } = useAuth();
  
  return useQuery(
    ['dashboard', 'recommendations', user?._id],
    () => solutionsApi.getRecommendations(6),
    {
      enabled: !!user,
      staleTime: 15 * 60 * 1000, // 15 minutes
      onError: (error: any) => {
        toast.error(error.message || 'Failed to fetch recommendations');
      }
    }
  );
};
