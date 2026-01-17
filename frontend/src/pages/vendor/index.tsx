/**
 * Vendor Page - My Vault
 * Two tabs: Existing Solutions and Parse New Solutions
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../components/Layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { VendorTab } from '../../components/solutions/vendor/VendorTab';
import { ExistingSolutionsTab } from '../../components/solutions/vendor/ExistingSolutionsTab';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const VendorPage: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'existing' | 'parse'>('existing');
  const [solutionsCount, setSolutionsCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Redirect if not authenticated or not a vendor
  useEffect(() => {
    if (isLoading) return;
    
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (user?.role !== 'vendor' && user?.role !== 'superadmin') {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, user, router, isLoading]);

  // Show loading while authentication is being checked
  if (isLoading) {
    return (
      <Layout title="Vendor">
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-gray-900">Loading...</div>
        </div>
      </Layout>
    );
  }

  // Don't render if not authenticated or not a vendor/superadmin
  if (!isAuthenticated || (user?.role !== 'vendor' && user?.role !== 'superadmin')) {
    return (
      <Layout title="Access Denied">
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-gray-900">Access Denied</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Vendor">
      <Head>
        <title>My Vault - AstroVault AI</title>
        <meta name="description" content="Manage your vendor profile and products." />
      </Head>
      <div className="bg-white min-h-screen">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-2">
          {/* Tab Navigation with Search */}
          <div className="border-b border-gray-200 mb-4">
            <div className="flex items-center justify-between gap-4">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('existing')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'existing'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  My Vault {solutionsCount > 0 && `(${solutionsCount})`}
                </button>
                <button
                  onClick={() => setActiveTab('parse')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'parse'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Parse New Solutions
                </button>
              </nav>
              {/* Search Bar - Only show for Existing Solutions tab */}
              {activeTab === 'existing' && (
                <div className="relative max-w-xs">
                  <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search solutions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'existing' ? (
            <ExistingSolutionsTab 
              onSolutionsCountChange={setSolutionsCount}
              searchQuery={searchQuery}
            />
          ) : (
            <VendorTab
              onComplete={() => {
                console.log('Vendor tab completed');
              }}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default VendorPage;
