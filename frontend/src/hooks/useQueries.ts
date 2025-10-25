/**
 * Custom hooks for Queries API data fetching
 * Provides React Query integration for customer queries and matching
 */

import { useQuery, useMutation, useQueryClient } from 'react-query';
import { queriesApi } from '@/lib/api';
import { toast } from 'react-hot-toast';

// Hook to fetch all queries
export const useQueries = (params: {
  page?: number;
  limit?: number;
  category?: string;
  industry?: string;
  status?: string;
  customerId?: string;
  isPublic?: boolean;
  search?: string;
  sort?: string;
} = {}) => {
  return useQuery(
    ['queries', params],
    () => queriesApi.getQueries(params),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      keepPreviousData: true,
      onError: (error: any) => {
        toast.error(error.message || 'Failed to fetch queries');
      }
    }
  );
};

// Hook to fetch single query
export const useSingleQuery = (id: string) => {
  return useQuery(
    ['query', id],
    () => queriesApi.getQuery(id),
    {
      enabled: !!id,
      staleTime: 2 * 60 * 1000,
      onError: (error: any) => {
        toast.error(error.message || 'Failed to fetch query');
      }
    }
  );
};

// Hook to fetch active queries
export const useActiveQueries = (params: {
  category?: string;
  industry?: string;
  limit?: number;
} = {}) => {
  return useQuery(
    ['queries', 'active', params],
    () => queriesApi.getActiveQueries(params),
    {
      staleTime: 1 * 60 * 1000, // 1 minute
      onError: (error: any) => {
        toast.error(error.message || 'Failed to fetch active queries');
      }
    }
  );
};

// Hook to create query
export const useCreateQuery = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (queryData: any) => queriesApi.createQuery(queryData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['queries']);
        toast.success('Query posted successfully!');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to create query');
      }
    }
  );
};

// Hook to update query
export const useUpdateQuery = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, data }: { id: string; data: any }) => queriesApi.updateQuery(id, data),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries(['queries']);
        queryClient.invalidateQueries(['query', id]);
        toast.success('Query updated successfully!');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to update query');
      }
    }
  );
};

// Hook to delete query
export const useDeleteQuery = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (id: string) => queriesApi.deleteQuery(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['queries']);
        toast.success('Query deleted successfully!');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to delete query');
      }
    }
  );
};

// Hook to contact vendor
export const useContactVendor = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ queryId, solutionId, message }: { 
      queryId: string; 
      solutionId: string; 
      message: string; 
    }) => queriesApi.contactVendor(queryId, solutionId, message),
    {
      onSuccess: (_, { queryId }) => {
        queryClient.invalidateQueries(['queries']);
        queryClient.invalidateQueries(['query', queryId]);
        toast.success('Vendor contacted successfully!');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to contact vendor');
      }
    }
  );
};

// Hook to resolve query
export const useResolveQuery = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, data }: { 
      id: string; 
      data: { 
        selectedSolution: string; 
        satisfaction?: number; 
        resolutionNotes?: string; 
      }; 
    }) => queriesApi.resolveQuery(id, data),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries(['queries']);
        queryClient.invalidateQueries(['query', id]);
        toast.success('Query resolved successfully!');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to resolve query');
      }
    }
  );
};

// Hook to get query statistics
export const useQueryStats = () => {
  return useQuery(
    ['queries', 'stats'],
    () => queriesApi.getQueryStats(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      onError: (error: any) => {
        toast.error(error.message || 'Failed to fetch query statistics');
      }
    }
  );
};
