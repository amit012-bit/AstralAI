/**
 * Add Solution Page - Complete Rewrite
 * Tabbed interface with Vendor tab containing 3 sections:
 * 1. Parse Website (extracts vendor info + products)
 * 2. Vendor Details (editable form)
 * 3. Products List (all products, editable, save as solutions)
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import Layout from '../../components/Layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { VendorTab } from '../../components/solutions/vendor/VendorTab';

const NewSolutionPage: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'vendor'>('vendor');

  // Redirect if not authenticated or not a vendor
  useEffect(() => {
    if (isLoading) return; // Wait for auth check to complete
    
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to login');
      router.push('/auth/login');
      return;
    }
    if (user?.role !== 'vendor' && user?.role !== 'superadmin') {
      console.log('User role is not vendor/superadmin, redirecting to dashboard. Role:', user?.role);
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, user, router, isLoading]);

  // Show loading while authentication is being checked
  if (isLoading) {
    return (
      <Layout title="Add Solution">
        <div className="min-h-screen bg-gray-800 flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      </Layout>
    );
  }

  // Don't render if not authenticated or not a vendor/superadmin
  if (!isAuthenticated || (user?.role !== 'vendor' && user?.role !== 'superadmin')) {
    return (
      <Layout title="Access Denied">
        <div className="min-h-screen bg-gray-800 flex items-center justify-center">
          <div className="text-white">Access Denied</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Add Solutions">
      <Head>
        <title>Add Solutions - AstroVault AI</title>
        <meta name="description" content="Add new AI solutions to the AstroVault AI marketplace." />
      </Head>
      <div className="bg-gray-800 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gray-900 rounded-xl shadow-lg border border-gray-700 p-8"
          >
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Add Solutions</h1>
              <p className="text-gray-400">
                Parse your website to automatically extract vendor information and all your products/solutions
              </p>
              </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-700 mb-6">
              <nav className="flex space-x-8" aria-label="Tabs">
                    <button
                  onClick={() => setActiveTab('vendor')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'vendor'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  Vendor
                    </button>
                {/* Future tabs can be added here */}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
              {activeTab === 'vendor' && (
                <VendorTab
                  onComplete={() => {
                    // Optional: Handle completion callback
                    console.log('Vendor tab completed');
                  }}
                />
              )}
                </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default NewSolutionPage;
