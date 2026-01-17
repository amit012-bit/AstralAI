/**
 * View Proposal Modal Component
 * Displays the details of a vendor's submitted proposal in a read-only view
 */

import React, { useState, useEffect } from 'react';
import { XMarkIcon, SparklesIcon, CheckCircleIcon, DocumentIcon, LinkIcon, ClockIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { proposalsApi, solutionsApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface ViewProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposalId: string;
  vendorResponseId?: string; // Optional: if we know the specific response ID
}

interface Proposal {
  _id: string;
  title: string;
  description: string;
  category: string;
  industry: string;
  requirements: {
    requiredFeatures: string[];
    preferredFeatures: string[];
    budget?: {
      min?: number;
      max?: number;
      currency: string;
    };
    timeline?: string;
  };
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
}

interface VendorResponse {
  _id: string;
  vendorId: string | { _id: string; firstName: string; lastName: string };
  vendorName: string;
  vendorCompany?: string;
  solutionId?: string | { _id: string; title: string; shortDescription?: string };
  proposalText: string;
  proposedPrice?: string;
  proposedTimeline?: string;
  caseStudyLink?: string;
  attachments?: Array<{
    name: string;
    type: string;
    url?: string;
  }>;
  status: 'pending' | 'viewed' | 'shortlisted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

interface Solution {
  _id: string;
  title: string;
  shortDescription: string;
  description?: string;
  pricing?: {
    price: number;
    currency: string;
    billingCycle: string;
  };
}

export const ViewProposalModal: React.FC<ViewProposalModalProps> = ({
  isOpen,
  onClose,
  proposalId,
  vendorResponseId
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [vendorResponse, setVendorResponse] = useState<VendorResponse | null>(null);
  const [solution, setSolution] = useState<Solution | null>(null);

  useEffect(() => {
    if (isOpen && proposalId && user?._id) {
      fetchProposalDetails();
    }
  }, [isOpen, proposalId, user?._id]);

  const fetchProposalDetails = async () => {
    setLoading(true);
    try {
      // Fetch proposal details
      const proposalResponse = await proposalsApi.getProposal(proposalId);
      
      if (proposalResponse.success && proposalResponse.proposal) {
        setProposal(proposalResponse.proposal);
        
        // Find the vendor's response
        const responses = proposalResponse.proposal.responses || [];
        const userId = user?._id;
        
        let response: VendorResponse | null = null;
        if (vendorResponseId) {
          response = responses.find((r: any) => r._id === vendorResponseId) || null;
        } else {
          // Find response by vendor ID
          response = responses.find((r: any) => {
            const vendorId = typeof r.vendorId === 'object' ? r.vendorId._id : r.vendorId;
            return vendorId === userId;
          }) || null;
        }
        
        if (response) {
          setVendorResponse(response);
          
          // Fetch solution details if solutionId exists
          if (response.solutionId) {
            const solutionId = typeof response.solutionId === 'object' 
              ? response.solutionId._id 
              : response.solutionId;
            
            try {
              const solutionResponse = await solutionsApi.getSolution(solutionId);
              if (solutionResponse.success && solutionResponse.solution) {
                setSolution(solutionResponse.solution);
              }
            } catch (error) {
              console.error('Error fetching solution:', error);
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Error fetching proposal details:', error);
      toast.error('Failed to load proposal details');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
          className="relative bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 w-[900px] max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex-shrink-0 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white px-6 py-4 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SparklesIcon className="w-6 h-6" />
                <div>
                  <h2 className="text-2xl font-bold">Your Proposal</h2>
                  <p className="text-purple-100 text-sm mt-0.5">Problem: {proposal?.title || 'Loading...'}</p>
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

          {/* Content */}
          <div className="flex-1 overflow-hidden flex min-h-0">
            {/* Left Column: Problem Information */}
            <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 p-8 lg:p-10 flex-col justify-center relative overflow-y-auto border-r border-gray-700">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-20 h-20 bg-purple-500 rounded-lg rotate-12"></div>
                <div className="absolute top-32 right-16 w-16 h-16 bg-purple-500 rounded-lg -rotate-12"></div>
                <div className="absolute bottom-20 left-20 w-12 h-12 bg-cyan-500 rounded-lg rotate-45"></div>
              </div>

              {proposal && (
                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mr-4">
                      <SparklesIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Problem Overview</h3>
                      <p className="text-purple-200 text-sm">Understanding the Challenge</p>
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
                            <span className="text-sm font-medium text-purple-200 block mb-2">Industry:</span>
                            <span className="inline-block px-3 py-1.5 bg-purple-500/30 backdrop-blur-sm border border-purple-400/30 text-purple-100 rounded-lg text-sm font-medium">
                              {proposal.industry}
                            </span>
                          </div>
                        )}

                        {proposal.category && (
                          <div>
                            <span className="text-sm font-medium text-purple-200 block mb-2">Category:</span>
                            <span className="inline-block px-3 py-1.5 bg-purple-500/30 backdrop-blur-sm border border-purple-400/30 text-purple-100 rounded-lg text-sm font-medium">
                              {proposal.category}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {proposal.requirements.requiredFeatures && proposal.requirements.requiredFeatures.length > 0 && (
                      <div className="pt-3 border-t border-white/10">
                        <span className="text-sm font-medium text-purple-200 block mb-3">Required Features:</span>
                        <div className="flex flex-wrap gap-2">
                          {proposal.requirements.requiredFeatures.map((feature, index) => (
                            <span
                              key={index}
                              className="px-2.5 py-1 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-md text-xs"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Proposal Details */}
            <div className="w-full lg:w-3/5 overflow-y-auto bg-white">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : vendorResponse ? (
                <div className="p-6 space-y-6">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">Proposal Details</h3>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeColor(vendorResponse.status)}`}>
                      {getStatusLabel(vendorResponse.status)}
                    </span>
                  </div>

                  {/* Step A: Selected Product */}
                  {solution && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <CheckCircleIcon className="w-5 h-5 text-green-600" />
                        Step A: Selected Product
                      </h4>
                      <div className="space-y-2">
                        <p className="text-base font-medium text-gray-900">{solution.title}</p>
                        {solution.shortDescription && (
                          <p className="text-sm text-gray-600">{solution.shortDescription}</p>
                        )}
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium mt-2">
                          <CheckCircleIcon className="w-3 h-3" />
                          Verified
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step B: Custom Fit Pitch */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Step B: Custom Fit Pitch</h4>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {vendorResponse.proposalText}
                      </p>
                    </div>
                  </div>

                  {/* Step C: Proof of Capability */}
                  {(vendorResponse.caseStudyLink || (vendorResponse.attachments && vendorResponse.attachments.length > 0)) && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Step C: Proof of Capability</h4>
                      <div className="space-y-3">
                        {vendorResponse.caseStudyLink && (
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                              <LinkIcon className="w-5 h-5 text-gray-400" />
                              <span className="text-sm font-medium text-gray-700">Case Study Link:</span>
                            </div>
                            <a
                              href={vendorResponse.caseStudyLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-purple-600 hover:text-purple-800 underline break-all"
                            >
                              {vendorResponse.caseStudyLink}
                            </a>
                          </div>
                        )}
                        
                        {vendorResponse.attachments && vendorResponse.attachments.length > 0 && (
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center gap-2 mb-3">
                              <DocumentIcon className="w-5 h-5 text-gray-400" />
                              <span className="text-sm font-medium text-gray-700">Attached Documents:</span>
                            </div>
                            <div className="space-y-2">
                              {vendorResponse.attachments.map((attachment, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md"
                                >
                                  <div className="flex items-center gap-3">
                                    <DocumentIcon className="w-5 h-5 text-gray-400" />
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                                      <p className="text-xs text-gray-500">{attachment.type?.toUpperCase() || 'DOCUMENT'}</p>
                                    </div>
                                  </div>
                                  {attachment.url && (
                                    <a
                                      href={attachment.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-purple-600 hover:text-purple-800 underline"
                                    >
                                      View
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step D: Preliminary Estimate */}
                  {(vendorResponse.proposedPrice || vendorResponse.proposedTimeline) && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Step D: Preliminary Estimate</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {vendorResponse.proposedPrice && (
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                              <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
                              <span className="text-sm font-medium text-gray-700">Estimated Cost:</span>
                            </div>
                            <p className="text-base font-semibold text-gray-900">{vendorResponse.proposedPrice}</p>
                          </div>
                        )}
                        {vendorResponse.proposedTimeline && (
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                              <ClockIcon className="w-5 h-5 text-gray-400" />
                              <span className="text-sm font-medium text-gray-700">Time to Implement:</span>
                            </div>
                            <p className="text-base font-semibold text-gray-900">{vendorResponse.proposedTimeline}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Submission Info */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Submitted: {new Date(vendorResponse.createdAt).toLocaleString()}</span>
                      {vendorResponse.updatedAt !== vendorResponse.createdAt && (
                        <span>Last updated: {new Date(vendorResponse.updatedAt).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Proposal not found</h3>
                    <p className="mt-1 text-sm text-gray-500">Unable to load your proposal details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
