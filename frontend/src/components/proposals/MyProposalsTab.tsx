/**
 * My Proposals Tab Component (Vendor View)
 * Features:
 * - Pipeline Tracker: Kanban view showing Submitted, Read, Shortlisted, Active Discussion
 * - Edit/Withdraw: Ability to update proposals before customer reads them
 */

import React, { useState, useEffect } from 'react';
import { 
  EyeIcon, 
  StarIcon, 
  ChatBubbleLeftRightIcon, 
  PencilIcon, 
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  SparklesIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { proposalsApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';
import { ProposalResponseModal } from './ProposalResponseModal';

interface VendorResponse {
  _id: string;
  proposalId: string;
  proposalTitle: string;
  proposalText: string;
  proposedPrice?: string;
  proposedTimeline?: string;
  status: 'pending' | 'viewed' | 'shortlisted' | 'rejected';
  createdAt: string;
  updatedAt: string;
  // Check if there's an active chat
  hasActiveChat?: boolean;
}

interface MyProposalsTabProps {
  searchQuery: string;
  filters: any;
}

type PipelineStage = 'submitted' | 'read' | 'shortlisted' | 'activeDiscussion';

const STAGES: { key: PipelineStage; label: string; color: string }[] = [
  { key: 'submitted', label: 'Submitted', color: 'bg-gray-100 text-gray-800' },
  { key: 'read', label: 'Read', color: 'bg-blue-100 text-blue-800' },
  { key: 'shortlisted', label: 'Shortlisted', color: 'bg-green-100 text-green-800' },
  { key: 'activeDiscussion', label: 'Active Discussion', color: 'bg-purple-100 text-purple-800' }
];

export const MyProposalsTab: React.FC<MyProposalsTabProps> = ({ searchQuery, filters }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [responses, setResponses] = useState<VendorResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [proposalToWithdraw, setProposalToWithdraw] = useState<{ responseId: string; proposalId: string; proposalTitle: string } | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState<any>(null);
  const [editingResponse, setEditingResponse] = useState<any>(null);

  useEffect(() => {
    fetchMyProposals();
  }, [user?._id]);

  const fetchMyProposals = async () => {
    if (!user?._id) return;
    
    setLoading(true);
    try {
      // Get all proposals where vendor has responded
      const proposalsResponse = await proposalsApi.getProposals({
        creatorType: 'customer',
        status: 'active'
      });
      
      if (proposalsResponse.success) {
        // Extract vendor's responses from all proposals
        const myResponses: VendorResponse[] = [];
        proposalsResponse.proposals?.forEach((proposal: any) => {
          if (proposal.responses && proposal.responses.length > 0) {
            proposal.responses.forEach((response: any) => {
              // Check if this response belongs to current vendor
              if (response.vendorId._id === user._id || response.vendorId === user._id) {
                myResponses.push({
                  _id: response._id,
                  proposalId: proposal._id,
                  proposalTitle: proposal.title,
                  proposalText: response.proposalText,
                  proposedPrice: response.proposedPrice,
                  proposedTimeline: response.proposedTimeline,
                  status: response.status || 'pending',
                  createdAt: response.createdAt,
                  updatedAt: response.updatedAt,
                  hasActiveChat: response.status === 'shortlisted' // Assume shortlisted has active chat
                });
              }
            });
          }
        });
        
        setResponses(myResponses);
      }
    } catch (error: any) {
      console.error('Error fetching my proposals:', error);
      toast.error('Failed to load your proposals');
    } finally {
      setLoading(false);
    }
  };

  const getStageForResponse = (response: VendorResponse): PipelineStage => {
    if (response.status === 'shortlisted' && response.hasActiveChat) {
      return 'activeDiscussion';
    } else if (response.status === 'shortlisted') {
      return 'shortlisted';
    } else if (response.status === 'viewed') {
      return 'read';
    }
    return 'submitted';
  };

  const handleEdit = async (responseId: string, proposalId: string) => {
    try {
      setEditingId(responseId);
      // Fetch the full proposal and response data
      const proposalResponse = await proposalsApi.getProposal(proposalId);
      
      if (proposalResponse.success && proposalResponse.proposal) {
        const proposal = proposalResponse.proposal;
        // Find the specific response
        const response = proposal.responses?.find((r: any) => r._id === responseId);
        
        if (response) {
          setEditingProposal({
            _id: proposal._id,
            title: proposal.title,
            description: proposal.description,
            category: proposal.category,
            industry: proposal.industry,
            requirements: {
              requiredFeatures: proposal.requirements?.requiredFeatures || [],
              preferredFeatures: proposal.requirements?.preferredFeatures || []
            }
          });
          
          setEditingResponse({
            _id: response._id,
            solutionId: response.solutionId,
            proposalText: response.proposalText,
            proposedPrice: response.proposedPrice,
            proposedTimeline: response.proposedTimeline,
            caseStudyLink: response.caseStudyLink,
            attachments: response.attachments || []
          });
          
          setIsEditModalOpen(true);
        } else {
          toast.error('Response not found');
        }
      } else {
        toast.error('Failed to load proposal details');
      }
    } catch (error: any) {
      console.error('Error loading proposal for edit:', error);
      toast.error('Failed to load proposal details');
    } finally {
      setEditingId(null);
    }
  };

  const handleWithdraw = (responseId: string, proposalId: string, proposalTitle: string) => {
    setProposalToWithdraw({ responseId, proposalId, proposalTitle });
    setShowWithdrawModal(true);
  };

  const confirmWithdraw = async () => {
    if (!proposalToWithdraw) return;
    
    try {
      setWithdrawingId(proposalToWithdraw.responseId);
      // TODO: Implement withdraw API call
      // await proposalsApi.withdrawResponse(proposalToWithdraw.proposalId, proposalToWithdraw.responseId);
      toast.success('Proposal withdrawn successfully');
      fetchMyProposals();
      setShowWithdrawModal(false);
      setProposalToWithdraw(null);
    } catch (error: any) {
      console.error('Error withdrawing proposal:', error);
      toast.error('Failed to withdraw proposal');
    } finally {
      setWithdrawingId(null);
    }
  };

  const handleViewProposal = (proposalId: string) => {
    router.push(`/proposals/${proposalId}`);
  };

  const handleChat = (proposalId: string, responseId: string) => {
    router.push(`/proposals/${proposalId}/chat?responseId=${responseId}`);
  };

  const groupedByStage = responses.reduce((acc: Record<PipelineStage, VendorResponse[]>, response) => {
    const stage = getStageForResponse(response);
    if (!acc[stage]) acc[stage] = [];
    acc[stage].push(response);
    return acc;
  }, {} as Record<PipelineStage, VendorResponse[]>);

  const filteredResponses = responses.filter(response => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        response.proposalTitle.toLowerCase().includes(query) ||
        response.proposalText.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'shortlisted':
        return 'bg-green-100 text-green-800';
      case 'viewed':
        return 'bg-purple-100 text-purple-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'shortlisted':
        return 'Shortlisted';
      case 'viewed':
        return 'Viewed';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Pending';
    }
  };

  return (
    <div>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredResponses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No proposals yet</h3>
          <p className="mt-1 text-sm text-gray-500">Start submitting proposals to see them here</p>
        </div>
      ) : false ? (
        /* Kanban View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STAGES.map((stage) => {
            const stageResponses = filteredResponses.filter(r => getStageForResponse(r) === stage.key);
            return (
              <div key={stage.key} className="bg-gray-50 rounded-lg p-4">
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{stage.label}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${stage.color}`}>
                    {stageResponses.length}
                  </span>
                </div>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {stageResponses.map((response) => (
                    <motion.div
                      key={response._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleViewProposal(response.proposalId)}
                    >
                      <h4 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">
                        {response.proposalTitle}
                      </h4>
                      <p className="text-xs text-gray-600 line-clamp-3 mb-3">
                        {response.proposalText}
                      </p>
                      {response.proposedPrice && (
                        <p className="text-xs font-medium text-gray-900 mb-2">
                          Price: {response.proposedPrice}
                        </p>
                      )}
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                        {response.status !== 'rejected' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(response._id, response.proposalId);
                            }}
                            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                        )}
                        {response.status === 'pending' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleWithdraw(response._id, response.proposalId, response.proposalTitle);
                            }}
                            disabled={withdrawingId === response._id}
                            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                            title="Withdraw"
                          >
                            {withdrawingId === response._id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <TrashIcon className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        {response.hasActiveChat && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleChat(response.proposalId, response._id);
                            }}
                            className="p-1.5 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                            title="Open Chat"
                          >
                            <ChatBubbleLeftRightIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {stageResponses.length === 0 && (
                    <div className="text-center py-8 text-sm text-gray-500">
                      No proposals in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResponses.map((response) => {
            const stage = getStageForResponse(response);
            return (
              <motion.div
                key={response._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden"
              >
                {/* Gradient Accent Bar */}
                <div className="h-1 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600"></div>
                
                <div className="p-6">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                        <SparklesIcon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Proposal
                      </span>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(response.status)}`}>
                      {getStatusLabel(response.status)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {response.proposalTitle}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4 min-h-[60px]">
                    {response.proposalText}
                  </p>

                  {/* Details */}
                  <div className="space-y-2 mb-4 pt-4 border-t border-gray-100">
                    {response.proposedPrice && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="font-medium">Price:</span>
                        <span>{response.proposedPrice}</span>
                      </div>
                    )}
                    {response.proposedTimeline && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <ClockIcon className="w-4 h-4 text-gray-400" />
                        <span>{response.proposedTimeline}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Submitted: {new Date(response.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewProposal(response.proposalId);
                      }}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 transition-all duration-200 text-sm font-medium"
                    >
                      View Details
                    </button>
                    {response.status !== 'rejected' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(response._id, response.proposalId);
                        }}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Edit Proposal"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                    )}
                    {response.hasActiveChat && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleChat(response.proposalId, response._id);
                        }}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Open Chat"
                      >
                        <ChatBubbleLeftRightIcon className="w-5 h-5" />
                      </button>
                    )}
                    {response.status === 'pending' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWithdraw(response._id, response.proposalId, response.proposalTitle);
                        }}
                        disabled={withdrawingId === response._id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Withdraw"
                      >
                        {withdrawingId === response._id ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                        ) : (
                          <TrashIcon className="w-5 h-5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Edit Proposal Modal */}
      {editingProposal && editingResponse && (
        <ProposalResponseModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingProposal(null);
            setEditingResponse(null);
          }}
          onSuccess={() => {
            fetchMyProposals();
            setIsEditModalOpen(false);
            setEditingProposal(null);
            setEditingResponse(null);
          }}
          proposal={editingProposal}
          existingResponse={editingResponse}
          isEditMode={true}
        />
      )}

      {/* Withdraw Confirmation Modal */}
      {proposalToWithdraw && (
        <DeleteConfirmationModal
          isOpen={showWithdrawModal}
          onClose={() => {
            setShowWithdrawModal(false);
            setProposalToWithdraw(null);
          }}
          onConfirm={confirmWithdraw}
          title="Withdraw Proposal"
          message={`Are you sure you want to withdraw your proposal for "${proposalToWithdraw.proposalTitle}"? This action cannot be undone.`}
          confirmText="Withdraw"
          cancelText="Cancel"
          loading={withdrawingId === proposalToWithdraw.responseId}
        />
      )}
    </div>
  );
};
