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
        <title>Proposals - AstralAI</title>
        <meta name="description" content="Submit and respond to solution proposals." />
      </Head>
      
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Proposals</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {user?.role === 'customer' 
                    ? 'Create proposals for solutions you need, or view vendor proposals'
                    : 'View customer proposals and submit responses, or create your own proposals'}
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                Create Proposal
              </button>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4 mb-4">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search proposals..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </form>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 border rounded-md flex items-center gap-2 transition-colors ${
                  showFilters 
                    ? 'bg-blue-50 border-blue-300 text-blue-700' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FunnelIcon className="w-5 h-5" />
                Filters
              </button>
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
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          </div>

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
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                  >
                    <PlusIcon className="w-5 h-5" />
                    List Your Problem
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {filteredProposals.map((proposal) => (
                  <motion.div
                    key={proposal._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/proposals/${proposal._id}`)}
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                            {proposal.title}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadgeColor(proposal.status)}`}>
                              {proposal.status.replace('_', ' ')}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityBadgeColor(proposal.priority)}`}>
                              {proposal.priority}
                            </span>
                            {proposal.creatorType === 'vendor' && (
                              <span className="px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-800">
                                Vendor
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {proposal.description}
                      </p>

                      {/* Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <TagIcon className="w-4 h-4" />
                          <span>{proposal.category}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <BuildingOfficeIcon className="w-4 h-4" />
                          <span>{proposal.industry}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CurrencyDollarIcon className="w-4 h-4" />
                          <span>{formatBudget(proposal.requirements.budget)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{proposal.requirements.timeline}</span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <EyeIcon className="w-4 h-4" />
                            {proposal.viewsCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <DocumentTextIcon className="w-4 h-4" />
                            {proposal.responsesCount} {proposal.responsesCount === 1 ? 'response' : 'responses'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(proposal.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Respond Button - Only for vendors on customer proposals */}
                      {user?.role === 'vendor' && proposal.creatorType === 'customer' && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProposal(proposal);
                              setShowResponseModal(true);
                            }}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
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
