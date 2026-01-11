/**
 * Vendor Page - White Background Classic Design
 * Contains 3 sections: Parse Website, Vendor Details, Products List
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../components/Layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { VendorTab } from '../../components/solutions/vendor/VendorTab';

const VendorPage: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

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
        <title>Vendor - AstralAI</title>
        <meta name="description" content="Manage your vendor profile and products." />
      </Head>
      <div className="bg-white min-h-screen">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">My Vault</h1>
            <p className="text-sm text-gray-600">
              Parse your website to automatically extract vendor information and all your products/solutions
            </p>
          </div>

          <VendorTab
            onComplete={() => {
              console.log('Vendor tab completed');
            }}
          />
        </div>
      </div>
    </Layout>
  );
};

export default VendorPage;
