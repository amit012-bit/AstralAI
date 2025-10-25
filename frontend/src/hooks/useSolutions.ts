/**
 * Custom hooks for Solutions API data fetching
 * Provides React Query integration for solutions data
 */

import { useQuery, useMutation, useQueryClient } from 'react-query';
import { solutionsApi } from '@/lib/api';
import { toast } from 'react-hot-toast';

// Hook to fetch all solutions with filtering
export const useSolutions = (params: {
  page?: number;
  limit?: number;
  category?: string;
  industry?: string;
  search?: string;
  sort?: string;
  minRating?: number;
  maxPrice?: number;
  pricingModel?: string;
  deploymentType?: string;
} = {}) => {
  return useQuery(
    ['solutions', params],
    () => solutionsApi.getSolutions(params),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      keepPreviousData: true,
      onError: (error: any) => {
        toast.error(error.message || 'Failed to fetch solutions');
      }
    }
  );
};

// Hook to fetch single solution
export const useSolution = (id: string) => {
  return useQuery(
    ['solution', id],
    () => solutionsApi.getSolution(id),
    {
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      onError: (error: any) => {
        toast.error(error.message || 'Failed to fetch solution');
      }
    }
  );
};

// Hook to fetch featured solutions
export const useFeaturedSolutions = (limit?: number) => {
  return useQuery(
    ['solutions', 'featured', limit],
    () => solutionsApi.getFeaturedSolutions(limit),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
      onError: (error: any) => {
        toast.error(error.message || 'Failed to fetch featured solutions');
      }
    }
  );
};

// Hook to search solutions
export const useSearchSolutions = (params: {
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
  return useQuery(
    ['solutions', 'search', params],
    () => solutionsApi.searchSolutions(params),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      keepPreviousData: true,
      onError: (error: any) => {
        toast.error(error.message || 'Search failed');
      }
    }
  );
};

// Hook to fetch recommendations
export const useRecommendations = (limit?: number) => {
  return useQuery(
    ['solutions', 'recommendations', limit],
    () => solutionsApi.getRecommendations(limit),
    {
      staleTime: 15 * 60 * 1000, // 15 minutes
      onError: (error: any) => {
        toast.error(error.message || 'Failed to fetch recommendations');
      }
    }
  );
};

// Hook to create solution
export const useCreateSolution = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (solutionData: any) => solutionsApi.createSolution(solutionData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['solutions']);
        toast.success('Solution created successfully!');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to create solution');
      }
    }
  );
};

// Hook to update solution
export const useUpdateSolution = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, data }: { id: string; data: any }) => solutionsApi.updateSolution(id, data),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries(['solutions']);
        queryClient.invalidateQueries(['solution', id]);
        toast.success('Solution updated successfully!');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to update solution');
      }
    }
  );
};

// Hook to delete solution
export const useDeleteSolution = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (id: string) => solutionsApi.deleteSolution(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['solutions']);
        toast.success('Solution deleted successfully!');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to delete solution');
      }
    }
  );
};

// Hook to toggle like
export const useToggleLike = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, action }: { id: string; action: 'like' | 'unlike' }) => 
      solutionsApi.toggleLike(id, action),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries(['solutions']);
        queryClient.invalidateQueries(['solution', id]);
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to update like');
      }
    }
  );
};
