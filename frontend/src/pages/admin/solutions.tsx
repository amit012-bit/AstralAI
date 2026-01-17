/**
 * Admin Solutions Management Page
 * Superadmin dashboard for managing draft solutions and approvals
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout/Layout';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import {
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import api from '@/lib/api';

interface Solution {
  _id: string;
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  subcategory: string;
  industry: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  createdAt: string;
  vendorId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  companyId: {
    _id: string;
    name: string;
    logo: string;
    isVerified: boolean;
  };
}

interface AdminStats {
  solutions: {
    total: number;
    approved: number;
    draft: number;
    pending: number;
    rejected: number;
  };
  companies: number;
  vendors: number;
}

const AdminSolutionsPage: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('draft');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');

  // Check authentication and role
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
        return;
      }
      if (user?.role !== 'superadmin') {
        router.push('/dashboard');
        return;
      }
    }
  }, [isAuthenticated, user, authLoading, router]);

  // Fetch solutions and stats
  useEffect(() => {
    if (isAuthenticated && user?.role === 'superadmin') {
      fetchSolutions();
      fetchStats();
    }
  }, [currentPage, statusFilter, searchTerm, isAuthenticated, user]);

  const fetchSolutions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/solutions/admin/drafts', {
        params: {
          page: currentPage,
          limit: 10,
          status: statusFilter,
          search: searchTerm
        }
      });

      setSolutions(response.data.solutions);
      setTotalPages(response.data.totalPages);
    } catch (err: any) {
      console.error('Error fetching solutions:', err);
      setError(err.response?.data?.error || 'Failed to fetch solutions');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/solutions/admin/stats');
      setStats(response.data.stats);
    } catch (err: any) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleApprove = async (solutionId: string, status: 'approved' | 'rejected') => {
    try {
      await api.put(`/solutions/${solutionId}/approve`, {
        status,
        notes: approvalNotes
      });

      // Refresh solutions list
      await fetchSolutions();
      await fetchStats();
      
      setShowApprovalModal(false);
      setSelectedSolution(null);
      setApprovalNotes('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update solution status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckIcon className="w-4 h-4" />;
      case 'rejected':
        return <XMarkIcon className="w-4 h-4" />;
      case 'pending':
        return <ClockIcon className="w-4 h-4" />;
      default:
        return <PencilIcon className="w-4 h-4" />;
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-800 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  // Show loading while fetching data
  if (loading && solutions.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-800 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Pending Solutions - AstroVault AI</title>
        <meta name="description" content="Review and approve pending AI solutions" />
      </Head>

      <Layout>
        <div className="min-h-screen bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Pending Solutions</h1>
              <p className="text-gray-300">Review and approve solutions submitted by vendors</p>
              {error && (
                <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-300">{error}</p>
                </div>
              )}
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <FunnelIcon className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-400">Total Solutions</p>
                      <p className="text-2xl font-bold text-white">{stats.solutions.total}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <CheckIcon className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-400">Approved</p>
                      <p className="text-2xl font-bold text-white">{stats.solutions.approved}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                      <PencilIcon className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-400">Draft</p>
                      <p className="text-2xl font-bold text-white">{stats.solutions.draft}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <EyeIcon className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-400">Companies</p>
                      <p className="text-2xl font-bold text-white">{stats.companies}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search solutions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Solutions List */}
            <div className="bg-gray-900 rounded-lg border border-gray-700">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-400 mt-2">Loading solutions...</p>
                </div>
              ) : solutions.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-400">No solutions found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {solutions.map((solution) => (
                    <motion.div
                      key={solution._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">{solution.title}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(solution.status)}`}>
                              {solution.status}
                            </span>
                          </div>
                          
                          <p className="text-gray-300 text-sm mb-2">{solution.shortDescription}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>Category: {solution.category}</span>
                            <span>Industry: {solution.industry}</span>
                            <span>Vendor: {solution.vendorId.firstName} {solution.vendorId.lastName}</span>
                            <span>Company: {solution.companyId?.name || 'No company assigned'}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedSolution(solution);
                              setShowApprovalModal(true);
                            }}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                            title="Review solution"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          
                          {solution.status === 'draft' && (
                            <>
                              <button
                                onClick={() => handleApprove(solution._id, 'approved')}
                                className="p-2 text-green-400 hover:text-green-300 transition-colors"
                                title="Approve solution"
                              >
                                <CheckIcon className="w-5 h-5" />
                              </button>
                              
                              <button
                                onClick={() => handleApprove(solution._id, 'rejected')}
                                className="p-2 text-red-400 hover:text-red-300 transition-colors"
                                title="Reject solution"
                              >
                                <XMarkIcon className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default AdminSolutionsPage;
