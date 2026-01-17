/**
 * Sidebar Layout Component
 * Main layout wrapper with sidebar navigation and content area
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bars3Icon, SparklesIcon } from '@heroicons/react/24/outline';
import Sidebar from './Sidebar';
import PageHeader from './PageHeader';
// import FloatingChatButton from '../Chat/FloatingChatButton'; // Hidden for now

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

interface SidebarLayoutProps {
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

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ 
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const EXPANDED_SIDEBAR_WIDTH = 208; // Slightly slimmer desktop width for expanded state
  const COLLAPSED_SIDEBAR_WIDTH = 64; // Compact width for collapsed state that keeps icons readable
  const sidebarWidth = isMobile ? 0 : (isCollapsed ? COLLAPSED_SIDEBAR_WIDTH : EXPANDED_SIDEBAR_WIDTH); // Centralized width value for consistent layout math

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsCollapsed(true);
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.dataset.sidebarCollapsed = isCollapsed ? 'true' : 'false';
    }

    return () => {
      if (typeof document !== 'undefined') {
        delete document.body.dataset.sidebarCollapsed;
      }
    };
  }, [isCollapsed]);

  return (
    <div className="min-h-screen bg-white">
      <Sidebar 
        isCollapsed={isCollapsed} 
        onToggle={toggleSidebar}
        expandedWidth={EXPANDED_SIDEBAR_WIDTH}
        collapsedWidth={COLLAPSED_SIDEBAR_WIDTH}
      />
      
      {/* Mobile Overlay */}
      {isMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeSidebar}
        />
      )}
      
      {/* Main Content Area */}
      <div 
        className="transition-all duration-300 min-h-screen relative z-10"
        style={{
          // Keep content aligned with sidebar width for both expanded and collapsed states
          marginLeft: `${sidebarWidth}px`
        }}
      >
        {/* Mobile Header */}
        {isMobile && (
          <div className="md:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AstroVault AI
              </span>
            </Link>
            <div className="w-10"></div> {/* Spacer */}
          </div>
        )}

        {/* Desktop Page Header */}
        {!isMobile && (
          <PageHeader
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
            sidebarWidth={sidebarWidth}
            isSidebarCollapsed={isCollapsed}
          />
        )}
        
        {/* Content */}
        <main className={`min-h-screen overflow-y-auto bg-white ${!isMobile ? 'pt-14' : ''}`}>
          {children}
        </main>
      </div>
      
      {/* Floating AI Agent Button - Hidden for now */}
      {/* <FloatingChatButton /> */}
    </div>
  );
};

export default SidebarLayout;
