/**
 * Opportunities Tab Component (Vendor View)
 * Features:
 * - Opportunity Feed: Searchable list of all public "Postings" from customers
 * - Advanced Filters: Industry, Budget, Urgency, Tech-stack required
 * - One-Click Pitch: Link Existing Product + Proposal Editor
 */

import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  ChatBubbleLeftRightIcon,
  EyeIcon,
  TagIcon,
  CurrencyDollarIcon,
  ClockIcon,
  SparklesIcon,
  UserIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { proposalsApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { ProposalResponseModal } from './ProposalResponseModal';
import { ViewProposalModal } from './ViewProposalModal';
import { ViewOpportunityModal } from './ViewOpportunityModal';

interface Proposal {
  _id: string;
  title: string;
  description: string;
  category: string;
  industry: string;
  status: 'draft' | 'active' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  responsesCount: number;
  viewsCount: number;
  requirements: {
    budget: {
      min?: number;
      max?: number;
      currency: string;
    };
    timeline: string;
  };
  createdAt: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
  responses?: Array<{
    _id: string;
    vendorId: string | { _id: string };
    status: string;
  }>;
}

interface FindWorkTabProps {
  searchQuery: string;
  filters: any;
}

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

const PRIORITY_OPTIONS = [
  'All Priorities',
  'low',
  'medium',
  'high',
  'urgent'
];

export const FindWorkTab: React.FC<FindWorkTabProps> = ({ searchQuery, filters }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showOpportunityModal, setShowOpportunityModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [selectedProposalForView, setSelectedProposalForView] = useState<string | null>(null);
  const [selectedOpportunityForView, setSelectedOpportunityForView] = useState<string | null>(null);
  
  const [localFilters, setLocalFilters] = useState({
    industry: 'All Industries',
    priority: 'All Priorities',
    minBudget: '',
    maxBudget: '',
    techStack: ''
  });

  // Only fetch when user ID changes or when industry filter changes (API-level filter)
  useEffect(() => {
    if (user?._id) {
      fetchOpportunities();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id, localFilters.industry]);

  const fetchOpportunities = React.useCallback(async () => {
    if (!user?._id) return;
    
    setLoading(true);
    try {
      const params: any = {
        creatorType: 'customer',
        status: 'active', // Only show active opportunities
        limit: 50
      };

      if (localFilters.industry !== 'All Industries') {
        params.industry = localFilters.industry;
      }

      const response = await proposalsApi.getProposals(params);
      
      if (response.success) {
        // Store all opportunities - filtering will be done client-side in useMemo
        setOpportunities(response.proposals || []);
      }
    } catch (error: any) {
      console.error('Error fetching opportunities:', error);
      // Don't show error toast for rate limit errors to avoid spam
      if (error.response?.status !== 429) {
        toast.error('Failed to load opportunities');
      }
    } finally {
      setLoading(false);
    }
  }, [user?._id, localFilters.industry]);

  const handleFilterChange = (key: string, value: string) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePitch = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setShowResponseModal(true);
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

  // Apply client-side filters for priority and budget that don't require API calls
  const filteredOpportunities = React.useMemo(() => {
    let filtered = opportunities;
    
    // Apply priority filter (client-side)
    if (localFilters.priority !== 'All Priorities') {
      filtered = filtered.filter((p: Proposal) => p.priority === localFilters.priority);
    }

    // Apply budget filters (client-side)
    if (localFilters.minBudget) {
      filtered = filtered.filter((p: Proposal) => 
        p.requirements.budget.min && p.requirements.budget.min >= parseFloat(localFilters.minBudget)
      );
    }

    if (localFilters.maxBudget) {
      filtered = filtered.filter((p: Proposal) => 
        p.requirements.budget.max && p.requirements.budget.max <= parseFloat(localFilters.maxBudget)
      );
    }

    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((opportunity) => (
        opportunity.title.toLowerCase().includes(query) ||
        opportunity.description.toLowerCase().includes(query) ||
        opportunity.category.toLowerCase().includes(query) ||
        opportunity.industry.toLowerCase().includes(query)
      ));
    }
    
    return filtered;
  }, [opportunities, localFilters.priority, localFilters.minBudget, localFilters.maxBudget, searchQuery]);

  return (
    <div>
      {/* Advanced Filters */}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                <select
                  value={localFilters.industry}
                  onChange={(e) => handleFilterChange('industry', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  {INDUSTRIES.map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Urgency</label>
                <select
                  value={localFilters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  {PRIORITY_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Budget</label>
                <input
                  type="number"
                  value={localFilters.minBudget}
                  onChange={(e) => handleFilterChange('minBudget', e.target.value)}
                  placeholder="e.g., 10000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Budget</label>
                <input
                  type="number"
                  value={localFilters.maxBudget}
                  onChange={(e) => handleFilterChange('maxBudget', e.target.value)}
                  placeholder="e.g., 100000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Opportunity Feed */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredOpportunities.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No opportunities found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or check back later</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpportunities.map((opportunity) => (
            <motion.div
              key={opportunity._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden"
            >
              {/* Gradient Accent Bar */}
              <div className="h-1 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600"></div>
              
              <div className="p-6">
                {/* Category Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                      <SparklesIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {opportunity.category || 'Uncategorized'}
                    </span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadgeColor(opportunity.priority)}`}>
                    {opportunity.priority}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {opportunity.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {opportunity.description}
                </p>

                {/* Budget */}
                {opportunity.requirements.budget && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <CurrencyDollarIcon className="w-4 h-4" />
                      <span className="font-medium">{formatBudget(opportunity.requirements.budget)}</span>
                    </div>
                  </div>
                )}

                {/* Industry & Timeline */}
                <div className="flex items-center gap-3 mb-4">
                  {opportunity.industry && (
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                      {opportunity.industry}
                    </span>
                  )}
                  {opportunity.requirements.timeline && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <ClockIcon className="w-3 h-3" />
                      <span>{opportunity.requirements.timeline.replace('-', ' ')}</span>
                    </div>
                  )}
                </div>

                {/* Creator Info */}
                {opportunity.createdBy && (
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <UserIcon className="w-3 h-3 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        Posted by {opportunity.createdBy.firstName} {opportunity.createdBy.lastName}
                      </p>
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <EyeIcon className="w-3 h-3" />
                    <span>{opportunity.viewsCount || 0} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ChatBubbleLeftRightIcon className="w-3 h-3" />
                    <span>{opportunity.responsesCount || 0} responses</span>
                  </div>
                  {/* Show if current user has already submitted */}
                  {user && opportunity.responses && opportunity.responses.some((response: any) => {
                    const vendorId = typeof response.vendorId === 'object' ? response.vendorId._id : response.vendorId;
                    return vendorId === user._id;
                  }) && (
                    <div className="flex items-center gap-1 text-purple-600">
                      <CheckCircleIcon className="w-3 h-3" />
                      <span className="font-medium">You proposed</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOpportunityForView(opportunity._id);
                      setShowOpportunityModal(true);
                    }}
                    className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <EyeIcon className="w-4 h-4" />
                    View
                  </button>
                  {user && opportunity.responses && opportunity.responses.some((response: any) => {
                    const vendorId = typeof response.vendorId === 'object' ? response.vendorId._id : response.vendorId;
                    return vendorId === user._id;
                  }) ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProposalForView(opportunity._id);
                        setShowViewModal(true);
                      }}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 text-sm flex items-center justify-center gap-2 font-medium"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      View Proposal
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePitch(opportunity);
                      }}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 transition-all duration-200 text-sm flex items-center justify-center gap-2 font-medium"
                    >
                      <SparklesIcon className="w-4 h-4" />
                      Propose
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Proposal Response Modal */}
      {selectedProposal && (
        <ProposalResponseModal
          isOpen={showResponseModal}
          onClose={() => {
            setShowResponseModal(false);
            setSelectedProposal(null);
          }}
          onSuccess={() => {
            fetchOpportunities();
            setShowResponseModal(false);
            setSelectedProposal(null);
            toast.success('Proposal submitted successfully!');
          }}
          proposal={{
            _id: selectedProposal._id,
            title: selectedProposal.title,
            description: selectedProposal.description,
            category: selectedProposal.category,
            industry: selectedProposal.industry,
            requirements: {
              requiredFeatures: [],
              preferredFeatures: []
            }
          }}
        />
      )}

      {/* View Proposal Modal (for vendor's submitted proposal) */}
      {selectedProposalForView && (
        <ViewProposalModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedProposalForView(null);
          }}
          proposalId={selectedProposalForView}
        />
      )}

      {/* View Opportunity Modal (for viewing customer's opportunity details) */}
      {selectedOpportunityForView && (
        <ViewOpportunityModal
          isOpen={showOpportunityModal}
          onClose={() => {
            setShowOpportunityModal(false);
            setSelectedOpportunityForView(null);
          }}
          proposalId={selectedOpportunityForView}
        />
      )}
    </div>
  );
};
