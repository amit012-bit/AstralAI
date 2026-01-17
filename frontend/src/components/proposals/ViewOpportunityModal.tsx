/**
 * View Opportunity Modal Component
 * Displays the full details of a customer's proposal/opportunity in a two-column view
 */

import React, { useState, useEffect } from 'react';
import { XMarkIcon, SparklesIcon, TagIcon, CurrencyDollarIcon, ClockIcon, UserIcon, CheckCircleIcon, DocumentTextIcon, BuildingOfficeIcon, CalendarIcon, EyeIcon } from '@heroicons/react/24/outline';
import { proposalsApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

interface ViewOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposalId: string;
}

interface Proposal {
  _id: string;
  title: string;
  description: string;
  category: string;
  industry: string;
  status: string;
  priority: string;
  viewsCount: number;
  responsesCount: number;
  requirements: {
    requiredFeatures?: string[];
    preferredFeatures?: string[];
    budget?: {
      min?: number;
      max?: number;
      currency: string;
    };
    timeline?: string;
    dataType?: string;
    compliance?: string[];
  };
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
  createdAt: string;
  publishedAt?: string;
  expiresAt?: string;
  responses?: Array<{
    _id: string;
    vendorId: string | { _id: string; firstName: string; lastName: string };
    vendorName: string;
    vendorCompany?: string;
    solutionId?: string | { _id: string; title: string; shortDescription?: string };
    proposalText: string;
    proposedPrice?: string;
    proposedTimeline?: string;
    status: 'pending' | 'viewed' | 'shortlisted' | 'rejected';
    createdAt: string;
  }>;
}

export const ViewOpportunityModal: React.FC<ViewOpportunityModalProps> = ({
  isOpen,
  onClose,
  proposalId
}) => {
  const [loading, setLoading] = useState(true);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [responses, setResponses] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && proposalId) {
      fetchProposalDetails();
    }
  }, [isOpen, proposalId]);

  const fetchProposalDetails = async () => {
    setLoading(true);
    try {
      const proposalResponse = await proposalsApi.getProposal(proposalId);
      
      if (proposalResponse.success && proposalResponse.proposal) {
        const proposalData = proposalResponse.proposal;
        setProposal(proposalData);
        
        // Extract and set responses
        if (proposalData.responses && Array.isArray(proposalData.responses)) {
          setResponses(proposalData.responses);
        } else {
          setResponses([]);
        }
      } else {
        toast.error('Failed to load proposal details');
      }
    } catch (error: any) {
      console.error('Error fetching proposal details:', error);
      toast.error('Failed to load proposal details');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal - Fixed size, centered */}
      <div className="flex min-h-full items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-[900px] max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex-shrink-0 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white px-6 py-4 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SparklesIcon className="w-6 h-6" />
                <div>
                  <h2 className="text-2xl font-bold">Opportunity Details</h2>
                  <p className="text-purple-100 text-sm mt-0.5">{proposal?.title || 'Loading...'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-white hover:text-purple-100 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content - Two Column Layout */}
          <div className="flex-1 overflow-hidden flex min-h-0">
            {/* Left Column: Problem Overview - Signin Style */}
            <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 p-8 lg:p-10 flex-col justify-center relative overflow-y-auto border-r border-gray-700">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500 rounded-lg rotate-12"></div>
                <div className="absolute top-32 right-16 w-16 h-16 bg-purple-500 rounded-lg -rotate-12"></div>
                <div className="absolute bottom-20 left-20 w-12 h-12 bg-cyan-500 rounded-lg rotate-45"></div>
                <div className="absolute bottom-32 right-10 w-14 h-14 bg-pink-500 rounded-lg -rotate-45"></div>
              </div>
              
              {loading ? (
                <div className="relative z-10 text-white text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                  <p className="mt-4 text-gray-300">Loading details...</p>
                </div>
              ) : proposal ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="relative z-10"
                >
                  {/* Problem Overview Card */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
                        <SparklesIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Problem Overview</h3>
                        <p className="text-blue-200 text-sm">Understanding the Challenge</p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <span className="text-sm font-medium text-purple-200 block mb-2">Goal:</span>
                        <p className="text-lg font-medium text-white leading-relaxed">{proposal.title}</p>
                      </div>

                      <div>
                        <span className="text-sm font-medium text-purple-200 block mb-2">Description:</span>
                        <p className="text-gray-300 leading-relaxed">{proposal.description}</p>
                      </div>

                      {(proposal.industry || proposal.category) && (
                        <div className="grid grid-cols-2 gap-4">
                          {proposal.industry && (
                            <div>
                              <span className="text-sm font-medium text-purple-200 block mb-1">Industry:</span>
                              <span className="text-white">{proposal.industry}</span>
                            </div>
                          )}
                          {proposal.category && (
                            <div>
                              <span className="text-sm font-medium text-purple-200 block mb-1">Category:</span>
                              <span className="text-white">{proposal.category}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {proposal.requirements?.requiredFeatures && proposal.requirements.requiredFeatures.length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-purple-200 block mb-2">Required Features:</span>
                          <ul className="space-y-1">
                            {proposal.requirements.requiredFeatures.slice(0, 3).map((feature, idx) => (
                              <li key={idx} className="text-gray-300 text-sm flex items-start">
                                <CheckCircleIcon className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                            {proposal.requirements.requiredFeatures.length > 3 && (
                              <li className="text-gray-400 text-sm">
                                +{proposal.requirements.requiredFeatures.length - 3} more
                              </li>
                            )}
                          </ul>
                        </div>
                      )}

                      {/* Posted By */}
                      <div className="pt-4 border-t border-white/20">
                        <div className="flex items-center gap-2 mb-2">
                          <UserIcon className="w-4 h-4 text-purple-200" />
                          <span className="text-sm font-medium text-purple-200">Posted By</span>
                        </div>
                        <p className="text-white text-sm">
                          {proposal.createdBy.firstName} {proposal.createdBy.lastName}
                        </p>
                        {proposal.createdBy.email && (
                          <p className="text-gray-400 text-xs mt-1">{proposal.createdBy.email}</p>
                        )}
                      </div>


                      {/* Dates */}
                      <div className="pt-4 border-t border-white/20 flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-purple-200" />
                          <div>
                            <span className="text-purple-200 block">Posted:</span>
                            <span className="text-white">
                              {proposal.publishedAt 
                                ? new Date(proposal.publishedAt).toLocaleDateString()
                                : new Date(proposal.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {proposal.expiresAt && (
                          <div className="flex items-center gap-2">
                            <ClockIcon className="w-4 h-4 text-purple-200" />
                            <div>
                              <span className="text-purple-200 block">Expires:</span>
                              <span className="text-white">
                                {new Date(proposal.expiresAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </div>

            {/* Right Column: Proposed Solutions */}
            <div className="flex-1 overflow-hidden bg-gray-50 p-4 flex flex-col">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading details...</p>
                  </div>
                </div>
              ) : proposal ? (
                <>
                  {/* Header with Views and Responses */}
                  <div className="flex-shrink-0 bg-white rounded-lg p-3 border border-gray-200 mb-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5 text-purple-600" />
                        Proposed Solutions
                      </h3>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1.5 mb-1">
                            <EyeIcon className="w-4 h-4 text-purple-600" />
                            <p className="text-xs text-gray-500">Views</p>
                          </div>
                          <p className="text-lg font-bold text-purple-600">{proposal.viewsCount || 0}</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1.5 mb-1">
                            <CheckCircleIcon className="w-4 h-4 text-purple-600" />
                            <p className="text-xs text-gray-500">Responses</p>
                          </div>
                          <p className="text-lg font-bold text-purple-600">{proposal.responsesCount || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Solutions List */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-2">

                  {/* Proposed Solutions List */}
                  {responses.length > 0 ? (
                    <div className="space-y-3">
                      {responses.map((response: any) => {
                        const vendorName = typeof response.vendorId === 'object' 
                          ? `${response.vendorId.firstName} ${response.vendorId.lastName}`
                          : response.vendorName || 'Unknown Vendor';
                        const solutionTitle = typeof response.solutionId === 'object'
                          ? response.solutionId.title
                          : 'Custom Solution';
                        const solutionDescription = typeof response.solutionId === 'object'
                          ? response.solutionId.shortDescription || ''
                          : '';

                        return (
                          <div key={response._id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                            {/* Vendor Info */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <BuildingOfficeIcon className="w-4 h-4 text-purple-600" />
                                <span className="text-sm font-medium text-gray-900">{vendorName}</span>
                                {response.vendorCompany && (
                                  <span className="text-xs text-gray-500">• {response.vendorCompany}</span>
                                )}
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                response.status === 'shortlisted' ? 'bg-green-100 text-green-800' :
                                response.status === 'viewed' ? 'bg-blue-100 text-blue-800' :
                                response.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {response.status || 'Pending'}
                              </span>
                            </div>

                            {/* Solution Info */}
                            <div className="mb-3">
                              <h4 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
                                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                {solutionTitle}
                              </h4>
                              {solutionDescription && (
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{solutionDescription}</p>
                              )}
                            </div>

                            {/* Proposal Text */}
                            <div className="mb-3">
                              <p className="text-sm text-gray-700 line-clamp-3">{response.proposalText}</p>
                            </div>

                            {/* Price and Timeline */}
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              {response.proposedPrice && (
                                <div className="flex items-center gap-1.5">
                                  <CurrencyDollarIcon className="w-4 h-4 text-purple-600" />
                                  <div>
                                    <span className="text-gray-500 block">Price:</span>
                                    <span className="text-gray-900 font-medium">{response.proposedPrice}</span>
                                  </div>
                                </div>
                              )}
                              {response.proposedTimeline && (
                                <div className="flex items-center gap-1.5">
                                  <ClockIcon className="w-4 h-4 text-purple-600" />
                                  <div>
                                    <span className="text-gray-500 block">Timeline:</span>
                                    <span className="text-gray-900 font-medium">{response.proposedTimeline}</span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Submitted Date */}
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <span className="text-xs text-gray-500">
                                Submitted: {new Date(response.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg p-8 border border-gray-200 text-center">
                      <SparklesIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No proposals submitted yet</p>
                      <p className="text-gray-400 text-xs mt-1">Be the first to submit a solution</p>
                    </div>
                  )}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
