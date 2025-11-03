/**
 * PageHeader Component - Consistent header across all pages
 * Provides dynamic content based on the current page while maintaining consistent styling
 */

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import AdvancedSearchModal from '../AdvancedSearchModal';

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

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  showSearch?: boolean;
  additionalContent?: React.ReactNode;
  onAdvancedSearch?: (filters: FilterState) => void;
  currentFilters?: FilterState;
  pageType?: 'solutions' | 'queries' | 'blog';
  leftOffset?: number; // pixels to offset for collapsed/expanded sidebar
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  searchPlaceholder,
  searchValue = '',
  onSearchChange,
  showSearch = true,
  additionalContent,
  onAdvancedSearch,
  currentFilters,
  pageType,
  leftOffset = 240
}) => {
  const router = useRouter();
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);

  // Default content based on current page
  const getDefaultContent = () => {
    switch (router.pathname) {
      case '/solutions':
        return {
          title: 'Explore the Edge of Intelligence',
          // subtitle: 'Leading and Bleeding Edge AI Solutions',
          searchPlaceholder: 'Search AI solutions...'
        };
      case '/chat':
        return {
          title: 'AI Assistant',
          // subtitle: 'intelligent chat support',
          searchPlaceholder: 'Search AI solutions...'
        };
      case '/categories':
        return {
          title: 'AI Categories',
          // subtitle: 'Organized by Industry and Use Case',
          searchPlaceholder: 'Search categories...'
        };
      case '/blog':
        return {
          title: 'AI Insights',
          // subtitle: 'Latest Trends and Best Practices',
          searchPlaceholder: 'Search blog posts...'
        };
      case '/about':
        return {
          title: 'About Us',
          // subtitle: 'Connecting Businesses with AI Solutions',
          searchPlaceholder: 'Search AI solutions...'
        };
      case '/vendors':
        return {
          title: '🏢 AI Vendors',
          subtitle: 'Verified Solution Providers',
          searchPlaceholder: 'Search AI solutions...'
        };
      case '/queries':
        return {
          title: 'AI Queries',
            // subtitle: 'Get Personalized Recommendations',
          searchPlaceholder: 'Search queries...'
        };
      case '/dashboard':
        return {
          title: 'Dashboard',
          // subtitle: 'your AI solutions overview',
          searchPlaceholder: 'Search AI solutions...'
        };
      default:
        return {
          title: 'AstralAI',
          subtitle: '(Astral AI - Starry, Visionary AI Hub)',
          searchPlaceholder: 'Search AI solutions...'
        };
    }
  };

  const defaultContent = getDefaultContent();
  const finalTitle = title || defaultContent.title;
  const finalSubtitle = subtitle || defaultContent.subtitle;
  const finalSearchPlaceholder = searchPlaceholder || defaultContent.searchPlaceholder;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-700 shadow-sm h-20 flex items-center" style={{ marginLeft: `${leftOffset}px`, width: `calc(100% - ${leftOffset}px)` }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between">
          {/* Left Side - Page Title */}
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-white">
              {finalTitle}
            </h1>
            <span className="text-sm text-blue-400 font-medium">
              {finalSubtitle}
            </span>
            {additionalContent}
          </div>
          
          {/* Right Side - Search Bar */}
          {showSearch && (
            <div className="flex items-center space-x-3">
              <div className="relative w-full max-w-md">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  placeholder={finalSearchPlaceholder}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Advanced Search Button */}
              {onAdvancedSearch && currentFilters && pageType && (
                <button
                  onClick={() => setIsAdvancedSearchOpen(true)}
                  className="relative p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 hover:border-gray-600 transition-all duration-200"
                  title="Advanced Search"
                >
                  <AdjustmentsHorizontalIcon className="h-5 w-5" />
                  {/* Filter indicator badge */}
                  {(() => {
                    const hasActiveFilters = 
                      currentFilters.category !== 'All Categories' ||
                      currentFilters.industry !== 'All Industries' ||
                      (currentFilters.pricingModel && currentFilters.pricingModel !== 'All Pricing') ||
                      (currentFilters.deploymentType && currentFilters.deploymentType !== 'All Deployment') ||
                      (currentFilters.status && currentFilters.status !== 'All Status') ||
                      (currentFilters.minRating && currentFilters.minRating > 0) ||
                      (currentFilters.maxPrice && currentFilters.maxPrice < 10000);
                    
                    return hasActiveFilters ? (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-gray-800" />
                    ) : null;
                  })()}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Advanced Search Modal */}
      {onAdvancedSearch && currentFilters && pageType && (
        <AdvancedSearchModal
          isOpen={isAdvancedSearchOpen}
          onClose={() => setIsAdvancedSearchOpen(false)}
          onApplyFilters={onAdvancedSearch}
          currentFilters={currentFilters}
          pageType={pageType}
        />
      )}
    </div>
  );
};

export default PageHeader;
