/**
 * Admin Users Page - Manage all registered users
 * Displays user statistics and detailed user management interface
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout/Layout';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon,
  SparklesIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'superadmin' | 'vendor' | 'customer';
  phone?: string;
  industry?: string;
  isEmailVerified: boolean;
  createdAt: string;
  companyId?: {
    _id: string;
    name: string;
    logo: string;
    isVerified: boolean;
  };
}

interface UserStats {
  total: number;
  roles: {
    superadmin?: number;
    vendor?: number;
    customer?: number;
  };
}

const AdminUsersPage: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

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

  // Fetch users
  useEffect(() => {
    if (isAuthenticated && user?.role === 'superadmin') {
      fetchUsers();
    } else if (!authLoading && (!isAuthenticated || user?.role !== 'superadmin')) {
      console.log('User not authenticated or not superadmin:', { isAuthenticated, role: user?.role });
    }
  }, [currentPage, searchTerm, roleFilter, isAuthenticated, user, authLoading, retryCount]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      
      console.log('Fetching users with params:', {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        role: roleFilter === 'all' ? undefined : roleFilter
      });
      
      console.log('User authentication status:', { isAuthenticated, user: user?.role });
      
      // Check if we have a token
      const token = document.cookie.split(';').find(c => c.trim().startsWith('auth_token='));
      console.log('Auth token present:', !!token);
      
      const response = await api.get('/auth/users', {
        params: {
          page: currentPage,
          limit: 10,
          search: searchTerm,
          role: roleFilter === 'all' ? undefined : roleFilter
        }
      });

      console.log('Users API Response:', response.data);
      setUsers(response.data.users || []);
      setTotalPages(response.data.totalPages || 1);
      setStats(response.data.stats || null);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      console.error('Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      });
      
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to fetch users';
      setError(typeof errorMessage === 'string' ? errorMessage : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'vendor':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'customer':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <SparklesIcon className="w-4 h-4" />;
      case 'vendor':
        return <UserGroupIcon className="w-4 h-4" />;
      case 'customer':
        return <UserIcon className="w-4 h-4" />;
      default:
        return <UserIcon className="w-4 h-4" />;
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
  if (loading && users.length === 0 && !error) {
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
        <title>Manage Users - AstroVault AI</title>
        <meta name="description" content="Manage all registered users" />
      </Head>

      <Layout>
        <div className="min-h-screen bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Manage Users</h1>
              <p className="text-gray-300">View and manage all registered users on the platform</p>
              
              {/* Debug info */}
              <div className="mt-4 p-3 bg-gray-800 rounded text-xs text-gray-300">
                Debug: Auth Status - Authenticated: {isAuthenticated ? 'Yes' : 'No'}, 
                Role: {user?.role || 'None'}, 
                Loading: {loading ? 'Yes' : 'No'}, 
                Users Count: {users.length}
              </div>
              
              {error && (
                <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-300">{error}</p>
                  <button
                    onClick={() => {
                      setRetryCount(prev => prev + 1);
                      fetchUsers();
                    }}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Retry ({retryCount})
                  </button>
                </div>
              )}
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                      <UserGroupIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-white">{stats.total}</p>
                      <p className="text-gray-400">Total Users</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                      <UserGroupIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-blue-400">{stats.roles.vendor || 0}</p>
                      <p className="text-gray-400">Vendors</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-green-400">{stats.roles.customer || 0}</p>
                      <p className="text-gray-400">Customers</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                      <SparklesIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-purple-400">{stats.roles.superadmin || 0}</p>
                      <p className="text-gray-400">Admins</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="superadmin">Superadmin</option>
                <option value="vendor">Vendor</option>
                <option value="customer">Customer</option>
              </select>
            </div>

            {/* Users Table */}
            {users.length > 0 ? (
              <div className="bg-gray-900 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-700">
                      {users.map((user) => (
                        <motion.tr
                          key={user._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="hover:bg-gray-800 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDetails(true);
                          }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                                {getRoleIcon(user.role)}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-white">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-sm text-gray-400">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRoleColor(user.role)}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {user.companyId ? user.companyId.name : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              {user.isEmailVerified ? (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200">
                                  Verified
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                                  Unverified
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedUser(user);
                                  setShowDetails(true);
                                }}
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                title="View Details"
                              >
                                <EyeIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // TODO: Implement edit user
                                  console.log('Edit user:', user.email);
                                }}
                                className="text-yellow-400 hover:text-yellow-300 transition-colors"
                                title="Edit User"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // TODO: Implement delete user
                                  console.log('Delete user:', user.email);
                                }}
                                className="text-red-400 hover:text-red-300 transition-colors"
                                title="Delete User"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-300">No users found</h3>
                <p className="mt-1 text-sm text-gray-400">
                  {searchTerm || roleFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'No users have been registered yet.'
                  }
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-900 text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-900 text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </Layout>

      {/* User Details Modal */}
      {showDetails && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {selectedUser.firstName} {selectedUser.lastName}
                </h2>
                <button
                  onClick={() => {
                    setShowDetails(false);
                    setSelectedUser(null);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Personal Information</h3>
                    <div className="bg-gray-800 rounded-lg p-4 space-y-2">
                      <p className="text-gray-300"><span className="font-medium">Email:</span> {selectedUser.email}</p>
                      <p className="text-gray-300"><span className="font-medium">Phone:</span> {selectedUser.phone || 'Not provided'}</p>
                      <p className="text-gray-300"><span className="font-medium">Industry:</span> {selectedUser.industry || 'Not specified'}</p>
                      <p className="text-gray-300"><span className="font-medium">Email Verified:</span> {selectedUser.isEmailVerified ? 'Yes' : 'No'}</p>
                      <p className="text-gray-300"><span className="font-medium">Joined:</span> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Role & Permissions</h3>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {getRoleIcon(selectedUser.role)}
                        <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getRoleColor(selectedUser.role)}`}>
                          {selectedUser.role}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">
                        {selectedUser.role === 'superadmin' && 'Full platform access and administration rights'}
                        {selectedUser.role === 'vendor' && 'Can create and manage solutions, view analytics'}
                        {selectedUser.role === 'customer' && 'Can browse solutions, submit queries, view recommendations'}
                      </p>
                    </div>
                  </div>
                  
                  {selectedUser.companyId && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Company Information</h3>
                      <div className="bg-gray-800 rounded-lg p-4">
                        <p className="text-gray-300">Company: {selectedUser.companyId.name}</p>
                        <p className="text-gray-300">Verified: {selectedUser.companyId.isVerified ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-700">
                <button
                  onClick={() => {
                    setShowDetails(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement user management actions
                    console.log('Manage user:', selectedUser.email);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Manage User
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default AdminUsersPage;
