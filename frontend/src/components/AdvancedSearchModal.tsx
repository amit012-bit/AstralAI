import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

// Filter options for solutions
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

// Filter options for blog posts
const BLOG_CATEGORIES = [
  'All Categories',
  'Healthcare AI',
  'Business AI',
  'Technical AI',
  'AI Trends',
  'Industry Insights',
  'Case Studies',
  'Best Practices',
  'AI Ethics',
  'Future of AI'
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

// Filter options for queries
const QUERY_CATEGORIES = [
  'All Categories',
  'Chatbots',
  'Predictive Analytics',
  'Computer Vision',
  'Recommendation Systems',
  'Machine Learning',
  'Natural Language Processing'
];

const QUERY_INDUSTRIES = [
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
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'trending', label: 'Trending' }
];

const QUERY_SORT_OPTIONS = [
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

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterState) => void;
  currentFilters: FilterState;
  pageType: 'solutions' | 'queries' | 'blog';
}

const AdvancedSearchModal: React.FC<AdvancedSearchModalProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters,
  pageType
}) => {
  const [filters, setFilters] = useState<FilterState>(currentFilters);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterState = {
      search: filters.search,
      category: 'All Categories',
      industry: 'All Industries',
      pricingModel: 'All Pricing',
      deploymentType: 'All Deployment',
      status: 'All Status',
      minRating: 0,
      maxPrice: 10000,
      sort: 'newest'
    };
    setFilters(clearedFilters);
  };

  const isSolutionsPage = pageType === 'solutions';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <AdjustmentsHorizontalIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Advanced Search</h2>
                      <p className="text-sm text-gray-400">
                        Refine your search with detailed filters
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Category Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Category
                      </label>
                      <select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="w-full border border-gray-600 rounded-lg px-4 py-3 bg-gray-800 text-white focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        {(pageType === 'solutions' ? CATEGORIES : pageType === 'blog' ? BLOG_CATEGORIES : QUERY_CATEGORIES).map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Industry Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Industry
                      </label>
                      <select
                        value={filters.industry}
                        onChange={(e) => handleFilterChange('industry', e.target.value)}
                        className="w-full border border-gray-600 rounded-lg px-4 py-3 bg-gray-800 text-white focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        {(isSolutionsPage ? INDUSTRIES : QUERY_INDUSTRIES).map((industry) => (
                          <option key={industry} value={industry}>
                            {industry}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Solutions-specific filters */}
                    {isSolutionsPage && (
                      <>
                        {/* Pricing Model Filter */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-3">
                            Pricing Model
                          </label>
                          <select
                            value={filters.pricingModel || 'All Pricing'}
                            onChange={(e) => handleFilterChange('pricingModel', e.target.value)}
                            className="w-full border border-gray-600 rounded-lg px-4 py-3 bg-gray-800 text-white focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          >
                            {PRICING_MODELS.map((model) => (
                              <option key={model} value={model}>
                                {model}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Deployment Type Filter */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-3">
                            Deployment Type
                          </label>
                          <select
                            value={filters.deploymentType || 'All Deployment'}
                            onChange={(e) => handleFilterChange('deploymentType', e.target.value)}
                            className="w-full border border-gray-600 rounded-lg px-4 py-3 bg-gray-800 text-white focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          >
                            {DEPLOYMENT_TYPES.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    {/* Queries-specific filters */}
                    {!isSolutionsPage && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          Status
                        </label>
                        <select
                          value={filters.status || 'All Status'}
                          onChange={(e) => handleFilterChange('status', e.target.value)}
                          className="w-full border border-gray-600 rounded-lg px-4 py-3 bg-gray-800 text-white focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Solutions-specific filters */}
                    {isSolutionsPage && (
                      <>
                        {/* Rating Filter */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-3">
                            Minimum Rating: {filters.minRating || 0}
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="5"
                            step="0.5"
                            value={filters.minRating || 0}
                            onChange={(e) => handleFilterChange('minRating', parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>0</span>
                            <span>5</span>
                          </div>
                        </div>

                        {/* Price Range Filter */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-3">
                            Max Price: ${filters.maxPrice || 10000}
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="10000"
                            step="100"
                            value={filters.maxPrice || 10000}
                            onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>$0</span>
                            <span>$10k+</span>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Sort Options */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Sort By
                      </label>
                      <select
                        value={filters.sort}
                        onChange={(e) => handleFilterChange('sort', e.target.value)}
                        className="w-full border border-gray-600 rounded-lg px-4 py-3 bg-gray-800 text-white focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        {(isSolutionsPage ? SORT_OPTIONS : QUERY_SORT_OPTIONS).map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-8 border-t border-gray-700 mt-8">
                  <button
                    onClick={handleClearFilters}
                    className="px-6 py-3 text-gray-400 hover:text-white font-medium transition-colors"
                  >
                    Clear All Filters
                  </button>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={onClose}
                      className="px-6 py-3 border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleApplyFilters}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AdvancedSearchModal;
