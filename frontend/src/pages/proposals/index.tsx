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
import { PostNeedWizard } from '@/components/proposals/PostNeedWizard';
import { ProposalResponseModal } from '@/components/proposals/ProposalResponseModal';
import { PostingsTab } from '@/components/proposals/PostingsTab';
import { VendorResponsesTab } from '@/components/proposals/VendorResponsesTab';
import { FindWorkTab } from '@/components/proposals/FindWorkTab';
import { MyProposalsTab } from '@/components/proposals/MyProposalsTab';

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
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Tab state based on user role
  const [activeTab, setActiveTab] = useState<'findWork' | 'myPostings' | 'myProposals' | 'postings' | 'vendorResponses'>(
    user?.role === 'vendor' ? 'findWork' : 'postings'
  );

  // Dynamic placeholder based on active tab
  const getSearchPlaceholder = () => {
    if (user?.role === 'vendor') {
      switch (activeTab) {
        case 'findWork':
          return 'Search opportunities...';
        case 'myPostings':
          return 'Search your postings...';
        case 'myProposals':
          return 'Search your proposals...';
        default:
          return 'Search proposals...';
      }
    } else {
      switch (activeTab) {
        case 'postings':
          return 'Search your postings...';
        case 'vendorResponses':
          return 'Search vendor responses...';
        default:
          return 'Search proposals...';
      }
    }
  };

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

  // Fetch proposals based on active tab
  const fetchProposals = async () => {
    if (!isAuthenticated) return;
    
    // Skip fetching if active tab handles its own data (e.g., FindWorkTab, PostingsTab, etc.)
    // These tabs manage their own API calls to avoid duplicate requests
    if ((user?.role === 'vendor' && activeTab === 'findWork') ||
        (user?.role === 'vendor' && activeTab === 'myPostings') ||
        (user?.role === 'vendor' && activeTab === 'myProposals') ||
        (user?.role === 'customer' && activeTab === 'postings') ||
        (user?.role === 'customer' && activeTab === 'vendorResponses')) {
      return;
    }
    
    setLoading(true);
    try {
      const params: any = {
        page: filters.page,
        limit: filters.limit,
      };
      
      // Apply filters
      if (filters.category !== 'All Categories') params.category = filters.category;
      if (filters.industry !== 'All Industries') params.industry = filters.industry;
      if (filters.status !== 'All Status') params.status = filters.status;

      // Tab-based filtering
      if (user?.role === 'vendor') {
        if (activeTab === 'findWork') {
          // Customer proposals (active only) - vendors can respond to these
          params.creatorType = 'customer';
          params.status = 'active';
        } else if (activeTab === 'myProposals') {
          // Vendor's own proposals
          params.createdBy = user._id;
          params.creatorType = 'vendor';
        }
      } else if (user?.role === 'customer') {
        if (activeTab === 'postings') {
          // Customer's own proposals
          params.createdBy = user._id;
          params.creatorType = 'customer';
        } else if (activeTab === 'vendorResponses') {
          // Customer proposals with vendor responses
          params.createdBy = user._id;
          params.creatorType = 'customer';
          // Filter to only show proposals with responses
          // This would need backend support or client-side filtering
        }
      }

      const response = await proposalsApi.getProposals(params);
      
      if (response.success) {
        let proposalsList = response.proposals || [];
        
        // Client-side filter for vendorResponses (proposals with responses)
        if (activeTab === 'vendorResponses' && user?.role === 'customer') {
          proposalsList = proposalsList.filter((p: Proposal) => p.responsesCount > 0);
        }
        
        setProposals(proposalsList);
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

  // Update active tab when user role changes
  useEffect(() => {
    if (user?.role === 'vendor') {
      setActiveTab('findWork');
    } else if (user?.role === 'customer') {
      setActiveTab('postings');
    }
  }, [user?.role]);

  // Reset filters when tab changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, page: 1, creatorType: '' }));
  }, [activeTab]);

  useEffect(() => {
    fetchProposals();
  }, [filters.page, filters.category, filters.industry, filters.status, filters.creatorType, isAuthenticated, activeTab]);

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
        <div className="w-full px-4 sm:px-6 lg:px-8 py-2">
          {/* Tab Navigation with Actions */}
          <div className="border-b border-gray-200 mb-4">
            <div className="flex items-center justify-between gap-4">
              <nav className="-mb-px flex space-x-8">
                {/* Vendor Sub-tabs */}
                {user?.role === 'vendor' && (
                  <>
                    <button
                      onClick={() => setActiveTab('findWork')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'findWork'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Opportunities
                    </button>
                    <button
                      onClick={() => setActiveTab('myPostings')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'myPostings'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      My Postings
                    </button>
                    <button
                      onClick={() => setActiveTab('myProposals')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'myProposals'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      My Proposals
                    </button>
                  </>
                )}
                
                {/* Customer Sub-tabs */}
                {user?.role === 'customer' && (
                  <>
                    <button
                      onClick={() => setActiveTab('postings')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'postings'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Postings
                    </button>
                    <button
                      onClick={() => setActiveTab('vendorResponses')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === 'vendorResponses'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Vendor Responses
                    </button>
                  </>
                )}
              </nav>
              {/* Search Bar, Filter Button, Create Button */}
              <div className="flex items-center gap-3">
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="relative flex items-center">
                  <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={getSearchPlaceholder()}
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-64 pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-900"
                  />
                </form>
                {/* Post New Need Button - Show for customers on Postings tab and vendors on My Postings tab */}
                {((user?.role === 'customer' && activeTab === 'postings') || (user?.role === 'vendor' && activeTab === 'myPostings')) && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center gap-2 font-medium shadow-md hover:shadow-lg text-sm"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Post a New Need
                  </button>
                )}
                {/* Filter Button - Show for all tabs after search bar */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 border rounded-lg flex items-center justify-center transition-all ${
                    showFilters 
                      ? 'bg-purple-50 border-purple-300 text-purple-700 shadow-sm' 
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow-sm'
                  }`}
                  title="Filter"
                >
                  <FunnelIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filter Panel - Show for all tabs */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-6"
              >
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 grid grid-cols-1 md:grid-cols-4 gap-4 shadow-sm">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                    <select
                      value={filters.industry}
                      onChange={(e) => handleFilterChange('industry', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                    >
                      {INDUSTRIES.map(ind => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                    >
                      {STATUS_OPTIONS.map(status => (
                        <option key={status} value={status}>{status.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      value={filters.priority}
                      onChange={(e) => handleFilterChange('priority', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                    >
                      {PRIORITY_OPTIONS.map(priority => (
                        <option key={priority} value={priority}>{priority.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tab Content */}
          {user?.role === 'customer' && activeTab === 'postings' && (
            <PostingsTab searchQuery={filters.search} filters={filters} refreshTrigger={refreshTrigger} />
          )}

          {/* Vendor Responses Tab */}
          {user?.role === 'customer' && activeTab === 'vendorResponses' && (
            <VendorResponsesTab searchQuery={filters.search} filters={filters} />
          )}

          {/* Opportunities Tab */}
          {user?.role === 'vendor' && activeTab === 'findWork' && (
            <FindWorkTab searchQuery={filters.search} filters={filters} />
          )}

          {/* My Postings Tab (Vendor's own proposals/problems) */}
          {user?.role === 'vendor' && activeTab === 'myPostings' && (
            <PostingsTab searchQuery={filters.search} filters={filters} refreshTrigger={refreshTrigger} />
          )}

          {/* My Proposals Tab (Vendor's responses to customer problems) */}
          {user?.role === 'vendor' && activeTab === 'myProposals' && (
            <MyProposalsTab searchQuery={filters.search} filters={filters} />
          )}

          {/* Legacy Proposals Grid - Keep for now as fallback */}
          {user?.role !== 'customer' && user?.role !== 'vendor' && (
            <>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {filteredProposals.map((proposal) => (
                  <motion.div
                    key={proposal._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 overflow-hidden relative"
                    onClick={() => router.push(`/proposals/${proposal._id}`)}
                  >
                    {/* Elegant Purple Gradient Accent Bar */}
                    <div className="h-1 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600"></div>
                    
                    <div className="p-6">
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
            </>
          )}
        </div>
      </div>

      {/* Post Need Wizard */}
      <PostNeedWizard
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={(proposalId, matchedVendors) => {
          fetchProposals();
          setShowCreateModal(false);
          // Trigger refresh for PostingsTab
          setRefreshTrigger(prev => prev + 1);
          if (matchedVendors && matchedVendors.length > 0) {
            toast.success(`Found ${matchedVendors.length} matched vendors! You can invite them to bid.`);
          }
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
