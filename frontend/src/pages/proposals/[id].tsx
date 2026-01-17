/**
 * Proposal Detail Page
 * Shows proposal details and allows vendors to respond
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { proposalsApi } from '@/lib/api';
import { ProposalResponseModal } from '@/components/proposals/ProposalResponseModal';
import {
  DocumentTextIcon,
  TagIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  ArrowLeftIcon,
  StarIcon,
  PaperClipIcon,
  LinkIcon,
  CheckCircleIcon,
  XMarkIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface ProposalResponse {
  _id: string;
  vendorId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  vendorName: string;
  vendorCompany: string;
  solutionId?: {
    _id: string;
    title: string;
    shortDescription: string;
  };
  proposalText: string;
  proposedPrice?: string;
  proposedTimeline?: string;
  status: 'pending' | 'viewed' | 'shortlisted' | 'rejected';
  caseStudyLink?: string;
  attachments?: Array<{
    name: string;
    type: string;
    url?: string;
  }>;
  createdAt: string;
}

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
  requirements: {
    requiredFeatures: string[];
    preferredFeatures: string[];
  };
  status: string;
  priority: string;
  responsesCount: number;
  viewsCount: number;
  responses?: ProposalResponse[];
  createdAt: string;
}

const ProposalDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [shortlistingId, setShortlistingId] = useState<string | null>(null);
  const [selectedResponseId, setSelectedResponseId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (id) {
      fetchProposal();
    }
  }, [id]);

  const fetchProposal = async () => {
    try {
      setLoading(true);
      const response = await proposalsApi.getProposal(id as string);
      if (response.success) {
        setProposal(response.proposal);
        
        // Mark responses as viewed when customer opens them
        if (user?.role === 'customer' && response.proposal.responses) {
          response.proposal.responses.forEach((resp: ProposalResponse) => {
            if (resp.status === 'pending') {
              // Update status to viewed (would be done via API in real implementation)
              markResponseAsViewed(resp._id);
            }
          });
        }
      } else {
        setError('Proposal not found');
      }
    } catch (error: any) {
      console.error('Error fetching proposal:', error);
      setError(error.response?.data?.error || 'Failed to load proposal');
    } finally {
      setLoading(false);
    }
  };

  const markResponseAsViewed = async (responseId: string) => {
    try {
      // Update status to viewed via API
      await proposalsApi.updateResponseStatus(id as string, responseId, 'viewed');
      // Refresh proposal to get updated status
      fetchProposal();
    } catch (error: any) {
      console.error('Error marking response as viewed:', error);
    }
  };

  const handleShortlist = async (responseId: string) => {
    try {
      setShortlistingId(responseId);
      await proposalsApi.updateResponseStatus(id as string, responseId, 'shortlisted');
      toast.success('Vendor shortlisted! They will be notified.');
      fetchProposal();
    } catch (error: any) {
      console.error('Error shortlisting response:', error);
      toast.error(error.response?.data?.error || 'Failed to shortlist vendor');
    } finally {
      setShortlistingId(null);
    }
  };

  const handleMessageVendor = (responseId: string) => {
    setSelectedResponseId(responseId);
    // Open chat interface (will be implemented in Phase 4)
    router.push(`/proposals/${id}/chat?responseId=${responseId}`);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
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
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading || authLoading) {
    return (
      <Layout title="Proposal Details">
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading proposal...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !proposal) {
    return (
      <Layout title="Proposal Not Found">
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Proposal Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The proposal you\'re looking for doesn\'t exist.'}</p>
            <button
              onClick={() => router.push('/proposals')}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Back to Proposals
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Proposal Details">
      <Head>
        <title>{proposal.title} - AstroVault AI</title>
      </Head>

      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <button
            onClick={() => router.push('/proposals')}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Proposals
          </button>

          {/* Proposal Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-lg shadow-sm"
          >
            <div className="p-6">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">{proposal.title}</h1>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-sm font-medium rounded ${getStatusBadgeColor(proposal.status)}`}>
                      {proposal.status.replace('_', ' ')}
                    </span>
                    <span className={`px-3 py-1 text-sm font-medium rounded ${getPriorityBadgeColor(proposal.priority)}`}>
                      {proposal.priority}
                    </span>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    <span>{proposal.createdBy.firstName} {proposal.createdBy.lastName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <EyeIcon className="w-4 h-4" />
                    <span>{proposal.viewsCount} views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                    <span>{proposal.responsesCount} responses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{new Date(proposal.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{proposal.description}</p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <TagIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Category</div>
                    <div className="font-medium text-gray-900">{proposal.category}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Industry</div>
                    <div className="font-medium text-gray-900">{proposal.industry}</div>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              {proposal.requirements.requiredFeatures.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Required Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {proposal.requirements.requiredFeatures.map((feature, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {proposal.requirements.preferredFeatures.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Preferred Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {proposal.requirements.preferredFeatures.map((feature, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Respond Button - Only for vendors on customer proposals */}
              {user?.role === 'vendor' && proposal.creatorType === 'customer' && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowResponseModal(true)}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                    Respond with Your Solution
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Vendor Responses Section - For Customers */}
          {user?.role === 'customer' && proposal.creatorType === 'customer' && proposal.responses && proposal.responses.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8"
            >
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Incoming Proposals</h2>
                <p className="text-sm text-gray-600 mt-1">{proposal.responses.length} vendor response{proposal.responses.length !== 1 ? 's' : ''}</p>
              </div>

              <div className="space-y-4">
                {proposal.responses.map((response: ProposalResponse) => (
                  <motion.div
                    key={response._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="p-6">
                      {/* Response Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{response.vendorCompany || response.vendorName}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              response.status === 'shortlisted' ? 'bg-green-100 text-green-800' :
                              response.status === 'viewed' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {response.status === 'shortlisted' ? 'Shortlisted' :
                               response.status === 'viewed' ? 'Viewed' : 'Pending Review'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {response.vendorName} • {new Date(response.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Linked Solution */}
                      {response.solutionId && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs font-medium text-blue-900 mb-1">Linked Solution</p>
                          <p className="font-semibold text-blue-900">{response.solutionId.title}</p>
                          <p className="text-sm text-blue-700 mt-1">{response.solutionId.shortDescription}</p>
                        </div>
                      )}

                      {/* Proposal Text */}
                      <div className="mb-4">
                        <p className="text-gray-700 whitespace-pre-wrap">{response.proposalText}</p>
                      </div>

                      {/* Price and Timeline */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {response.proposedPrice && (
                          <div className="flex items-center gap-2 text-sm">
                            <CurrencyDollarIcon className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">Price: </span>
                            <span className="text-gray-700">{response.proposedPrice}</span>
                          </div>
                        )}
                        {response.proposedTimeline && (
                          <div className="flex items-center gap-2 text-sm">
                            <ClockIcon className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">Timeline: </span>
                            <span className="text-gray-700">{response.proposedTimeline}</span>
                          </div>
                        )}
                      </div>

                      {/* Attachments */}
                      {response.caseStudyLink && (
                        <div className="mb-4">
                          <a
                            href={response.caseStudyLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                          >
                            <LinkIcon className="w-4 h-4" />
                            View Case Study
                          </a>
                        </div>
                      )}

                      {response.attachments && response.attachments.length > 0 && (
                        <div className="mb-4 flex flex-wrap gap-2">
                          {response.attachments.map((attachment, idx) => (
                            <div
                              key={idx}
                              className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-md text-sm text-gray-700"
                            >
                              <PaperClipIcon className="w-4 h-4" />
                              {attachment.name}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                        {response.status !== 'shortlisted' && (
                          <button
                            onClick={() => handleShortlist(response._id)}
                            disabled={shortlistingId === response._id}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <StarIcon className="w-4 h-4" />
                            {shortlistingId === response._id ? 'Shortlisting...' : 'Shortlist'}
                          </button>
                        )}
                        {response.status === 'shortlisted' && (
                          <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-md">
                            <CheckCircleIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">Shortlisted</span>
                          </div>
                        )}
                        <button
                          onClick={() => handleMessageVendor(response._id)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          <EnvelopeIcon className="w-4 h-4" />
                          Message Vendor
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Response Modal */}
      {proposal && (
        <ProposalResponseModal
          isOpen={showResponseModal}
          onClose={() => setShowResponseModal(false)}
          onSuccess={() => {
            fetchProposal();
            setShowResponseModal(false);
          }}
          proposal={proposal}
        />
      )}
    </Layout>
  );
};

export default ProposalDetailPage;
