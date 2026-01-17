/**
 * Proposal Chat Page
 * Full-page chat interface for proposal collaboration
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/Layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { proposalsApi } from '@/lib/api';
import { ProposalChatHub } from '@/components/proposals/ProposalChatHub';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const ProposalChatPage: React.FC = () => {
  const router = useRouter();
  const { id, responseId } = router.query;
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [proposal, setProposal] = useState<any>(null);
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (id) {
      loadProposalData();
    }
  }, [id, responseId]);

  const loadProposalData = async () => {
    try {
      setLoading(true);
      const proposalResponse = await proposalsApi.getProposal(id as string);
      
      if (proposalResponse.success) {
        setProposal(proposalResponse.proposal);
        
        // Find the specific response if responseId is provided
        if (responseId && proposalResponse.proposal.responses) {
          const foundResponse = proposalResponse.proposal.responses.find(
            (r: any) => r._id === responseId
          );
          setResponse(foundResponse);
        }
      }
    } catch (error: any) {
      console.error('Error loading proposal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFulfilled = () => {
    router.push(`/proposals/${id}`);
  };

  const handleClose = () => {
    router.push(`/proposals/${id}`);
  };

  if (authLoading || loading) {
    return (
      <Layout title="Chat">
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading chat...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!proposal) {
    return (
      <Layout title="Chat Not Found">
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Chat Not Found</h1>
            <button
              onClick={() => router.push('/proposals')}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to Proposals
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const proposedSolutionTitle = response?.solutionId?.title || undefined;
  const vendorName = response?.vendorName || undefined;
  const customerName = proposal.createdBy ? `${proposal.createdBy.firstName} ${proposal.createdBy.lastName}` : undefined;

  return (
    <Layout title="Collaboration Hub">
      <Head>
        <title>Chat - {proposal.title} - AstroVault AI</title>
      </Head>

      <div className="h-screen flex flex-col bg-white">
        {/* Header with Back Button */}
        <div className="px-6 py-3 border-b border-gray-200 bg-white">
          <button
            onClick={handleClose}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Proposal
          </button>
        </div>

        {/* Chat Hub */}
        <div className="flex-1 overflow-hidden">
          <ProposalChatHub
            proposalId={id as string}
            proposalTitle={proposal.title}
            proposedSolutionTitle={proposedSolutionTitle}
            vendorName={vendorName}
            customerName={customerName}
            onClose={handleClose}
            onFulfilled={handleFulfilled}
          />
        </div>
      </div>
    </Layout>
  );
};

export default ProposalChatPage;
