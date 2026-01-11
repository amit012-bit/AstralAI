/**
 * Dashboard Page - Database-driven Dashboard with Real Statistics
 * Displays role-specific dashboard with real data from the database
 */

import { useState, useEffect } from 'react';
import { 
  ChartBarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  ClockIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  BellIcon,
  UserIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardStats, useUserRecommendations } from '@/hooks/useDashboard';
import { toast } from 'react-hot-toast';

// Icon mapping for activity types
const getActivityIcon = (iconName: string) => {
  const iconMap: { [key: string]: any } = {
    'DocumentTextIcon': DocumentTextIcon,
    'MagnifyingGlassIcon': MagnifyingGlassIcon,
    'SparklesIcon': SparklesIcon,
    'ChatBubbleLeftRightIcon': ChatBubbleLeftRightIcon,
    'BellIcon': BellIcon,
    'UserIcon': UserIcon
  };
  return iconMap[iconName] || DocumentTextIcon;
};
import Layout from '@/components/Layout/Layout';
import api from '@/lib/api';
import { useRouter } from 'next/router';

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

const PendingSolutionsSection: React.FC = () => {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchPendingSolutions();
  }, []);

  const fetchPendingSolutions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/solutions/admin/drafts', {
        params: {
          page: 1,
          limit: 5,
          status: 'draft'
        }
      });
      setSolutions(response.data.solutions);
    } catch (error) {
      console.error('Failed to fetch pending solutions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (solutionId: string, status: 'approved' | 'rejected') => {
    try {
      await api.put(`/solutions/${solutionId}/approve`, {
        status
      });
      toast.success(`Solution ${status} successfully`);
      fetchPendingSolutions();
      setShowDetails(false);
      setSelectedSolution(null);
    } catch (error) {
      toast.error('Failed to update solution status');
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

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Pending Solutions</h2>
          <ClockIcon className="h-5 w-5 text-yellow-500" />
        </div>
        
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading pending solutions...</p>
          </div>
        ) : solutions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No pending solutions</p>
          </div>
        ) : (
          <div className="space-y-2">
            {solutions.map((solution) => (
              <motion.div
                key={solution._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedSolution(solution);
                  setShowDetails(true);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-gray-900 text-sm">{solution.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(solution.status)}`}>
                        {solution.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApprove(solution._id, 'approved');
                      }}
                      className="p-1.5 text-green-600 hover:text-green-700 transition-colors"
                      title="Approve solution"
                    >
                      <CheckBadgeIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApprove(solution._id, 'rejected');
                      }}
                      className="p-1.5 text-red-600 hover:text-red-700 transition-colors"
                      title="Reject solution"
                    >
                      <ExclamationTriangleIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Solution Details Modal */}
      {showDetails && selectedSolution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedSolution.title}</h2>
                <button
                  onClick={() => {
                    setShowDetails(false);
                    setSelectedSolution(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600">{selectedSolution.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Category</h3>
                    <p className="text-gray-600">{selectedSolution.category} - {selectedSolution.subcategory}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Industry</h3>
                    <p className="text-gray-600">{selectedSolution.industry}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Vendor Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-gray-600">Name: {selectedSolution.vendorId.firstName} {selectedSolution.vendorId.lastName}</p>
                      <p className="text-gray-600">Email: {selectedSolution.vendorId.email}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Company Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-gray-600">Company: {selectedSolution.companyId.name}</p>
                      <p className="text-gray-600">Verified: {selectedSolution.companyId.isVerified ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => handleApprove(selectedSolution._id, 'rejected')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(selectedSolution._id, 'approved')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Approve
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

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

const ManageUsersSection: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/users', {
        params: {
          page: currentPage,
          limit: 10,
          search: searchTerm,
          role: roleFilter === 'all' ? undefined : roleFilter
        }
      });
      setUsers(response.data.users);
      setTotalPages(response.data.totalPages);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch users:', error);
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

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Manage Users</h2>
          <UserGroupIcon className="h-5 w-5 text-blue-500" />
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-500">Total Users</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-blue-500">{stats.roles.vendor || 0}</div>
              <div className="text-sm text-gray-500">Vendors</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-green-500">{stats.roles.customer || 0}</div>
              <div className="text-sm text-gray-500">Customers</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-purple-500">{stats.roles.superadmin || 0}</div>
              <div className="text-sm text-gray-500">Admins</div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Roles</option>
            <option value="superadmin">Superadmin</option>
            <option value="vendor">Vendor</option>
            <option value="customer">Customer</option>
          </select>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedUser(user);
                  setShowDetails(true);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      {getRoleIcon(user.role)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-medium text-gray-900 text-sm">
                          {user.firstName} {user.lastName}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                        {user.isEmailVerified && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200">
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{user.email}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {user.phone && <span>Phone: {user.phone}</span>}
                        {user.industry && <span>Industry: {user.industry}</span>}
                        {user.companyId && <span>Company: {user.companyId.name}</span>}
                        <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Implement user actions
                        console.log('User actions for:', user.email);
                      }}
                      className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                      title="User actions"
                    >
                      <ExclamationTriangleIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showDetails && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedUser.firstName} {selectedUser.lastName}
                </h2>
                <button
                  onClick={() => {
                    setShowDetails(false);
                    setSelectedUser(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Personal Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-2">
                      <p className="text-gray-600"><span className="font-medium">Email:</span> {selectedUser.email}</p>
                      <p className="text-gray-600"><span className="font-medium">Phone:</span> {selectedUser.phone || 'Not provided'}</p>
                      <p className="text-gray-600"><span className="font-medium">Industry:</span> {selectedUser.industry || 'Not specified'}</p>
                      <p className="text-gray-600"><span className="font-medium">Email Verified:</span> {selectedUser.isEmailVerified ? 'Yes' : 'No'}</p>
                      <p className="text-gray-600"><span className="font-medium">Joined:</span> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Role & Permissions</h3>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        {getRoleIcon(selectedUser.role)}
                        <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getRoleColor(selectedUser.role)}`}>
                          {selectedUser.role}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        {selectedUser.role === 'superadmin' && 'Full platform access and administration rights'}
                        {selectedUser.role === 'vendor' && 'Can create and manage solutions, view analytics'}
                        {selectedUser.role === 'customer' && 'Can browse solutions, submit queries, view recommendations'}
                      </p>
                    </div>
                  </div>
                  
                  {selectedUser.companyId && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Company Information</h3>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-gray-600">Company: {selectedUser.companyId.name}</p>
                        <p className="text-gray-600">Verified: {selectedUser.companyId.isVerified ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
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

interface UserStats {
  total: number;
  roles: {
    superadmin?: number;
    vendor?: number;
    customer?: number;
  };
}

const UserStatsSection: React.FC = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/users', {
        params: {
          page: 1,
          limit: 1 // We only need stats, not actual users
        }
      });
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">User Statistics</h2>
        <UserGroupIcon className="h-5 w-5 text-blue-500" />
      </div>
      
      {stats && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-900 font-medium">Total:</span>
            <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-blue-500 font-medium">Vendors:</span>
            <span className="text-2xl font-bold text-blue-500">{stats.roles.vendor || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-green-500 font-medium">Customers:</span>
            <span className="text-2xl font-bold text-green-500">{stats.roles.customer || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-purple-500 font-medium">Admins:</span>
            <span className="text-2xl font-bold text-purple-500">{stats.roles.superadmin || 0}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const DashboardPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  
  // Search state
  const [searchValue, setSearchValue] = useState('');
  
  // Advanced search state
  const [currentFilters, setCurrentFilters] = useState({
    search: '',
    category: 'All Categories',
    industry: 'All Industries',
    sort: 'newest',
    page: 1,
    limit: 12,
    viewMode: 'grid' as 'grid' | 'list'
  });
  
  // Search handler
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    // Redirect to solutions page with search query
    if (value.trim()) {
      router.push(`/solutions?search=${encodeURIComponent(value.trim())}`);
    }
  };
  
  // Advanced search handler
  const handleAdvancedSearch = (filters: any) => {
    setCurrentFilters(filters);
    // Redirect to solutions page with applied filters
    const queryParams = new URLSearchParams();
    if (filters.search) queryParams.set('search', filters.search);
    if (filters.category && filters.category !== 'All Categories') queryParams.set('category', filters.category);
    if (filters.industry && filters.industry !== 'All Industries') queryParams.set('industry', filters.industry);
    if (filters.sort) queryParams.set('sort', filters.sort);
    
    const queryString = queryParams.toString();
    router.push(`/solutions${queryString ? `?${queryString}` : ''}`);
  };
  
  // Fetch dashboard data using React Query
  const { 
    data: dashboardData, 
    isLoading, 
    error 
  } = useDashboardStats();

  // Fetch user recommendations
  const { 
    data: recommendationsData, 
    isLoading: recommendationsLoading 
  } = useUserRecommendations();

  // Debug logging
  useEffect(() => {
    console.log('Dashboard - User:', user);
    console.log('Dashboard - IsLoading:', isLoading);
    console.log('Dashboard - Error:', error);
    console.log('Dashboard - DashboardData:', dashboardData);
  }, [user, isLoading, error, dashboardData]);

  // Show sign-in prompt instead of redirecting
  if (!user) {
    return (
      <Layout
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        showSearch={true}
        onAdvancedSearch={handleAdvancedSearch}
        currentFilters={currentFilters}
        pageType="solutions"
      >
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="max-w-md w-full mx-auto text-center">
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to AstralAI</h1>
              <p className="text-gray-600 mb-6">Sign in to access your personalized dashboard and discover AI solutions.</p>
              
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/auth/login')}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
                >
                  Sign In
                </button>
                <button
                  onClick={() => router.push('/auth/register')}
                  className="w-full bg-transparent border border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
                >
                  Create Account
                </button>
              </div>
              
              <p className="text-sm text-gray-500 mt-6">
                New to AstralAI? <span className="text-blue-500 hover:text-blue-600 cursor-pointer">Learn more about our platform</span>
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const stats = dashboardData?.stats || {
    totalQueries: 0,
    activeQueries: 0,
    resolvedQueries: 0,
    totalSolutions: 0,
    totalViews: 0,
    totalInquiries: 0,
    averageRating: 0
  };

  const featuredSolutions = dashboardData?.featuredSolutions || [];
  const activeQueries = dashboardData?.activeQueries || [];
  const recentActivity = dashboardData?.recentActivity || [];
  const recommendations = recommendationsData?.solutions || [];

  // Get role-specific welcome message
  const getWelcomeMessage = () => {
    switch (user.role) {
      case 'superadmin':
        return {
          title: 'Welcome back, Admin!',
          subtitle: 'Manage the AI Solutions marketplace and monitor platform activity.'
        };
      case 'vendor':
        return {
          title: `Welcome back, ${user.firstName}!`,
          subtitle: 'Monitor your solutions, respond to queries, and grow your business.'
        };
      case 'customer':
        return {
          title: `Welcome back, ${user.firstName}!`,
          subtitle: 'Discover new AI solutions and manage your queries.'
        };
      default:
        return {
          title: 'Welcome to AstralAI!',
          subtitle: 'Your gateway to the best AI solutions.'
        };
    }
  };

  const welcome = getWelcomeMessage();

  // Get role-specific stats cards
  const getStatsCards = () => {
    switch (user.role) {
      case 'superadmin':
        return [
          {
            title: 'Total Queries',
            value: stats.totalQueries,
            icon: DocumentTextIcon,
            color: 'blue',
            change: '+12%',
            changeType: 'increase'
          },
          {
            title: 'Active Solutions',
            value: stats.totalSolutions,
            icon: SparklesIcon,
            color: 'green',
            change: '+8%',
            changeType: 'increase'
          },
          {
            title: 'Total Views',
            value: stats.totalViews,
            icon: EyeIcon,
            color: 'purple',
            change: '+15%',
            changeType: 'increase'
          },
          {
            title: 'Avg. Rating',
            value: stats.averageRating.toFixed(1),
            icon: HeartIcon,
            color: 'yellow',
            change: '+0.3',
            changeType: 'increase'
          }
        ];
      case 'vendor':
        return [
          {
            title: 'My Solutions',
            value: stats.totalSolutions,
            icon: SparklesIcon,
            color: 'blue',
            change: '+2',
            changeType: 'increase'
          },
          {
            title: 'Total Views',
            value: stats.totalViews,
            icon: EyeIcon,
            color: 'green',
            change: '+24%',
            changeType: 'increase'
          },
          {
            title: 'Inquiries',
            value: stats.totalInquiries,
            icon: ChatBubbleLeftRightIcon,
            color: 'purple',
            change: '+5',
            changeType: 'increase'
          },
          {
            title: 'Avg. Rating',
            value: stats.averageRating.toFixed(1),
            icon: HeartIcon,
            color: 'yellow',
            change: '+0.2',
            changeType: 'increase'
          }
        ];
      case 'customer':
        return [
          {
            title: 'My Queries',
            value: stats.totalQueries,
            icon: DocumentTextIcon,
            color: 'blue',
            change: '+1',
            changeType: 'increase'
          },
          {
            title: 'Active Queries',
            value: stats.activeQueries,
            icon: ClockIcon,
            color: 'orange',
            change: '0',
            changeType: 'neutral'
          },
          {
            title: 'Resolved',
            value: stats.resolvedQueries,
            icon: CheckBadgeIcon,
            color: 'green',
            change: '+2',
            changeType: 'increase'
          },
          {
            title: 'Inquiries Sent',
            value: stats.totalInquiries,
            icon: ChatBubbleLeftRightIcon,
            color: 'purple',
            change: '+3',
            changeType: 'increase'
          }
        ];
      default:
        return [];
    }
  };

  const statsCards = getStatsCards();

  // Handle quick actions
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'browse-solutions':
        router.push('/solutions');
        break;
      case 'post-query':
        router.push('/queries/new');
        break;
      case 'add-solution':
        router.push('/solutions/new');
        break;
      case 'manage-users':
        // Navigate to Manage Users page
        router.push('/admin/users');
        break;
      case 'pending-solutions':
        // Navigate to Pending Solutions page
        router.push('/admin/solutions');
        break;
      case 'view-analytics':
        // Scroll to the analytics section or show a message
        toast.success('Analytics feature coming soon!');
        break;
      default:
        toast.error('Action not implemented yet');
    }
  };

  // Get quick actions based on role
  const getQuickActions = () => {
    switch (user.role) {
      case 'superadmin':
        return [
          { id: 'browse-solutions', label: 'Browse Solutions', icon: SparklesIcon },
          { id: 'manage-users', label: 'Manage Users', icon: UserGroupIcon },
          { id: 'view-analytics', label: 'View Analytics', icon: ChartBarIcon },
          { id: 'pending-solutions', label: 'Pending Solutions', icon: ClockIcon }
        ];
      case 'vendor':
        return [
          { id: 'add-solution', label: 'Add Solution', icon: PlusIcon },
          { id: 'browse-solutions', label: 'Browse Solutions', icon: SparklesIcon },
          { id: 'view-queries', label: 'View Queries', icon: DocumentTextIcon },
          { id: 'analytics', label: 'Analytics', icon: ChartBarIcon }
        ];
      case 'customer':
        return [
          { id: 'post-query', label: 'Post Query', icon: PlusIcon },
          { id: 'browse-solutions', label: 'Browse Solutions', icon: SparklesIcon },
          { id: 'my-queries', label: 'My Queries', icon: DocumentTextIcon },
          { id: 'bookmarks', label: 'Bookmarks', icon: HeartIcon }
        ];
      default:
        return [];
    }
  };

  const quickActions = getQuickActions();

  if (isLoading) {
    return (
      <Layout
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        showSearch={true}
        onAdvancedSearch={handleAdvancedSearch}
        currentFilters={currentFilters}
        pageType="solutions"
      >
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-900">Loading dashboard...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        showSearch={true}
        onAdvancedSearch={handleAdvancedSearch}
        currentFilters={currentFilters}
        pageType="solutions"
      >
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load dashboard</h2>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      searchValue={searchValue}
      onSearchChange={handleSearchChange}
      showSearch={true}
      onAdvancedSearch={handleAdvancedSearch}
      currentFilters={currentFilters}
      pageType="solutions"
    >
      <div className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{welcome.title}</h1>
          <p className="mt-2 text-lg text-gray-600">{welcome.subtitle}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.changeType === 'increase' ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    ) : stat.changeType === 'decrease' ? (
                      <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                    ) : null}
                    <span className={`text-sm font-medium ${
                      stat.changeType === 'increase' ? 'text-green-600' :
                      stat.changeType === 'decrease' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">from last month</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg bg-gray-50`}>
                  <stat.icon className={`h-6 w-6 text-blue-500`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action.id)}
                    className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-gray-50 transition-colors text-left"
                  >
                    <action.icon className="h-6 w-6 text-blue-500" />
                    <span className="font-medium text-gray-900">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Solutions */}
            {featuredSolutions.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Featured Solutions</h2>
                  <button
                    onClick={() => router.push('/solutions')}
                    className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {featuredSolutions.slice(0, 3).map((solution: any) => (
                    <div
                      key={solution._id}
                      className="flex items-center space-x-4 p-4 rounded-lg border border-gray-200 hover:border-blue-500 cursor-pointer transition-colors"
                      onClick={() => router.push(`/solutions/${solution._id}`)}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
                        <SparklesIcon className="h-6 w-6 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{solution.title}</h3>
                        <p className="text-sm text-gray-600 truncate">{solution.shortDescription}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-500">{solution.category}</span>
                          <span className="text-sm text-gray-500">{solution.industry}</span>
                          {solution.rating && (
                            <div className="flex items-center space-x-1">
                              <span className="text-sm font-medium text-gray-900">
                                {solution.rating.average.toFixed(1)}
                              </span>
                              <span className="text-sm text-gray-500">({solution.rating.count})</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Queries */}
            {user.role === 'superadmin' && activeQueries.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Queries</h2>
                  <button
                    onClick={() => router.push('/queries')}
                    className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {activeQueries.slice(0, 3).map((query: any) => (
                    <div
                      key={query._id}
                      className="flex items-start space-x-4 p-4 rounded-lg border border-gray-200"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
                        <DocumentTextIcon className="h-6 w-6 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{query.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">{query.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {query.status}
                          </span>
                          <span className="text-sm text-gray-500">{query.category}</span>
                          <span className="text-sm text-gray-500">{query.industry}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recommended for You</h2>
                <div className="space-y-4">
                  {recommendations.slice(0, 3).map((solution: any) => (
                    <div
                      key={solution._id}
                      className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-blue-500 cursor-pointer transition-colors"
                      onClick={() => router.push(`/solutions/${solution._id}`)}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
                        <SparklesIcon className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm truncate">{solution.title}</h3>
                        <p className="text-xs text-gray-600 truncate">{solution.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            {recentActivity.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  {recentActivity.map((activity: any, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        {(() => {
                          const IconComponent = getActivityIcon(activity.icon);
                          return <IconComponent className="h-4 w-4 text-gray-600" />;
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-600 truncate">{activity.details}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notifications */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                <BellIcon className="h-5 w-5 text-gray-500" />
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-blue-700">New solution approved</p>
                    <p className="text-xs text-blue-600">AI Customer Service Bot is now live</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-green-700">Query resolved</p>
                    <p className="text-xs text-green-600">Customer found their solution</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-yellow-700">New inquiry received</p>
                    <p className="text-xs text-yellow-600">Someone is interested in your solution</p>
                  </div>
                </div>
              </div>
            </div>

            {/* User Statistics - Only for Superadmin */}
            {user?.role === 'superadmin' && (
              <UserStatsSection />
            )}

            {/* Pending Solutions Section - Only for Superadmin */}
            {user?.role === 'superadmin' && (
              <div id="pending-solutions-section" className="mt-8">
                <PendingSolutionsSection />
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;