/**
 * Sidebar Layout Component
 * Main layout wrapper with sidebar navigation and content area
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bars3Icon, SparklesIcon } from '@heroicons/react/24/outline';
import Sidebar from './Sidebar';
import PageHeader from './PageHeader';
import FloatingChatButton from '../Chat/FloatingChatButton';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900">
      <Sidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />
      
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
          marginLeft: isMobile ? '0' : isCollapsed ? '64px' : '240px'
        }}
      >
        {/* Mobile Header */}
        {isMobile && (
          <div className="md:hidden bg-gray-900 shadow-sm border-b border-gray-700 px-4 py-3 flex items-center justify-between">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                AstralAI
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
          />
        )}
        
        {/* Content */}
        <main className={`min-h-screen overflow-y-auto bg-gradient-to-br from-gray-800 to-gray-900 ${!isMobile ? 'pt-20' : ''}`}>
          {children}
        </main>
      </div>
      
      {/* Floating AI Agent Button */}
      <FloatingChatButton />
    </div>
  );
};

export default SidebarLayout;
