/**
 * Proposals Page
 * Customers can create proposals for solutions they need
 * Vendors can view customer proposals and submit responses, or create their own proposals
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon,
  UserIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  TagIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout/Layout';
import { proposalsApi, solutionsApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import Head from 'next/head';
import { CreateProposalModal } from '@/components/proposals/CreateProposalModal';
import { ProposalResponseModal } from '@/components/proposals/ProposalResponseModal';

// Filter options
const CATEGORIES = [
  'All Categories',
  'Chatbots',
  'Predictive Analytics',
  'Computer Vision',
  'Recommendation Systems',
  'Machine Learning',
  'Natural Language Processing'
];

const INDUSTRIES = [
  'All Industries',
  'Healthcare',
  'E-commerce',
  'Finance',
  'Technology',
  'Manufacturing',
  'Education',
  'Retail'
];

const STATUS_OPTIONS = [
  'All Status',
  'draft',
  'active',
  'in_progress',
  'completed',
  'cancelled'
];

const PRIORITY_OPTIONS = [
  'All Priorities',
  'low',
  'medium',
  'high',
  'urgent'
];

interface Proposal {
  _id: string;
  title: string;
  description: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  creatorType: 'customer' | 'vendor';
  category: string;
  industry: string;
  tags: string[];
  requirements: {
    budget: {
      min?: number;
      max?: number;
      currency: string;
    };
    timeline: string;
    deploymentPreference: string;
    requiredFeatures: string[];
    preferredFeatures: string[];
  };
  status: 'draft' | 'active' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  responsesCount: number;
  viewsCount: number;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface FilterState {
  search: string;
  category: string;
  industry: string;
  status: string;
  priority: string;
  creatorType: string;
  page: number;
  limit: number;
}

const ProposalsPage: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'All Categories',
    industry: 'All Industries',
    status: 'All Status',
    priority: 'All Priorities',
    creatorType: '',
    page: 1,
    limit: 12
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch proposals
  const fetchProposals = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const params: any = {
        page: filters.page,
        limit: filters.limit,
      };
      
      if (filters.category !== 'All Categories') params.category = filters.category;
      if (filters.industry !== 'All Industries') params.industry = filters.industry;
      if (filters.status !== 'All Status') params.status = filters.status;
      if (filters.creatorType) params.creatorType = filters.creatorType;

      const response = await proposalsApi.getProposals(params);
      
      if (response.success) {
        setProposals(response.proposals || []);
        setTotal(response.total || 0);
        setCurrentPage(response.currentPage || 1);
        setTotalPages(response.totalPages || 1);
      }
    } catch (error: any) {
      console.error('Error fetching proposals:', error);
      toast.error('Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [filters.page, filters.category, filters.industry, filters.status, filters.creatorType, isAuthenticated]);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProposals();
  };

  const filteredProposals = proposals.filter(proposal => {
    if (!filters.search) return true;
    const searchLower = filters.search.toLowerCase();
    return (
      proposal.title.toLowerCase().includes(searchLower) ||
      proposal.description.toLowerCase().includes(searchLower) ||
      proposal.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatBudget = (budget: { min?: number; max?: number; currency?: string }) => {
    if (!budget.min && !budget.max) return 'Not specified';
    const currency = budget.currency || 'USD';
    if (budget.min && budget.max) {
      return `${currency} ${budget.min.toLocaleString()} - ${budget.max.toLocaleString()}`;
    } else if (budget.min) {
      return `${currency} ${budget.min.toLocaleString()}+`;
    } else if (budget.max) {
      return `Up to ${currency} ${budget.max.toLocaleString()}`;
    }
    return 'Not specified';
  };

  if (authLoading || !isAuthenticated) {
    return (
      <Layout title="Proposals">
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-gray-900">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Proposals">
      <Head>
        <title>Proposals - AstroVault AI</title>
        <meta name="description" content="Submit and respond to solution proposals." />
      </Head>
      
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          {/* Header Actions */}
          <div className="mb-4 flex items-center justify-end gap-3">
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search proposals..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-64 pl-9 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm"
                  />
                </form>
                {/* Create Proposal Button */}
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center gap-2 font-medium shadow-md hover:shadow-lg"
                >
                  <PlusIcon className="w-5 h-5" />
                  Create Proposal
                </button>
                {/* Filters Button - Icon Only with Tooltip */}
                <div className="relative group">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-2.5 border rounded-xl flex items-center justify-center transition-all ${
                      showFilters 
                        ? 'bg-purple-50 border-purple-300 text-purple-700 shadow-sm' 
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow-sm'
                    }`}
                  >
                    <FunnelIcon className="w-5 h-5" />
                  </button>
                  {/* Tooltip */}
                  <div className="absolute right-0 top-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    <div className="bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg">
                      Filter
                      <div className="absolute right-3 -top-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                  </div>
                </div>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 grid grid-cols-1 md:grid-cols-4 gap-4 shadow-sm">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                      <select
                        value={filters.industry}
                        onChange={(e) => handleFilterChange('industry', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      >
                        {INDUSTRIES.map(ind => (
                          <option key={ind} value={ind}>{ind}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      >
                        {STATUS_OPTIONS.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select
                        value={filters.creatorType}
                        onChange={(e) => handleFilterChange('creatorType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      >
                        <option value="">All Types</option>
                        <option value="customer">Customer Proposals</option>
                        <option value="vendor">Vendor Proposals</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          {/* Proposals Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredProposals.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No proposals found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filters.search || filters.category !== 'All Categories' || filters.industry !== 'All Industries'
                  ? 'Try adjusting your filters'
                  : 'Get started by creating a new proposal'}
              </p>
              {!filters.search && filters.category === 'All Categories' && filters.industry === 'All Industries' && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 inline-flex items-center gap-2 font-medium shadow-md hover:shadow-lg"
                  >
                    <PlusIcon className="w-5 h-5" />
                    List Your Problem
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-6">
                {filteredProposals.map((proposal) => (
                  <motion.div
                    key={proposal._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 overflow-hidden relative"
                    onClick={() => router.push(`/proposals/${proposal._id}`)}
                  >
                    {/* Elegant Purple Gradient Accent Bar */}
                    <div className="h-1 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600"></div>
                    
                    <div className="p-8">
                      {/* Category Header with Icon */}
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                          <SparklesIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                            {proposal.category || 'PROPOSAL'}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadgeColor(proposal.status)}`}>
                              {proposal.status.replace('_', ' ')}
                            </span>
                            {proposal.creatorType === 'vendor' && (
                              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                                Vendor
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Main Description - Large Quote Style */}
                      <p className="text-base text-gray-900 leading-relaxed mb-6 line-clamp-4 font-medium">
                        {proposal.description}
                      </p>

                      {/* Engagement Stats - Like Star Ratings */}
                      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                        <div className="flex items-center gap-1">
                          <EyeIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">{proposal.viewsCount}</span>
                          <span className="text-xs text-gray-500 ml-1">views</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ChatBubbleLeftRightIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">{proposal.responsesCount}</span>
                          <span className="text-xs text-gray-500 ml-1">responses</span>
                        </div>
                      </div>

                      {/* Creator Info - Bottom Section */}
                      <div className="flex items-center justify-between relative">
                        <div className="flex-1">
                          <p className="text-xs text-gray-600 mb-1">
                            Proposal by <span className="font-semibold text-gray-900">{proposal.createdBy.firstName} {proposal.createdBy.lastName}</span>
                          </p>
                          <p className="text-xs text-gray-500">
                            {proposal.industry} • {new Date(proposal.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        {/* Avatar Circle */}
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-md relative z-10">
                            <span className="text-white font-semibold text-sm">
                              {proposal.createdBy.firstName?.charAt(0) || 'U'}
                              {proposal.createdBy.lastName?.charAt(0) || ''}
                            </span>
                          </div>
                          {/* Subtle glow effect */}
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/30 to-blue-400/30 rounded-full blur-sm -z-0"></div>
                        </div>
                      </div>

                      {/* Respond Button - Available for all users on customer proposals and for proposal creators */}
                      {(proposal.creatorType === 'customer' || user?._id === proposal.createdBy._id) && (
                        <div className="mt-6 pt-6 border-t border-gray-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProposal(proposal);
                              setShowResponseModal(true);
                            }}
                            className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg"
                          >
                            <ChatBubbleLeftRightIcon className="w-5 h-5" />
                            Respond with Solution
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <div className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * filters.limit) + 1} to {Math.min(currentPage * filters.limit, total)} of {total} proposals
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleFilterChange('page', currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handleFilterChange('page', currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create Proposal Modal */}
      <CreateProposalModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          fetchProposals();
          setShowCreateModal(false);
        }}
      />

      {/* Response Modal */}
      {selectedProposal && (
        <ProposalResponseModal
          isOpen={showResponseModal}
          onClose={() => {
            setShowResponseModal(false);
            setSelectedProposal(null);
          }}
          onSuccess={() => {
            fetchProposals();
            setShowResponseModal(false);
            setSelectedProposal(null);
          }}
          proposal={selectedProposal}
        />
      )}
    </Layout>
  );
};

export default ProposalsPage;
