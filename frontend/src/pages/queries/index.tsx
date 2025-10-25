/**
 * Queries Page - Database-driven Customer Queries
 * Displays customer queries with filtering and search functionality
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  FunnelIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckBadgeIcon,
  XMarkIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  TagIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout/Layout';
import { useQueries } from '@/hooks/useQueries';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

// Filter options for queries
const CATEGORIES = [
  'All Categories',
  'Chatbots',
  'Predictive Analytics',
  'Computer Vision',
  'Recommendation Systems',
  'Machine Learning',
  'Natural Language Processing'
];

const INDUSTRIES = [
  'All Industries',
  'Healthcare',
  'E-commerce',
  'Finance',
  'Technology',
  'Manufacturing',
  'Education',
  'Retail'
];

const STATUS_OPTIONS = [
  'All Status',
  'active',
  'matched',
  'closed',
  'cancelled'
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'urgent', label: 'Most Urgent' }
];

interface FilterState {
  search: string;
  category: string;
  industry: string;
  pricingModel?: string;
  deploymentType?: string;
  status?: string;
  minRating?: number;
  maxPrice?: number;
  sort: string;
  page: number;
  limit: number;
  viewMode: 'grid' | 'list';
}

const QueriesPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  
  // Filter state management
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'All Categories',
    industry: 'All Industries',
    status: 'All Status',
    sort: 'newest',
    page: 1,
    limit: 12,
    viewMode: 'grid'
  });

  // Fetch queries data using React Query
  const { 
    data: queriesData, 
    isLoading, 
    error, 
    refetch 
  } = useQueries({
    page: filters.page,
    limit: filters.limit,
    category: filters.category !== 'All Categories' ? filters.category : undefined,
    industry: filters.industry !== 'All Industries' ? filters.industry : undefined,
    status: filters.status !== 'All Status' ? filters.status : undefined,
    search: filters.search || undefined,
    sort: filters.sort
  });

  const queries = queriesData?.queries || [];
  const totalQueries = queriesData?.total || 0;
  const totalPages = Math.ceil(totalQueries / filters.limit);

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (filters.search !== '') {
        refetch();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters.search, refetch]);

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      category: 'All Categories',
      industry: 'All Industries',
      status: 'All Status',
      sort: 'newest',
      page: 1,
      limit: 12,
      viewMode: filters.viewMode
    });
  };

  // Handle query click
  const handleQueryClick = (queryId: string) => {
    router.push(`/queries/${queryId}`);
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'matched':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format budget display
  const formatBudget = (requirements: any) => {
    if (!requirements?.budget) return 'Budget not specified';
    
    const { min, max, currency } = requirements.budget;
    if (min === max) {
      return `$${min} ${currency}`;
    }
    return `$${min} - $${max} ${currency}`;
  };

  // Format timeline
  const formatTimeline = (requirements: any) => {
    if (!requirements?.timeline) return 'Timeline not specified';
    return requirements.timeline.replace('-', ' ');
  };

  // Handle advanced search
  const handleAdvancedSearch = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  return (
    <Layout 
      title="AI Queries"
      searchPlaceholder="Search queries..."
      searchValue={filters.search}
      onSearchChange={(value) => handleFilterChange('search', value)}
      showSearch={true}
      onAdvancedSearch={handleAdvancedSearch}
      currentFilters={filters}
      pageType="queries"
    >
      <div className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Query Button for customers */}
        {user?.role === 'customer' && (
          <div className="mb-6 flex justify-end">
            <Link href="/queries/new">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Post New Query</span>
              </motion.button>
            </Link>
          </div>
        )}
        
        {/* Applied Filters */}
        {(() => {
          const appliedFilters = [];
          
          if (filters.category !== 'All Categories') {
            appliedFilters.push({ key: 'category', label: `Category: ${filters.category}`, value: filters.category });
          }
          if (filters.industry !== 'All Industries') {
            appliedFilters.push({ key: 'industry', label: `Industry: ${filters.industry}`, value: filters.industry });
          }
          if (filters.status && filters.status !== 'All Status') {
            appliedFilters.push({ key: 'status', label: `Status: ${filters.status}`, value: filters.status });
          }
          
          return appliedFilters.length > 0 ? (
            <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-300">Applied Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {appliedFilters.map((filter) => (
                  <div
                    key={filter.key}
                    className="inline-flex items-center space-x-2 bg-blue-500/20 border border-blue-500/30 rounded-lg px-3 py-1.5"
                  >
                    <span className="text-sm text-blue-300">{filter.label}</span>
                    <button
                      onClick={() => {
                        const resetValue = filter.key === 'category' ? 'All Categories' :
                                         filter.key === 'industry' ? 'All Industries' :
                                         filter.key === 'status' ? 'All Status' : '';
                        handleFilterChange(filter.key as keyof FilterState, resetValue);
                      }}
                      className="text-blue-300 hover:text-white transition-colors"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null;
        })()}

        {/* Toolbar */}
        <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700 p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                {/* Results Count and Sort */}
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-300">
                    Showing <span className="font-medium">{queries.length}</span> of{' '}
                    <span className="font-medium">{totalQueries}</span> queries
                  </div>
                  <select
                    value={filters.sort}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                    className="border border-gray-600 rounded-md px-3 py-1 text-sm bg-gray-800 text-white focus:ring-blue-500 focus:border-blue-500"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleFilterChange('viewMode', 'grid')}
                    className={`p-2 rounded-md ${
                      filters.viewMode === 'grid'
                        ? 'bg-primary-100 text-primary-600'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <FunnelIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleFilterChange('viewMode', 'list')}
                    className={`p-2 rounded-md ${
                      filters.viewMode === 'list'
                        ? 'bg-primary-100 text-primary-600'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <DocumentTextIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  <span className="text-gray-600">Loading queries...</span>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <div className="text-red-800 font-medium mb-2">Failed to load queries</div>
                <div className="text-red-600 text-sm mb-4">
                  {error.message || 'Something went wrong. Please try again.'}
                </div>
                <button
                  onClick={() => refetch()}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Queries Grid/List */}
            {!isLoading && !error && (
              <AnimatePresence mode="wait">
                {filters.viewMode === 'grid' ? (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    {queries.map((query: any) => (
                      <motion.div
                        key={query._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        whileHover={{ y: -4 }}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleQueryClick(query._id)}
                      >
                        <div className="p-6">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {query.title}
                              </h3>
                              <p className="text-sm text-gray-600 line-clamp-3">
                                {query.description}
                              </p>
                            </div>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(query.status)}`}>
                              {query.status}
                            </span>
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                              {query.category}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {query.industry}
                            </span>
                            {query.tags && query.tags.slice(0, 2).map((tag: string) => (
                              <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {tag}
                              </span>
                            ))}
                          </div>

                          {/* Requirements */}
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center text-sm text-gray-600">
                              <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                              <span>{formatBudget(query.requirements)}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <CalendarIcon className="h-4 w-4 mr-2" />
                              <span>{formatTimeline(query.requirements)}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                              <span>{query.requirements?.companySize || 'Company size not specified'}</span>
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <UserIcon className="h-4 w-4" />
                              <span>{query.customerName || 'Anonymous'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <ClockIcon className="h-4 w-4" />
                              <span>{new Date(query.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {queries.map((query: any) => (
                      <motion.div
                        key={query._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleQueryClick(query._id)}
                      >
                        <div className="flex items-start space-x-4">
                          {/* Query Icon */}
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
                              <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                  {query.title}
                                </h3>
                                <p className="text-gray-600 mb-3 line-clamp-2">
                                  {query.description}
                                </p>
                                
                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                                    {query.category}
                                  </span>
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    {query.industry}
                                  </span>
                                  {query.tags && query.tags.slice(0, 3).map((tag: string) => (
                                    <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      {tag}
                                    </span>
                                  ))}
                                </div>

                                {/* Requirements */}
                                <div className="flex items-center space-x-6 text-sm text-gray-500">
                                  <div className="flex items-center space-x-1">
                                    <CurrencyDollarIcon className="h-4 w-4" />
                                    <span>{formatBudget(query.requirements)}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <CalendarIcon className="h-4 w-4" />
                                    <span>{formatTimeline(query.requirements)}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <BuildingOfficeIcon className="h-4 w-4" />
                                    <span>{query.requirements?.companySize || 'Any size'}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Status and Actions */}
                              <div className="flex flex-col items-end space-y-2">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(query.status)}`}>
                                  {query.status}
                                </span>
                                <div className="flex items-center space-x-1 text-sm text-gray-500">
                                  <ClockIcon className="h-4 w-4" />
                                  <span>{new Date(query.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* Empty State */}
            {!isLoading && !error && queries.length === 0 && (
              <div className="text-center py-12">
                <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No queries found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or search terms to find more queries.
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {!isLoading && !error && totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                    disabled={filters.page === 1}
                    className="px-3 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handleFilterChange('page', pageNum)}
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                          filters.page === pageNum
                            ? 'bg-primary-600 text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handleFilterChange('page', Math.min(totalPages, filters.page + 1))}
                    disabled={filters.page === totalPages}
                    className="px-3 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
        </div>
      </div>
    </Layout>
  );
};

export default QueriesPage;
