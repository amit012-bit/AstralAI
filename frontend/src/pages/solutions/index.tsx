/**
 * Solutions Page - Database-driven AI Solutions Marketplace
 * Displays all AI solutions with filtering, search, and pagination
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  StarIcon,
  EyeIcon,
  HeartIcon,
  BookmarkIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckBadgeIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  TagIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  ArrowPathIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useSolutions, useSearchSolutions } from '@/hooks/useSolutions';
import { toast } from 'react-hot-toast';
import Layout from '@/components/Layout/Layout';

// Filter options for the solutions
const CATEGORIES = [
  'All Categories',
  'Chatbots',
  'Predictive Analytics', 
  'Computer Vision',
  'Recommendation Systems',
  'Natural Language Processing',
  'Machine Learning',
  'Deep Learning',
  'Robotic Process Automation',
  'Voice Recognition',
  'Image Recognition',
  'Sentiment Analysis'
];

const INDUSTRIES = [
  'All Industries',
  'Healthcare',
  'E-commerce',
  'Finance',
  'Technology',
  'Manufacturing',
  'Education',
  'Retail',
  'Real Estate',
  'Travel',
  'Media',
  'Automotive'
];

const PRICING_MODELS = [
  'All Pricing',
  'Free',
  'Freemium',
  'Subscription',
  'One-time',
  'Contact for Pricing'
];

const DEPLOYMENT_TYPES = [
  'All Deployment',
  'Cloud',
  'On-premise',
  'Hybrid',
  'SaaS',
  'API'
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'trending', label: 'Trending' }
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

const SolutionsPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  
  // Filter state management
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'All Categories',
    industry: 'All Industries',
    pricingModel: 'All Pricing',
    deploymentType: 'All Deployment',
    minRating: 0,
    maxPrice: 10000,
    sort: 'newest',
    page: 1,
    limit: 12,
    viewMode: 'grid'
  });

  // Fetch solutions data using React Query
  const { 
    data: solutionsData, 
    isLoading, 
    error, 
    refetch 
  } = useSolutions({
    page: filters.page,
    limit: filters.limit,
    category: filters.category !== 'All Categories' ? filters.category : undefined,
    industry: filters.industry !== 'All Industries' ? filters.industry : undefined,
    pricingModel: filters.pricingModel !== 'All Pricing' ? filters.pricingModel : undefined,
    deploymentType: filters.deploymentType !== 'All Deployment' ? filters.deploymentType : undefined,
    search: filters.search || undefined,
    sort: filters.sort,
    minRating: filters.minRating || undefined,
    maxPrice: filters.maxPrice || undefined
  });

  const solutions = solutionsData?.solutions || [];
  const totalSolutions = solutionsData?.total || 0;
  const totalPages = Math.ceil(totalSolutions / filters.limit);

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
      pricingModel: 'All Pricing',
      deploymentType: 'All Deployment',
      minRating: 0,
      maxPrice: 10000,
      sort: 'newest',
      page: 1,
      limit: 12,
      viewMode: filters.viewMode
    });
  };

  // Handle solution click
  const handleSolutionClick = (solutionId: string) => {
    router.push(`/solutions/${solutionId}`);
  };

  // Format price display
  const formatPrice = (pricing: any) => {
    if (!pricing) return 'Contact for pricing';
    
    if (pricing.model === 'free') return 'Free';
    if (pricing.model === 'contact') return 'Contact for pricing';
    
    if (pricing.price) {
      const { amount, currency, period } = pricing.price;
      return `$${amount}/${period === 'monthly' ? 'mo' : period}`;
    }
    
    return 'Contact for pricing';
  };

  // Get rating display
  const getRatingDisplay = (rating: any) => {
    if (!rating || rating.count === 0) return null;
    return (
      <div className="flex items-center space-x-1">
        <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
        <span className="text-sm font-medium text-gray-900">{rating.average.toFixed(1)}</span>
        <span className="text-sm text-gray-500">({rating.count})</span>
      </div>
    );
  };

  // Handle advanced search
  const handleAdvancedSearch = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  return (
    <Layout 
      title="Explore the Edge of Intelligence"
      searchPlaceholder="Search AI solutions..."
      searchValue={filters.search}
      onSearchChange={(value) => handleFilterChange('search', value)}
      showSearch={true}
      onAdvancedSearch={handleAdvancedSearch}
      currentFilters={filters}
      pageType="solutions"
    >
      <div className="bg-gray-800 min-h-screen">
        {/* Scrollable Content */}
        <div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Applied Filters */}
            {(() => {
              const appliedFilters = [];
              
              if (filters.category !== 'All Categories') {
                appliedFilters.push({ key: 'category', label: `Category: ${filters.category}`, value: filters.category });
              }
              if (filters.industry !== 'All Industries') {
                appliedFilters.push({ key: 'industry', label: `Industry: ${filters.industry}`, value: filters.industry });
              }
              if (filters.pricingModel && filters.pricingModel !== 'All Pricing') {
                appliedFilters.push({ key: 'pricingModel', label: `Pricing: ${filters.pricingModel}`, value: filters.pricingModel });
              }
              if (filters.deploymentType && filters.deploymentType !== 'All Deployment') {
                appliedFilters.push({ key: 'deploymentType', label: `Deployment: ${filters.deploymentType}`, value: filters.deploymentType });
              }
              if (filters.minRating && filters.minRating > 0) {
                appliedFilters.push({ key: 'minRating', label: `Min Rating: ${filters.minRating}`, value: filters.minRating });
              }
              if (filters.maxPrice && filters.maxPrice < 10000) {
                appliedFilters.push({ key: 'maxPrice', label: `Max Price: $${filters.maxPrice}`, value: filters.maxPrice });
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
                                             filter.key === 'pricingModel' ? 'All Pricing' :
                                             filter.key === 'deploymentType' ? 'All Deployment' :
                                             filter.key === 'minRating' ? 0 :
                                             filter.key === 'maxPrice' ? 10000 : '';
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
                    Showing <span className="font-medium">{solutions.length}</span> of{' '}
                    <span className="font-medium">{totalSolutions}</span> solutions
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
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <Squares2X2Icon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleFilterChange('viewMode', 'list')}
                    className={`p-2 rounded-md ${
                      filters.viewMode === 'list'
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <ListBulletIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-2">
                  <ArrowPathIcon className="h-6 w-6 animate-spin text-primary-600" />
                  <span className="text-gray-600">Loading solutions...</span>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <div className="text-red-800 font-medium mb-2">Failed to load solutions</div>
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

            {/* Solutions Grid/List */}
            {!isLoading && !error && (
              <AnimatePresence mode="wait">
                {filters.viewMode === 'grid' ? (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                  >
                    {solutions.map((solution: any, index: number) => (
                      <motion.div
                        key={solution._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        whileHover={{ y: -4, scale: 1.02 }}
                        className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-2xl border border-gray-700 overflow-hidden hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer group"
                        onClick={() => handleSolutionClick(solution._id)}
                      >
                        {/* Glowing background effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Animated background pattern */}
                        <div className="absolute inset-0 opacity-20">
                          <div className="absolute top-4 right-4 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                          <div className="absolute top-8 right-8 w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-100" />
                          <div className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse delay-200" />
                          <div className="absolute bottom-4 left-4 w-1 h-1 bg-blue-400 rounded-full animate-pulse delay-300" />
                        </div>
                        {/* Premium Badge */}
                        {solution.isPremium && (
                          <div className="absolute top-2 right-2 z-20 group/tooltip">
                            <div className="w-14 h-14 relative">
                              {/* Glowing background effect */}
                              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-orange-400/20 to-yellow-600/20 rounded-full blur-sm animate-pulse"></div>
                              {/* Sleek thin border and shadow */}
                              <div className="absolute inset-0 rounded-full border border-yellow-300 shadow-2xl bg-white/90"></div>
                              <img 
                                src="/security.png" 
                                alt="Premium Shield" 
                                className="w-full h-full object-contain relative z-10 drop-shadow-2xl filter brightness-110"
                              />
                            </div>
                            {/* Hover Tooltip */}
                            <div className="absolute right-0 top-full mt-2 opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                              <div className="bg-gray-900 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-lg border border-gray-700">
                                Trusted Solution by AstralAI
                                <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-900 rotate-45 border-l border-t border-gray-700"></div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Gradient Header */}
                        <div className="relative h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 flex items-center justify-center">
                          <div className="absolute inset-0 bg-black/20" />
                          <div className="relative z-10 text-center">
                            <div className="w-16 h-16 mx-auto mb-2 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                              <SparklesIcon className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-white px-4 line-clamp-2">
                              {solution.title}
                            </h3>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="relative p-6 bg-gradient-to-br from-gray-900 to-gray-800">
                          {/* Description */}
                          <p className="text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed">
                            {solution.shortDescription}
                          </p>

                          {/* Key Features */}
                          <div className="space-y-3 mb-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <span className="text-sm text-gray-300">{solution.category}</span>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                <svg className="w-3 h-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <span className="text-sm text-gray-300">{solution.industry}</span>
                            </div>

                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-6 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                                <svg className="w-3 h-3 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <span className="text-sm text-gray-300">{solution.deployment?.type || 'Cloud'}</span>
                            </div>
                          </div>


                          {/* Description */}
                          <div className="pt-4 border-t border-gray-700">
                            <p className="text-sm text-gray-300 leading-relaxed line-clamp-3 mb-4">
                              {/* {solution.description} */}
                            </p>
                            
                            {/* Connect Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSolutionClick(solution._id);
                              }}
                              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-2 px-4 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                              Connect with Vendor
                            </button>
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
                    {solutions.map((solution: any, index: number) => (
                      <motion.div
                        key={solution._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        whileHover={{ scale: 1.01 }}
                        className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-2xl border border-gray-700 p-6 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer group"
                        onClick={() => handleSolutionClick(solution._id)}
                      >
                        {/* Glowing background effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                        
                        {/* Animated background pattern */}
                        <div className="absolute inset-0 opacity-20 rounded-xl">
                          <div className="absolute top-4 right-4 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                          <div className="absolute top-8 right-8 w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-100" />
                          <div className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse delay-200" />
                        </div>
                        {/* Premium Badge for List View */}
                        {solution.isPremium && (
                          <div className="absolute top-2 right-2 z-20 group/tooltip">
                            <div className="w-14 h-14 relative">
                              {/* Glowing background effect */}
                              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-orange-400/20 to-yellow-600/20 rounded-full blur-sm animate-pulse"></div>
                              {/* Sleek thin border and shadow */}
                              <div className="absolute inset-0 rounded-full border border-yellow-300 shadow-2xl bg-white/90"></div>
                              <img 
                                src="/security.png" 
                                alt="Premium Shield" 
                                className="w-full h-full object-contain relative z-10 drop-shadow-2xl filter brightness-110"
                              />
                            </div>
                            {/* Hover Tooltip */}
                            <div className="absolute right-0 top-full mt-2 opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                              <div className="bg-gray-900 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-lg border border-gray-700">
                                Trusted Solution by AstralAI
                                <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-900 rotate-45 border-l border-t border-gray-700"></div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="relative flex items-start space-x-4">
                          {/* Solution Icon */}
                          <div className="flex-shrink-0">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                              <SparklesIcon className="h-8 w-8 text-white" />
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-white mb-1">
                                  {solution.title}
                                </h3>
                                <p className="text-gray-300 mb-3 line-clamp-2">
                                  {solution.description}
                                </p>
                                

                                {/* Description */}
                                <div className="mb-4">
                                  <p className="text-sm text-gray-300 leading-relaxed line-clamp-2">
                                    {solution.description}
                                  </p>
                                </div>

                                {/* Connect Button */}
                                <div className="flex justify-end">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSolutionClick(solution._id);
                                    }}
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-2 px-6 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                                  >
                                    Connect
                                  </button>
                                </div>
                              </div>

                              {/* Price and Actions */}
                              <div className="flex flex-col items-end space-y-2">
                                <div className="text-lg font-semibold text-gray-900">
                                  {formatPrice(solution.pricing)}
                                </div>
                                {solution.isFeatured && (
                                  <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                                    Featured
                                  </div>
                                )}
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
            {!isLoading && !error && solutions.length === 0 && (
              <div className="text-center py-12">
                <SparklesIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No solutions found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or search terms to find more solutions.
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
      </div>
    </Layout>
  );
};

export default SolutionsPage;