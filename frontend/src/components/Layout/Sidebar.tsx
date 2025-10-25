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
  ChevronRightIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
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
    { 
      name: 'AI Agent', 
      href: '/chat', 
      icon: ChatBubbleLeftRightIcon,
      badge: null,
      requiresAuth: false
    },
    { 
      name: 'Queries', 
      href: '/queries', 
      icon: DocumentTextIcon,
      badge: null,
      requiresAuth: true
    },
    { 
      name: 'Categories', 
      href: '/categories', 
      icon: TagIcon,
      badge: null,
      requiresAuth: false
    },
    { 
      name: 'Blog', 
      href: '/blog', 
      icon: BookOpenIcon,
      badge: null,
      requiresAuth: false
    },
    { 
      name: 'About', 
      href: '/about', 
      icon: InformationCircleIcon,
      badge: null,
      requiresAuth: false
    },
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

  return (
    <motion.aside
      initial={false}
      animate={{
        width: isCollapsed ? 64 : 240,
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen bg-gray-900 text-white z-50 shadow-2xl border-r-2 border-gray-700 shadow-gray-900/50"
    >
      <div className="flex flex-col h-screen max-h-screen overflow-hidden">
        {/* Header Section - Classic Minimal */}
        <div className="px-4 py-5 border-b border-gray-700 h-20 flex items-center">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span 
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-lg font-semibold text-white whitespace-nowrap overflow-hidden"
                  >
                    AstralAI
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
            
            {/* Collapse/Expand Button */}
            <button
              onClick={onToggle}
              className="p-1.5 rounded-md hover:bg-gray-800 transition-colors"
            >
              {isCollapsed ? (
                <ChevronRightIcon className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDownIcon className="w-4 h-4 text-gray-400 rotate-90" />
              )}
            </button>
          </div>
        </div>


        {/* Navigation - Classic Compact */}
        <nav className="flex-1 p-3 space-y-1 overflow-hidden">
          {visibleNavigation.map((item, index) => (
            <div key={item.name}>
              <div className="relative">
                <Link href={item.href}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`group relative flex items-center justify-between px-3 py-2 rounded-md transition-all duration-200 ${
                      router.pathname === item.href
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
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

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 top-1/2 transform -translate-y-1/2">
                    {item.name}
                    {item.badge && (
                      <span className="ml-2 bg-red-500 text-xs px-1 py-0.5 rounded">
                        {item.badge}
                      </span>
                    )}
                    {/* Arrow pointing to the icon */}
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-800"></div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Add Solution Button (for vendors and superadmins) */}
          {!isLoading && isAuthenticated && (user?.role === 'vendor' || user?.role === 'superadmin') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="relative">
                <button 
                  onClick={() => router.push('/solutions/new')}
                  className={`group relative flex items-center rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all duration-200 cursor-pointer w-full ${
                    isCollapsed ? 'justify-center px-3 py-3' : 'justify-between px-4 py-3'
                  }`}>
                    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
                      <PlusIcon className="w-5 h-5 flex-shrink-0" />
                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.span 
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                            className="font-medium whitespace-nowrap overflow-hidden"
                          >
                            Add Solution
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </button>

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 top-1/2 transform -translate-y-1/2">
                    Add Solution
                    {/* Arrow pointing to the icon */}
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-800"></div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </nav>

        {/* Expand Arrow - Shows when collapsed */}
        {isCollapsed && (
          <div className="px-3 pb-3">
            <motion.button
              onClick={onToggle}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-full flex items-center justify-center p-2 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
              title="Expand sidebar"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </motion.button>
          </div>
        )}

        {/* User Section - Classic Compact Design */}
        {isAuthenticated ? (
          <div className="mt-auto border-t border-gray-700">
            {/* User Profile - Compact */}
            <div className="p-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
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
                      <p className="text-xs font-medium text-white truncate">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
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
                      className={`group relative flex items-center rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors ${
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
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 top-1/2 transform -translate-y-1/2">
                      {item.name}
                      {/* Arrow pointing to the icon */}
                      <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-800"></div>
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
                  className={`group relative flex items-center rounded-md text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-colors ${
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
                  <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 top-1/2 transform -translate-y-1/2">
                    Sign out
                    {/* Arrow pointing to the icon */}
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-800"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Sign In Section for Unauthenticated Users */
          <div className="mt-auto border-t border-gray-700">
            <div className="p-3">
              <div className="text-center">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
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
                      <p className="text-sm font-medium text-white mb-1">Welcome to AstralAI</p>
                      <p className="text-xs text-gray-400 mb-3">Sign in to access your dashboard</p>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="space-y-2">
                  <Link href="/auth/login">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-lg transition-all duration-200 hover:from-blue-600 hover:to-purple-600 ${
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
                        className="w-full bg-transparent border border-gray-600 text-gray-300 font-medium rounded-lg px-4 py-2 transition-all duration-200 hover:bg-gray-700 hover:text-white"
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
              <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 top-1/2 transform -translate-y-1/2">
                Sign In
                {/* Arrow pointing to the icon */}
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-800"></div>
              </div>
            )}
          </div>
        )}

      </div>
    </motion.aside>
  );
};

export default Sidebar;
