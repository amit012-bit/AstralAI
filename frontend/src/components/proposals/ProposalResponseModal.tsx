/**
 * Proposal Response Modal Component
 * Interactive and collaborative interface for vendors to submit solutions to proposals
 */

import React, { useState, useEffect } from 'react';
import { XMarkIcon, SparklesIcon, CheckCircleIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { proposalsApi, solutionsApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface ProposalResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  proposal: {
    _id: string;
    title: string;
    description: string;
    category: string;
    industry: string;
    requirements: {
      requiredFeatures: string[];
      preferredFeatures: string[];
    };
  };
}

interface Solution {
  _id: string;
  title: string;
  shortDescription: string;
  category: string;
  pricing?: {
    price: number;
    currency: string;
    billingCycle: string;
  };
}

interface ResponseFormData {
  solutionId: string;
  proposalText: string;
  proposedPrice: string;
  proposedTimeline: string;
  useExistingSolution: boolean;
  createNewSolution: boolean;
}

export const ProposalResponseModal: React.FC<ProposalResponseModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  proposal
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [solutionsLoading, setSolutionsLoading] = useState(false);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'existing' | 'new'>('existing');
  
  const [formData, setFormData] = useState<ResponseFormData>({
    solutionId: '',
    proposalText: '',
    proposedPrice: '',
    proposedTimeline: '',
    useExistingSolution: true,
    createNewSolution: false
  });

  // Fetch vendor's solutions
  useEffect(() => {
    if (isOpen && user?._id) {
      fetchVendorSolutions();
    }
  }, [isOpen, user?._id]);

  const fetchVendorSolutions = async () => {
    setSolutionsLoading(true);
    try {
      const response = await solutionsApi.getSolutions({
        vendorId: user?._id,
        limit: 100,
        category: proposal.category // Filter by proposal category
      });
      setSolutions(response.solutions || []);
    } catch (error: any) {
      console.error('Error fetching solutions:', error);
      toast.error('Failed to load your solutions');
    } finally {
      setSolutionsLoading(false);
    }
  };

  const handleChange = (field: keyof ResponseFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSolutionSelect = (solutionId: string) => {
    const selectedSolution = solutions.find(s => s._id === solutionId);
    setFormData(prev => ({
      ...prev,
      solutionId,
      proposedPrice: selectedSolution?.pricing?.price?.toString() || '',
      proposalText: prev.proposalText || `I'd like to offer our ${selectedSolution?.title} solution for this proposal. This solution addresses your requirements and provides excellent value.`
    }));
  };

  const filteredSolutions = solutions.filter(solution =>
    solution.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    solution.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (selectedTab === 'existing' && !formData.solutionId) {
      toast.error('Please select a solution');
      return;
    }
    if (!formData.proposalText.trim()) {
      toast.error('Please provide a proposal description');
      return;
    }

    setLoading(true);
    try {
      const responseData: any = {
        proposalText: formData.proposalText.trim(),
      };

      if (selectedTab === 'existing' && formData.solutionId) {
        responseData.solutionId = formData.solutionId;
      }

      if (formData.proposedPrice.trim()) {
        responseData.proposedPrice = formData.proposedPrice.trim();
      }

      if (formData.proposedTimeline.trim()) {
        responseData.proposedTimeline = formData.proposedTimeline.trim();
      }

      const response = await proposalsApi.addResponse(proposal._id, responseData);
      
      if (response.success) {
        toast.success('Response submitted successfully!');
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          solutionId: '',
          proposalText: '',
          proposedPrice: '',
          proposedTimeline: '',
          useExistingSolution: true,
          createNewSolution: false
        });
        setSelectedTab('existing');
        setSearchQuery('');
      }
    } catch (error: any) {
      console.error('Error submitting response:', error);
      toast.error(error.response?.data?.error || error.message || 'Failed to submit response');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedSolution = solutions.find(s => s._id === formData.solutionId);

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
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SparklesIcon className="w-6 h-6" />
                <div>
                  <h2 className="text-2xl font-bold">Submit Your Solution</h2>
                  <p className="text-blue-100 text-sm mt-0.5">Help solve: {proposal.title}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-blue-100 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Proposal Requirements Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Proposal Requirements</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <div>
                    <span className="font-medium">Category:</span> {proposal.category}
                  </div>
                  <div>
                    <span className="font-medium">Industry:</span> {proposal.industry}
                  </div>
                  {proposal.requirements.requiredFeatures.length > 0 && (
                    <div>
                      <span className="font-medium">Required Features:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {proposal.requirements.requiredFeatures.map((feature, index) => (
                          <span key={index} className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tab Selection */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTab('existing');
                      handleChange('useExistingSolution', true);
                      handleChange('createNewSolution', false);
                    }}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      selectedTab === 'existing'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Use Existing Solution
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTab('new');
                      handleChange('useExistingSolution', false);
                      handleChange('createNewSolution', true);
                    }}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      selectedTab === 'new'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Create New Solution
                  </button>
                </nav>
              </div>

              {/* Solution Selection/Creation */}
              <AnimatePresence mode="wait">
                {selectedTab === 'existing' ? (
                  <motion.div
                    key="existing"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    {/* Search */}
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search your solutions..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Solutions List */}
                    {solutionsLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : filteredSolutions.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                        <SparklesIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No solutions found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {searchQuery ? 'Try a different search term' : 'You haven\'t created any solutions yet'}
                        </p>
                        {!searchQuery && (
                          <button
                            type="button"
                            onClick={() => setSelectedTab('new')}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                          >
                            <PlusIcon className="w-5 h-5" />
                            Create Your First Solution
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                        {filteredSolutions.map((solution) => (
                          <motion.div
                            key={solution._id}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => handleSolutionSelect(solution._id)}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              formData.solutionId === solution._id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-gray-900">{solution.title}</h4>
                                  {formData.solutionId === solution._id && (
                                    <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {solution.shortDescription}
                                </p>
                                {solution.pricing?.price && (
                                  <div className="mt-2 text-sm font-medium text-gray-700">
                                    ${solution.pricing.price}/{solution.pricing.billingCycle}
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="new"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <SparklesIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Create a New Solution</h3>
                    <p className="mt-1 text-sm text-gray-500 mb-4">
                      You can create a new solution from your vendor dashboard
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        window.location.href = '/vendor';
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                    >
                      <PlusIcon className="w-5 h-5" />
                      Go to My Vault
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Selected Solution Info */}
              {selectedSolution && selectedTab === 'existing' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-green-50 border border-green-200 rounded-lg p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-900">Selected Solution</span>
                  </div>
                  <p className="text-sm text-green-800">{selectedSolution.title}</p>
                </motion.div>
              )}

              {/* Proposal Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Proposal <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.proposalText}
                  onChange={(e) => handleChange('proposalText', e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe how your solution addresses the proposal requirements. Explain key benefits, implementation approach, and value proposition..."
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.proposalText.length}/5000 characters
                </p>
              </div>

              {/* Price and Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proposed Price (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.proposedPrice}
                    onChange={(e) => handleChange('proposedPrice', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., $10,000 or Custom pricing"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proposed Timeline (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.proposedTimeline}
                    onChange={(e) => handleChange('proposedTimeline', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 2-3 months"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-5 h-5" />
                      Submit Solution
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
