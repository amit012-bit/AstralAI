/**
 * Sidebar Component - Modern Dark Theme Navigation
 * Inspired by Thor app design with collapsible functionality
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Bars3Icon, 
  XMarkIcon, 
  UserIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  PlusIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  HomeIcon,
  DocumentTextIcon,
  TagIcon,
  BookOpenIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  BuildingStorefrontIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  expandedWidth?: number;
  collapsedWidth?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isCollapsed, 
  onToggle,
  expandedWidth = 240,
  collapsedWidth = 64,
}) => {
  const router = useRouter();
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Navigation items with icons
  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: HomeIcon,
      badge: null,
      requiresAuth: true
    },
    { 
      name: 'Solutions', 
      href: '/solutions', 
      icon: SparklesIcon,
      badge: null,
      requiresAuth: false
    },
    // AI Agent - Hidden for now, can be enabled later
    // { 
    //   name: 'AI Agent', 
    //   href: '/chat', 
    //   icon: ChatBubbleLeftRightIcon,
    //   badge: null,
    //   requiresAuth: false
    // },
    { 
      name: 'Queries', 
      href: '/queries', 
      icon: DocumentTextIcon,
      badge: null,
      requiresAuth: true
    },
    { 
      name: 'My Vault', 
      href: '/vendor', 
      icon: BuildingStorefrontIcon,
      badge: null,
      requiresAuth: true,
      roles: ['vendor', 'superadmin']
    },
    { 
      name: 'Proposals', 
      href: '/proposals', 
      icon: ClipboardDocumentCheckIcon,
      badge: null,
      requiresAuth: true
    },
    // Categories - Hidden for now
    // { 
    //   name: 'Categories', 
    //   href: '/categories', 
    //   icon: TagIcon,
    //   badge: null,
    //   requiresAuth: false
    // },
    // Blog and About pages hidden for now
    // { 
    //   name: 'Blog', 
    //   href: '/blog', 
    //   icon: BookOpenIcon,
    //   badge: null,
    //   requiresAuth: false
    // },
    // { 
    //   name: 'About', 
    //   href: '/about', 
    //   icon: InformationCircleIcon,
    //   badge: null,
    //   requiresAuth: false
    // },
  ];

  // Admin navigation items (only for superadmins) - Removed separate admin section

  // User menu items
  const userMenuItems = [
    {
      name: 'Profile',
      href: '/dashboard/profile',
      icon: UserIcon,
      requiresAuth: true
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: CogIcon,
      requiresAuth: true
    },
  ];


  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleDropdown = (itemName: string) => {
    setActiveDropdown(activeDropdown === itemName ? null : itemName);
  };

  // Filter navigation items based on auth status
  const visibleNavigation = navigation.filter(item => 
    !item.requiresAuth || isAuthenticated
  );

  // When collapsed, remove the dashboard/home entry and inject an expand arrow that sits in the same slot
  const navigationItems = isCollapsed 
    ? [
        {
          name: 'Expand sidebar',
          icon: ChevronRightIcon,
          onClick: onToggle,
          href: null,
          badge: null,
          requiresAuth: false
        },
        ...visibleNavigation.filter(item => item.href !== '/dashboard'),
      ]
    : visibleNavigation;

  return (
    <motion.aside
      initial={false}
      animate={{
        // Dynamically animate between collapsed and expanded widths to keep layout responsive
        width: isCollapsed ? collapsedWidth : expandedWidth,
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen bg-white text-gray-900 z-50 shadow-2xl border-r-2 border-gray-200 shadow-gray-200/50"
    >
      <div className="flex flex-col h-screen max-h-screen overflow-hidden">
        {/* Header Section - Classic Minimal */}
        <div className="px-4 py-3 border-b border-gray-200 h-14 flex items-center">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span 
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-lg font-semibold text-gray-900 whitespace-nowrap overflow-hidden"
                  >
                    AstroVault AI
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
            
            {/* Collapse/Expand Button */}
            <button
              onClick={onToggle}
              className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            >
              {isCollapsed ? (
                <ChevronRightIcon className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDownIcon className="w-4 h-4 text-gray-500 rotate-90" />
              )}
            </button>
          </div>
        </div>


        {/* Navigation - Classic Compact */}
        <nav className="flex-1 p-3 space-y-1 overflow-hidden">
          {navigationItems.map((item, index) => (
            <div key={item.name}>
              <div className="relative">
                {item.href ? (
                  <Link href={item.href}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`group relative flex items-center justify-between px-3 py-2 rounded-md transition-all duration-200 ${
                        router.pathname === item.href
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center space-x-2">
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        <AnimatePresence>
                          {!isCollapsed && (
                            <motion.span 
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: "auto" }}
                              exit={{ opacity: 0, width: 0 }}
                              transition={{ duration: 0.2 }}
                              className="text-sm font-medium whitespace-nowrap overflow-hidden"
                            >
                              {item.name}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      {/* Badge */}
                      {item.badge && !isCollapsed && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </motion.div>
                  </Link>
                ) : (
                  <motion.button
                    type="button"
                    onClick={'onClick' in item ? item.onClick : undefined}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group w-full relative flex items-center justify-center px-3 py-2 rounded-md transition-all duration-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.span 
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className="ml-2 text-sm font-medium whitespace-nowrap overflow-hidden"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                )}

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-white text-gray-900 text-sm rounded-lg shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 top-1/2 transform -translate-y-1/2">
                    {item.name}
                    {item.badge && (
                      <span className="ml-2 bg-red-500 text-white text-xs px-1 py-0.5 rounded">
                        {item.badge}
                      </span>
                    )}
                    {/* Arrow pointing to the icon */}
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-white"></div>
                    </div>
                )}
              </div>
            </div>
          ))}
        </nav>

        {/* User Section - Classic Compact Design */}
        {isAuthenticated ? (
          <div className="mt-auto border-t border-gray-200">
            {/* User Profile - Compact */}
            <div className="p-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-medium text-xs">
                    {user?.firstName?.charAt(0) || 'U'}
                  </span>
                </div>
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div 
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-1 min-w-0"
                    >
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* User Actions - Vertical Layout */}
            <div className="px-3 pb-3 space-y-1">
              {userMenuItems.map((item) => (
                <div key={item.name} className="relative">
                  <Link href={item.href}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`group relative flex items-center rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors ${
                        isCollapsed ? 'justify-center p-1' : 'px-2 py-1.5 space-x-2'
                      }`}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="text-xs font-medium">{item.name}</span>
                      )}
                    </motion.div>
                  </Link>
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-white text-gray-900 text-sm rounded-lg shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 top-1/2 transform -translate-y-1/2">
                      {item.name}
                      {/* Arrow pointing to the icon */}
                      <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-white"></div>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Logout Button */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className={`group relative flex items-center rounded-md text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors ${
                    isCollapsed ? 'justify-center p-1' : 'px-2 py-1.5 space-x-2'
                  }`}
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="text-xs font-medium">Sign out</span>
                  )}
                </motion.button>
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-white text-gray-900 text-sm rounded-lg shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 top-1/2 transform -translate-y-1/2">
                    Sign out
                    {/* Arrow pointing to the icon */}
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-white"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Sign In Section for Unauthenticated Users */
          <div className="mt-auto border-t border-gray-200">
            <div className="p-3">
              <div className="text-center">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="text-sm font-medium text-gray-900 mb-1">Welcome to AstroVault AI</p>
                      <p className="text-xs text-gray-500 mb-3">Sign in to access your dashboard</p>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="space-y-2">
                  <Link href="/auth/login">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg transition-all duration-200 hover:from-purple-700 hover:to-blue-700 ${
                        isCollapsed ? 'px-3 py-2' : 'px-4 py-2'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <UserIcon className="w-4 h-4" />
                        {!isCollapsed && <span className="text-sm">Sign In</span>}
                      </div>
                    </motion.button>
                  </Link>
                  
                  {!isCollapsed && (
                    <Link href="/auth/register">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-transparent border border-gray-300 text-gray-700 font-medium rounded-lg px-4 py-2 transition-all duration-200 hover:bg-gray-50 hover:text-gray-900"
                      >
                        <span className="text-sm">Create Account</span>
                      </motion.button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
            
            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-3 py-2 bg-white text-gray-900 text-sm rounded-lg shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 top-1/2 transform -translate-y-1/2">
                Sign In
                {/* Arrow pointing to the icon */}
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-white"></div>
              </div>
            )}
          </div>
        )}

      </div>
    </motion.aside>
  );
};

export default Sidebar;
