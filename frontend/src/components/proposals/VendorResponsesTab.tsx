/**
 * Vendor Responses Tab Component (Customer View)
 * Features:
 * - Response Inbox: List of all proposals received, grouped by Posting
 * - Quick Compare: Side-by-side view of 2-3 vendor proposals
 * - Engagement Actions: Shortlist, Initiate Chat, Decline
 */

import React, { useState, useEffect } from 'react';
import { 
  EnvelopeIcon, 
  StarIcon, 
  XMarkIcon, 
  ChatBubbleLeftRightIcon,
  EyeIcon,
  LinkIcon,
  PaperClipIcon,
  CheckCircleIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';
import { proposalsApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';

interface ProposalResponse {
  _id: string;
  proposalId: string;
  proposalTitle: string;
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

interface VendorResponsesTabProps {
  searchQuery: string;
  filters: any;
}

export const VendorResponsesTab: React.FC<VendorResponsesTabProps> = ({ searchQuery, filters }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [responses, setResponses] = useState<ProposalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [shortlistingId, setShortlistingId] = useState<string | null>(null);

  useEffect(() => {
    fetchVendorResponses();
  }, [user?._id]);

  const fetchVendorResponses = async () => {
    if (!user?._id) return;
    
    setLoading(true);
    try {
      // Get all customer proposals with responses
      const proposalsResponse = await proposalsApi.getProposals({
        createdBy: user._id,
        creatorType: 'customer'
      });
      
      if (proposalsResponse.success) {
        // Flatten responses with proposal info
        const allResponses: ProposalResponse[] = [];
        proposalsResponse.proposals?.forEach((proposal: any) => {
          if (proposal.responses && proposal.responses.length > 0) {
            proposal.responses.forEach((response: any) => {
              allResponses.push({
                ...response,
                proposalId: proposal._id,
                proposalTitle: proposal.title
              });
            });
          }
        });
        
        // Group by proposal
        setResponses(allResponses);
      }
    } catch (error: any) {
      console.error('Error fetching vendor responses:', error);
      toast.error('Failed to load vendor responses');
    } finally {
      setLoading(false);
    }
  };

  const handleShortlist = async (responseId: string, proposalId: string) => {
    try {
      setShortlistingId(responseId);
      await proposalsApi.updateResponseStatus(proposalId, responseId, 'shortlisted');
      toast.success('Vendor shortlisted! They will be notified.');
      fetchVendorResponses();
    } catch (error: any) {
      console.error('Error shortlisting response:', error);
      toast.error(error.response?.data?.error || 'Failed to shortlist vendor');
    } finally {
      setShortlistingId(null);
    }
  };

  const handleDecline = async (responseId: string, proposalId: string) => {
    if (!confirm('Are you sure you want to decline this vendor proposal?')) return;
    
    try {
      await proposalsApi.updateResponseStatus(proposalId, responseId, 'rejected');
      toast.success('Proposal declined');
      fetchVendorResponses();
    } catch (error: any) {
      console.error('Error declining response:', error);
      toast.error('Failed to decline proposal');
    }
  };

  const handleMessageVendor = (responseId: string, proposalId: string) => {
    router.push(`/proposals/${proposalId}/chat?responseId=${responseId}`);
  };

  const toggleCompare = (responseId: string) => {
    if (selectedForCompare.includes(responseId)) {
      setSelectedForCompare(selectedForCompare.filter(id => id !== responseId));
    } else {
      if (selectedForCompare.length < 3) {
        setSelectedForCompare([...selectedForCompare, responseId]);
      } else {
        toast.error('You can compare up to 3 proposals at once');
      }
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'shortlisted':
        return 'bg-green-100 text-green-800';
      case 'viewed':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Group responses by proposal
  const groupedResponses = responses.reduce((acc: Record<string, ProposalResponse[]>, response) => {
    if (!acc[response.proposalId]) {
      acc[response.proposalId] = [];
    }
    acc[response.proposalId].push(response);
    return acc;
  }, {});

  const filteredResponses = responses.filter(response => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        response.vendorName.toLowerCase().includes(query) ||
        response.vendorCompany.toLowerCase().includes(query) ||
        response.proposalText.toLowerCase().includes(query) ||
        response.proposalTitle.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const selectedResponses = filteredResponses.filter(r => selectedForCompare.includes(r._id));

  return (
    <div>
      {/* Header with Compare Toggle */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vendor Responses</h2>
          <p className="text-sm text-gray-600 mt-1">Review and compare vendor proposals for your needs</p>
        </div>
        <button
          onClick={() => setCompareMode(!compareMode)}
          className={`px-4 py-2 rounded-lg border transition-colors ${
            compareMode
              ? 'bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white border-purple-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          {compareMode ? 'Exit Compare' : 'Quick Compare'}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredResponses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <EnvelopeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No vendor responses yet</h3>
          <p className="mt-1 text-sm text-gray-500">Vendors will appear here when they respond to your postings</p>
        </div>
      ) : compareMode && selectedResponses.length > 0 ? (
        /* Quick Compare View - Side by Side */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedResponses.map((response) => (
            <motion.div
              key={response._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border-2 border-blue-200 rounded-lg shadow-lg p-6"
            >
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-1">{response.vendorCompany || response.vendorName}</h4>
                <p className="text-sm text-gray-600">For: {response.proposalTitle}</p>
              </div>
              
              {response.solutionId && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs font-medium text-blue-900 mb-1">Linked Solution</p>
                  <p className="font-semibold text-blue-900">{response.solutionId.title}</p>
                </div>
              )}
              
              <p className="text-sm text-gray-700 mb-4 line-clamp-6">{response.proposalText}</p>
              
              {response.proposedPrice && (
                <p className="text-sm font-medium text-gray-900 mb-2">Price: {response.proposedPrice}</p>
              )}
              {response.proposedTimeline && (
                <p className="text-sm text-gray-600 mb-4">Timeline: {response.proposedTimeline}</p>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        /* Response Inbox - Grouped by Posting */
        <div className="space-y-8">
          {Object.entries(groupedResponses).map(([proposalId, proposalResponses]) => (
            <div key={proposalId} className="bg-white border border-gray-200 rounded-lg shadow-sm">
              {/* Proposal Header */}
              <div className="p-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                <h3 className="font-semibold text-gray-900">{proposalResponses[0].proposalTitle}</h3>
                <p className="text-sm text-gray-600 mt-1">{proposalResponses.length} response{proposalResponses.length !== 1 ? 's' : ''}</p>
              </div>
              
              {/* Responses */}
              <div className="p-4 space-y-4">
                {proposalResponses.map((response) => (
                  <motion.div
                    key={response._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 border rounded-lg ${
                      response.status === 'shortlisted' ? 'border-green-300 bg-green-50' :
                      response.status === 'rejected' ? 'border-gray-200 bg-gray-50 opacity-60' :
                      'border-gray-200 bg-white'
                    }`}
                  >
                    {/* Response Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-semibold text-gray-900">{response.vendorCompany || response.vendorName}</h4>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadgeColor(response.status)}`}>
                            {response.status === 'shortlisted' ? 'Shortlisted' :
                             response.status === 'viewed' ? 'Viewed' :
                             response.status === 'rejected' ? 'Declined' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{response.vendorName}</p>
                      </div>
                      {compareMode && (
                        <button
                          onClick={() => toggleCompare(response._id)}
                          className={`p-2 rounded-lg border ${
                            selectedForCompare.includes(response._id)
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {selectedForCompare.includes(response._id) ? 'Selected' : 'Select'}
                        </button>
                      )}
                    </div>

                    {/* Linked Solution */}
                    {response.solutionId && (
                      <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs font-medium text-blue-900 mb-1">Linked Solution</p>
                        <p className="font-semibold text-blue-900">{response.solutionId.title}</p>
                        <p className="text-sm text-blue-700 mt-1">{response.solutionId.shortDescription}</p>
                      </div>
                    )}

                    {/* Proposal Text */}
                    <p className="text-sm text-gray-700 mb-3 whitespace-pre-wrap line-clamp-4">{response.proposalText}</p>

                    {/* Price and Timeline */}
                    {(response.proposedPrice || response.proposedTimeline) && (
                      <div className="flex gap-4 mb-3 text-sm">
                        {response.proposedPrice && (
                          <span className="font-medium text-gray-900">Price: {response.proposedPrice}</span>
                        )}
                        {response.proposedTimeline && (
                          <span className="text-gray-600">Timeline: {response.proposedTimeline}</span>
                        )}
                      </div>
                    )}

                    {/* Attachments */}
                    {response.caseStudyLink && (
                      <div className="mb-3">
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
                      <div className="mb-3 flex flex-wrap gap-2">
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

                    {/* Engagement Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                      {response.status !== 'shortlisted' && response.status !== 'rejected' && (
                        <button
                          onClick={() => handleShortlist(response._id, response.proposalId)}
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
                        onClick={() => handleMessageVendor(response._id, response.proposalId)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white rounded-md hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 transition-colors"
                      >
                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                        Initiate Chat
                      </button>
                      {response.status !== 'rejected' && (
                        <button
                          onClick={() => handleDecline(response._id, response.proposalId)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                        >
                          <XMarkIcon className="w-4 h-4" />
                          Decline
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
