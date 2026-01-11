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
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

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
        <title>{proposal.title} - AstralAI</title>
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
