/**
 * Postings Tab Component (Customer View)
 * Features:
 * - RFP Wizard to post problems
 * - Post Management (list of all posts: active, drafted, closed)
 * - AI Match Suggestion sidebar
 */

import React, { useState, useEffect } from 'react';
import { EyeIcon, ChatBubbleLeftRightIcon, CalendarIcon, TagIcon, SparklesIcon, ClockIcon, CurrencyDollarIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { proposalsApi, solutionsApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { ViewOpportunityModal } from './ViewOpportunityModal';
import { PostNeedWizard } from './PostNeedWizard';
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';

interface Proposal {
  _id: string;
  title: string;
  description: string;
  category: string;
  industry: string;
  status: 'draft' | 'active' | 'in_progress' | 'completed' | 'cancelled';
  priority?: string;
  responsesCount: number;
  viewsCount: number;
  createdAt: string;
  requirements?: {
    budget?: { min?: number; max?: number; currency?: string };
    timeline?: string;
  };
}

interface SuggestedVendor {
  _id: string;
  title: string;
  shortDescription: string;
  category: string;
  vendorId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

interface PostingsTabProps {
  searchQuery: string;
  filters: any;
  refreshTrigger?: number; // Trigger refresh when this changes
}

export const PostingsTab: React.FC<PostingsTabProps> = ({ searchQuery, filters, refreshTrigger }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [suggestedVendors, setSuggestedVendors] = useState<SuggestedVendor[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProposalForView, setSelectedProposalForView] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProposal, setEditingProposal] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [proposalToDelete, setProposalToDelete] = useState<Proposal | null>(null);

  useEffect(() => {
    fetchMyPostings();
  }, [user?._id, refreshTrigger]);

  useEffect(() => {
    if (selectedProposal) {
      fetchSuggestedVendors(selectedProposal);
    }
  }, [selectedProposal]);

  const fetchMyPostings = async () => {
    if (!user?._id) return;
    
    setLoading(true);
    try {
      // Fetch all proposals created by this user, regardless of creatorType
      // Note: Backend filters out expired proposals unless status is 'cancelled' or 'completed'
      // For Postings tab, we want to see ALL user's proposals including expired/draft ones
      // So we don't send status filter, but backend will still apply expiry filter
      // If proposal is expired, it may be filtered - this is a backend limitation
      const params: any = {
        createdBy: user._id
        // Removed creatorType filter to show all proposals created by the user
        // Removed status filter - backend will include all statuses for user's own proposals
        // but may still filter expired proposals (backend limitation)
      };
      
      console.log('PostingsTab: Fetching proposals with params:', params);
      const response = await proposalsApi.getProposals(params);
      
      if (response.success) {
        console.log('PostingsTab: Received proposals:', response.proposals?.length || 0, response.proposals);
        setProposals(response.proposals || []);
      } else {
        console.warn('PostingsTab: API response not successful:', response);
      }
    } catch (error: any) {
      console.error('Error fetching postings:', error);
      toast.error('Failed to load your postings');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestedVendors = async (proposal: Proposal) => {
    try {
      // Find matching solutions based on category and industry
      const response = await solutionsApi.getSolutions({
        category: proposal.category,
        industry: proposal.industry,
        limit: 5
      });
      
      if (response.success) {
        setSuggestedVendors(response.solutions || []);
      }
    } catch (error: any) {
      console.error('Error fetching suggested vendors:', error);
    }
  };

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

  const formatBudget = (budget?: { min?: number; max?: number; currency?: string }) => {
    if (!budget || (!budget.min && !budget.max)) return 'Not specified';
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

  const filteredProposals = proposals.filter(proposal => {
    // Only filter if searchQuery exists and is not empty
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const matches = (
        proposal.title.toLowerCase().includes(query) ||
        proposal.description.toLowerCase().includes(query) ||
        proposal.category?.toLowerCase().includes(query) ||
        proposal.industry?.toLowerCase().includes(query)
      );
      if (!matches) {
        console.log('PostingsTab: Proposal filtered out by search:', proposal.title, 'query:', query);
      }
      return matches;
    }
    return true;
  });

  // Debug logging
  React.useEffect(() => {
    console.log('PostingsTab: Proposals state:', {
      total: proposals.length,
      filtered: filteredProposals.length,
      searchQuery,
      proposals: proposals.map(p => ({ _id: p._id, title: p.title, status: p.status }))
    });
  }, [proposals, filteredProposals, searchQuery]);

  return (
    <div className="flex gap-6">
      {/* Main Content */}
      <div className="flex-1">
        {/* Post Management List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredProposals.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No postings yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by posting your first need using the button above</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProposals.map((proposal) => (
              <motion.div
                key={proposal._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden cursor-pointer"
                onClick={() => {
                  setSelectedProposal(proposal);
                  router.push(`/proposals/${proposal._id}`);
                }}
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
                        {proposal.category || 'Uncategorized'}
                      </span>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(proposal.status)}`}>
                      {proposal.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {proposal.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {proposal.description}
                  </p>

                  {/* Budget */}
                  {proposal.requirements?.budget && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <CurrencyDollarIcon className="w-4 h-4" />
                        <span className="font-medium">{formatBudget(proposal.requirements.budget)}</span>
                      </div>
                    </div>
                  )}

                  {/* Industry & Timeline */}
                  <div className="flex items-center gap-3 mb-4">
                    {proposal.industry && (
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                        {proposal.industry}
                      </span>
                    )}
                    {proposal.requirements?.timeline && (
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <ClockIcon className="w-3 h-3" />
                        <span>{proposal.requirements.timeline.replace('-', ' ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <EyeIcon className="w-3 h-3" />
                      <span>{proposal.viewsCount} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ChatBubbleLeftRightIcon className="w-3 h-3" />
                      <span>{proposal.responsesCount} responses</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProposalForView(proposal._id);
                        setShowViewModal(true);
                      }}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 text-sm flex items-center justify-center gap-2 font-medium"
                    >
                      <EyeIcon className="w-4 h-4" />
                      View Details
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          const proposalResponse = await proposalsApi.getProposal(proposal._id);
                          if (proposalResponse.success && proposalResponse.proposal) {
                            setEditingProposal(proposalResponse.proposal);
                            setShowEditModal(true);
                          } else {
                            toast.error('Failed to load proposal details');
                          }
                        } catch (error: any) {
                          console.error('Error loading proposal for edit:', error);
                          toast.error('Failed to load proposal details');
                        }
                      }}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Edit Proposal"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setProposalToDelete(proposal);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Proposal"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* AI Match Suggestion Sidebar */}
      {selectedProposal && suggestedVendors.length > 0 && (
        <div className="w-80 bg-white border border-gray-200 rounded-lg shadow-sm p-6 sticky top-4 h-fit">
          <div className="flex items-center gap-2 mb-4">
            <SparklesIcon className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Suggested Vendors</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Based on your posting: <span className="font-medium">{selectedProposal.title}</span>
          </p>
          <div className="space-y-3">
            {suggestedVendors.map((vendor) => (
              <div
                key={vendor._id}
                className="p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                onClick={() => router.push(`/solutions/${vendor._id}`)}
              >
                <h4 className="font-medium text-blue-900 text-sm mb-1">{vendor.title}</h4>
                <p className="text-xs text-blue-700 line-clamp-2">{vendor.shortDescription}</p>
                <p className="text-xs text-blue-600 mt-2">
                  by {vendor.vendorId?.firstName} {vendor.vendorId?.lastName}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View Opportunity Modal */}
      {selectedProposalForView && (
        <ViewOpportunityModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedProposalForView(null);
          }}
          proposalId={selectedProposalForView}
        />
      )}

      {/* Edit Proposal Modal */}
      {editingProposal && (
        <PostNeedWizard
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingProposal(null);
          }}
          onSuccess={(proposalId) => {
            fetchMyPostings();
            setShowEditModal(false);
            setEditingProposal(null);
            toast.success('Proposal updated successfully!');
          }}
          existingProposal={editingProposal}
          isEditMode={true}
        />
      )}

      {/* Delete Confirmation Modal */}
      {proposalToDelete && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setProposalToDelete(null);
          }}
          onConfirm={async () => {
            try {
              setDeletingId(proposalToDelete._id);
              await proposalsApi.deleteProposal(proposalToDelete._id);
              toast.success('Proposal deleted successfully');
              fetchMyPostings();
              setShowDeleteModal(false);
              setProposalToDelete(null);
            } catch (error: any) {
              console.error('Error deleting proposal:', error);
              toast.error(error.response?.data?.error || error.message || 'Failed to delete proposal');
            } finally {
              setDeletingId(null);
            }
          }}
          title="Delete Proposal"
          message={`Are you sure you want to delete "${proposalToDelete.title}"? This action cannot be undone and all associated responses will be removed.`}
          confirmText="Delete"
          cancelText="Cancel"
          loading={deletingId === proposalToDelete._id}
        />
      )}
    </div>
  );
};

// Fix missing import
const DocumentTextIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
