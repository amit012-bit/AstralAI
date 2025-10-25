/**
 * Layout Component
 * Main layout wrapper with sidebar navigation and content area
 */

import React from 'react';
import SidebarLayout from './SidebarLayout';

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

interface LayoutProps {
  children: React.ReactNode;
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
}

const Layout: React.FC<LayoutProps> = ({ 
  children,
  title,
  subtitle,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  showSearch,
  additionalContent,
  onAdvancedSearch,
  currentFilters,
  pageType
}) => {
  return (
    <SidebarLayout
      title={title}
      subtitle={subtitle}
      searchPlaceholder={searchPlaceholder}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      showSearch={showSearch}
      additionalContent={additionalContent}
      onAdvancedSearch={onAdvancedSearch}
      currentFilters={currentFilters}
      pageType={pageType}
    >
      {children}
    </SidebarLayout>
  );
};

export default Layout;
