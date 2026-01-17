/**
 * Proposal Response Modal Component
 * Interactive and collaborative interface for vendors to submit solutions to proposals
 */

import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon, SparklesIcon, CheckCircleIcon, PlusIcon, MagnifyingGlassIcon, PaperClipIcon, DocumentIcon, LinkIcon } from '@heroicons/react/24/outline';
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
  existingResponse?: {
    _id: string;
    solutionId?: string | { _id: string };
    proposalText: string;
    proposedPrice?: string;
    proposedTimeline?: string;
    caseStudyLink?: string;
    attachments?: Array<{
      name: string;
      type: string;
      url?: string;
    }>;
  };
  isEditMode?: boolean;
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

interface AttachedFile {
  id: string;
  name: string;
  type: 'pdf' | 'link' | 'document';
  url?: string;
  file?: File;
}

interface ResponseFormData {
  solutionId: string;
  proposalText: string;
  proposedPrice: string;
  proposedTimeline: string;
  useExistingSolution: boolean;
  createNewSolution: boolean;
  attachments: AttachedFile[];
  caseStudyLink: string;
}

export const ProposalResponseModal: React.FC<ProposalResponseModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  proposal,
  existingResponse,
  isEditMode = false
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [solutionsLoading, setSolutionsLoading] = useState(false);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [selectedTab, setSelectedTab] = useState<'existing' | 'new'>('existing');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1); // Two-page workflow
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState<ResponseFormData>({
    solutionId: '',
    proposalText: '',
    proposedPrice: '',
    proposedTimeline: '',
    useExistingSolution: true,
    createNewSolution: false,
    attachments: [],
    caseStudyLink: ''
  });

  // Store original form data for comparison in edit mode
  const [originalFormData, setOriginalFormData] = useState<ResponseFormData | null>(null);

  // Fetch vendor's solutions
  useEffect(() => {
    if (isOpen && user?._id) {
      fetchVendorSolutions();
    }
  }, [isOpen, user?._id]);

  // Pre-fill form when in edit mode
  useEffect(() => {
    if (isOpen && isEditMode && existingResponse) {
      const solutionId = typeof existingResponse.solutionId === 'object' 
        ? existingResponse.solutionId._id 
        : existingResponse.solutionId || '';
      
      const initialFormData: ResponseFormData = {
        solutionId: solutionId,
        proposalText: existingResponse.proposalText || '',
        proposedPrice: existingResponse.proposedPrice || '',
        proposedTimeline: existingResponse.proposedTimeline || '',
        useExistingSolution: true,
        createNewSolution: false,
        attachments: existingResponse.attachments?.map(att => ({
          id: Date.now().toString() + Math.random(),
          name: att.name,
          type: att.type === 'pdf' ? 'pdf' : 'document',
          url: att.url
        })) || [],
        caseStudyLink: existingResponse.caseStudyLink || ''
      };
      
      setFormData(initialFormData);
      // Store original data for comparison
      setOriginalFormData(JSON.parse(JSON.stringify(initialFormData)));
    } else if (isOpen && !isEditMode) {
      // Reset form when opening in create mode
      setFormData({
        solutionId: '',
        proposalText: '',
        proposedPrice: '',
        proposedTimeline: '',
        useExistingSolution: true,
        createNewSolution: false,
        attachments: [],
        caseStudyLink: ''
      });
      setOriginalFormData(null);
      setCurrentStep(1);
    }
  }, [isOpen, isEditMode, existingResponse]);

  // Check if form data has changed (for edit mode)
  const hasChanges = (): boolean => {
    if (!isEditMode || !originalFormData) {
      return true; // Always enabled in create mode
    }

    // Compare solutionId
    if (formData.solutionId !== originalFormData.solutionId) {
      return true;
    }

    // Compare proposalText
    if (formData.proposalText.trim() !== originalFormData.proposalText.trim()) {
      return true;
    }

    // Compare proposedPrice
    if ((formData.proposedPrice || '').trim() !== (originalFormData.proposedPrice || '').trim()) {
      return true;
    }

    // Compare proposedTimeline
    if ((formData.proposedTimeline || '').trim() !== (originalFormData.proposedTimeline || '').trim()) {
      return true;
    }

    // Compare caseStudyLink
    if ((formData.caseStudyLink || '').trim() !== (originalFormData.caseStudyLink || '').trim()) {
      return true;
    }

    // Compare attachments (by count and names)
    if (formData.attachments.length !== originalFormData.attachments.length) {
      return true;
    }

    // Compare attachment names (ignoring IDs which are generated)
    const currentAttachmentNames = formData.attachments.map(a => a.name).sort();
    const originalAttachmentNames = originalFormData.attachments.map(a => a.name).sort();
    if (JSON.stringify(currentAttachmentNames) !== JSON.stringify(originalAttachmentNames)) {
      return true;
    }

    return false;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setSearchQuery('');
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const fetchVendorSolutions = async () => {
    setSolutionsLoading(true);
    try {
      const response = await solutionsApi.getSolutions({
        vendorId: user?._id,
        limit: 100
        // Removed category filter to show all solutions from My Vault
      } as any);
      setSolutions(response.solutions || []);
    } catch (error: any) {
      console.error('Error fetching solutions:', error);
      // Silently fail - don't show error toast when modal opens
      // User can still proceed without solutions in their portfolio
      setSolutions([]);
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
    // Safely extract price - handle both number and string types
    let priceString = '';
    if (selectedSolution?.pricing?.price) {
      const price = selectedSolution.pricing.price;
      if (typeof price === 'number') {
        priceString = price.toString();
      } else if (typeof price === 'string') {
        priceString = price;
      } else if (typeof price === 'object' && price !== null) {
        // If price is an object, try to extract a value or use empty string
        priceString = '';
      }
    }
    
    setFormData(prev => ({
      ...prev,
      solutionId,
      proposedPrice: priceString,
      proposalText: prev.proposalText || `I'd like to offer our ${selectedSolution?.title} solution for this proposal. This solution addresses your requirements and provides excellent value.`
    }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
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

      // Ensure proposedPrice is a string before sending
      if (formData.proposedPrice) {
        const priceStr = typeof formData.proposedPrice === 'string' 
          ? formData.proposedPrice.trim() 
          : String(formData.proposedPrice).trim();
        if (priceStr && priceStr !== '[object Object]') {
          responseData.proposedPrice = priceStr;
        }
      }

      if (formData.proposedTimeline.trim()) {
        responseData.proposedTimeline = formData.proposedTimeline.trim();
      }

      // Add case study link and attachments
      if (formData.caseStudyLink.trim()) {
        responseData.caseStudyLink = formData.caseStudyLink.trim();
      }
      if (formData.attachments.length > 0) {
        responseData.attachments = formData.attachments.map(a => ({
          name: a.name,
          type: a.type,
          url: a.url
        }));
      }

      let response;
      if (isEditMode && existingResponse) {
        // Update existing response
        response = await proposalsApi.updateResponse(proposal._id, existingResponse._id, responseData);
        if (response.success) {
          toast.success('Proposal updated successfully!');
        }
      } else {
        // Create new response
        response = await proposalsApi.addResponse(proposal._id, responseData);
        if (response.success) {
          toast.success('Response submitted successfully!');
        }
      }
      
      if (response.success) {
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          solutionId: '',
          proposalText: '',
          proposedPrice: '',
          proposedTimeline: '',
          useExistingSolution: true,
          createNewSolution: false,
          attachments: [],
          caseStudyLink: ''
        });
        setCurrentStep(1);
        setSelectedTab('existing');
      }
    } catch (error: any) {
      console.error('Error submitting response:', error);
      // Extract error message properly - handle both string and object errors
      let errorMessage = 'Failed to submit response';
      if (error.response?.data?.error) {
        const errorData = error.response.data.error;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'object') {
          // Handle error objects (e.g., AppError with statusCode, status, isOperational)
          const errorKeys = Object.keys(errorData);
          if (errorKeys.length > 0 && errorKeys.includes('message')) {
            errorMessage = errorData.message || 'Failed to submit response';
          } else {
            errorMessage = 'Failed to submit response. Please try again.';
          }
        }
      } else if (error.response?.data?.message) {
        errorMessage = typeof error.response.data.message === 'string' 
          ? error.response.data.message 
          : 'Failed to submit response';
      } else if (error.message) {
        errorMessage = typeof error.message === 'string' ? error.message : 'Failed to submit response';
      }

      // Check if error is about missing vendor profile
      const errorMessageLower = errorMessage.toLowerCase();
      if (errorMessageLower.includes('vendor profile not found') || 
          errorMessageLower.includes('create a vendor profile') ||
          errorMessageLower.includes('please create a vendor profile')) {
        toast.error(
          (t) => (
            <div className="flex flex-col gap-2">
              <span className="font-medium">Vendor Profile Required</span>
              <span className="text-sm">Please create your vendor profile first to submit proposals.</span>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  onClose();
                  window.location.href = '/vendor';
                }}
                className="mt-1 text-left text-sm text-blue-600 hover:text-blue-800 underline font-medium"
              >
                Go to Vendor Profile Setup →
              </button>
            </div>
          ),
          { duration: 8000 }
        );
      } else {
        toast.error(errorMessage);
      }
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
      
      {/* Modal - Fixed size, centered */}
      <div className="flex min-h-full items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 w-[900px] h-[80vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white px-6 py-4 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SparklesIcon className="w-6 h-6" />
                <div>
                  <h2 className="text-2xl font-bold">{isEditMode ? 'Edit Proposal' : 'Proposal Builder'}</h2>
                  <p className="text-blue-100 text-sm mt-0.5">Problem: {proposal.title}</p>
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

          {/* Content - Two Column Layout */}
          <div className="flex-1 overflow-hidden flex min-h-[600px]">
            {/* Left Column: Problem Information - Signin Style */}
            <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 p-8 lg:p-10 flex-col justify-center relative overflow-hidden border-r border-gray-700">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500 rounded-lg rotate-12"></div>
                <div className="absolute top-32 right-16 w-16 h-16 bg-purple-500 rounded-lg -rotate-12"></div>
                <div className="absolute bottom-20 left-20 w-12 h-12 bg-cyan-500 rounded-lg rotate-45"></div>
                <div className="absolute bottom-32 right-10 w-14 h-14 bg-pink-500 rounded-lg -rotate-45"></div>
              </div>
              
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
                  
                  <div className="space-y-5">
                    <div>
                      <span className="text-sm font-medium text-blue-200 block mb-2">Goal:</span>
                      <p className="text-lg font-medium text-white leading-relaxed">{proposal.title}</p>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-blue-200 block mb-2">Description:</span>
                      <p className="text-gray-300 leading-relaxed">{proposal.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3 pt-3 border-t border-white/10">
                      <div>
                        <span className="text-sm font-medium text-blue-200 block mb-2">Industry:</span>
                        <span className="inline-block px-3 py-1.5 bg-blue-500/30 backdrop-blur-sm border border-blue-400/30 text-blue-100 rounded-lg text-sm font-medium">
                          {proposal.industry}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-blue-200 block mb-2">Category:</span>
                        <span className="inline-block px-3 py-1.5 bg-purple-500/30 backdrop-blur-sm border border-purple-400/30 text-purple-100 rounded-lg text-sm font-medium">
                          {proposal.category}
                        </span>
                      </div>
                    </div>
                    
                    {proposal.requirements.requiredFeatures.length > 0 && (
                      <div className="pt-3 border-t border-white/10">
                        <span className="text-sm font-medium text-blue-200 block mb-3">Required Features:</span>
                        <div className="flex flex-wrap gap-2">
                        {proposal.requirements.requiredFeatures.map((feature, index) => (
                            <span key={index} className="px-3 py-1.5 bg-red-500/30 backdrop-blur-sm border border-red-400/30 text-red-100 rounded-lg text-xs font-medium">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              </motion.div>
            </div>

            {/* Right Column: Form Pages */}
            <div className="w-full lg:w-3/5 overflow-y-auto bg-white">
              <form onSubmit={handleSubmit} className="h-full flex flex-col">
                {/* Page Navigation Indicator */}
                <div className="px-6 pt-6 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        currentStep >= 1 ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>1</div>
                      <span className="text-sm font-medium">Select Product & Description</span>
                    </div>
                    <div className="w-12 h-0.5 bg-gray-300"></div>
                    <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        currentStep >= 2 ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>2</div>
                      <span className="text-sm font-medium">Proof & Estimate</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-6 overflow-y-auto">
                  {/* Page 1: Select Product & Description */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      {/* Step A: Select Reference Product - My Portfolio */}
                      <div>
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">Step A: Select Reference Product</h3>
                          <p className="text-sm text-gray-600 mb-4">Choose a product from your portfolio that best fits this problem. This automatically attaches the product's technical specs and "Verified" status.</p>
                        </div>
                        {/* Tab Selection - Keep for switching between portfolio and new solution */}
                        <div className="border-b border-gray-200 mb-4">
                <nav className="-mb-px flex space-x-8">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTab('existing');
                      handleChange('useExistingSolution', true);
                      handleChange('createNewSolution', false);
                    }}
                      className={`py-3 px-1 border-b-2 font-medium text-sm ${
                      selectedTab === 'existing'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                      My Portfolio
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTab('new');
                      handleChange('useExistingSolution', false);
                      handleChange('createNewSolution', true);
                    }}
                      className={`py-3 px-1 border-b-2 font-medium text-sm ${
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
                    {/* Dropdown to select solution from My Vault */}
                    {solutionsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      </div>
                    ) : solutions.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                        <SparklesIcon className="mx-auto h-10 w-10 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No solutions in your portfolio</h3>
                        <p className="mt-1 text-sm text-gray-500 mb-4">
                          You need to add solutions to My Vault first
                        </p>
                          <button
                            type="button"
                          onClick={() => {
                            onClose();
                            window.location.href = '/vendor';
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white rounded-md hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 transition-colors inline-flex items-center gap-2 text-sm"
                        >
                          <PlusIcon className="w-4 h-4" />
                          Go to My Vault
                          </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Product from My Portfolio <span className="text-red-500">*</span>
                        </label>
                        {/* Searchable Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                          <div
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 text-gray-900 bg-white cursor-pointer flex items-center justify-between"
                          >
                            <span className={formData.solutionId ? 'text-gray-900' : 'text-gray-400'}>
                              {selectedSolution ? selectedSolution.title : '-- Select a product from your portfolio --'}
                            </span>
                            <MagnifyingGlassIcon className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                          </div>
                          
                          {/* Dropdown Menu with Search */}
                          {isDropdownOpen && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-hidden">
                              {/* Search Input */}
                              <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                                <div className="relative">
                                  <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                  <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search products..."
                                    className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    autoFocus
                                  />
                                </div>
                              </div>
                              
                              {/* Filtered Options List */}
                              <div className="overflow-y-auto max-h-48">
                                {solutions.filter(solution =>
                                  solution.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  solution.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase())
                                ).length === 0 ? (
                                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                    No products found matching "{searchQuery}"
                                  </div>
                                ) : (
                                  solutions
                                    .filter(solution =>
                                      solution.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                      solution.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase())
                                    )
                                    .map((solution) => (
                                      <div
                                        key={solution._id}
                                        onClick={() => {
                                          handleSolutionSelect(solution._id);
                                          setIsDropdownOpen(false);
                                          setSearchQuery('');
                                        }}
                                        className={`px-4 py-2.5 cursor-pointer hover:bg-blue-50 transition-colors ${
                                          formData.solutionId === solution._id ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                                        }`}
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">{solution.title}</p>
                                            {solution.shortDescription && (
                                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{solution.shortDescription}</p>
                                            )}
                                          </div>
                                          {formData.solutionId === solution._id && (
                                            <CheckCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 ml-2" />
                                          )}
                                        </div>
                                      </div>
                                    ))
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {formData.solutionId && selectedSolution && (
                          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs font-medium text-green-900">Selected Product:</p>
                              <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">Verified</span>
                            </div>
                            <p className="text-sm text-green-800 font-semibold">{selectedSolution.title}</p>
                            {selectedSolution.shortDescription && (
                              <p className="text-xs text-green-700 mt-1 line-clamp-2">{selectedSolution.shortDescription}</p>
                            )}
                            <p className="text-xs text-green-600 mt-2">Technical specs and details have been attached to your proposal</p>
                          </div>
                        )}
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
                      </div>

                      {/* Step B: Custom Fit Pitch */}
                      <div className="mt-6">
                          <div className="mb-3">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Step B: Custom Fit Pitch</h3>
                            <p className="text-sm text-gray-600">Explain how your product will be adapted to solve this specific problem</p>
                  </div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Proposal <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.proposalText}
                  onChange={(e) => handleChange('proposalText', e.target.value)}
                            rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Explain how your existing product will be adapted to solve this specific problem. Describe key benefits, implementation approach, and value proposition..."
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.proposalText.length}/5000 characters
                </p>
              </div>
                      </div>
                  )}

                  {/* Page 2: Proof & Estimate */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      {/* Step C: Proof of Capability */}
                        <div>
                          <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Step C: Proof of Capability</h3>
                            <p className="text-sm text-gray-600">Upload a case study or whitepaper that proves you've solved similar problems before</p>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Case Study Link (Optional)
                              </label>
                              <div className="flex gap-2">
                                <LinkIcon className="w-5 h-5 text-gray-400 mt-2" />
                                <input
                                  type="url"
                                  value={formData.caseStudyLink}
                                  onChange={(e) => handleChange('caseStudyLink', e.target.value)}
                                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="https://example.com/case-study"
                                />
                              </div>
                              <p className="mt-1 text-xs text-gray-500">Share a link to a case study or whitepaper</p>
                            </div>

                            {/* File Attachments */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Attach Documents (PDF, Case Study, Whitepaper)
                              </label>
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => {
                                  const files = Array.from(e.target.files || []);
                                  files.forEach((file) => {
                                    const newFile: AttachedFile = {
                                      id: Date.now().toString() + Math.random(),
                                      name: file.name,
                                      type: file.type.includes('pdf') ? 'pdf' : 'document',
                                      file: file
                                    };
                                    setFormData(prev => ({
                                      ...prev,
                                      attachments: [...prev.attachments, newFile]
                                    }));
                                  });
                                  e.target.value = '';
                                }}
                                className="hidden"
                                id="file-upload"
                                multiple
                              />
                              <label
                                htmlFor="file-upload"
                                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                              >
                                <PaperClipIcon className="w-5 h-5" />
                                Attach PDF or Document
                              </label>
                              {formData.attachments.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  {formData.attachments.map((attachment) => (
                                    <div
                                      key={attachment.id}
                                      className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md"
                                    >
                                      <div className="flex items-center gap-3">
                                        <DocumentIcon className="w-5 h-5 text-gray-400" />
                                        <div>
                                          <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                                          <p className="text-xs text-gray-500">{attachment.type.toUpperCase()}</p>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setFormData(prev => ({
                                            ...prev,
                                            attachments: prev.attachments.filter(a => a.id !== attachment.id)
                                          }));
                                        }}
                                        className="text-red-600 hover:text-red-800"
                                      >
                                        <XMarkIcon className="w-5 h-5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Step D: Preliminary Estimate */}
                        <div>
                          <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Step D: Preliminary Estimate</h3>
                            <p className="text-sm text-gray-600">Provide rough estimates for time and cost (optional)</p>
                          </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                Estimated Cost (Optional)
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
                                Time to Implement (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.proposedTimeline}
                    onChange={(e) => handleChange('proposedTimeline', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., 4 weeks"
                  />
                </div>
                          </div>
                        </div>

                        {/* Premium Boost Indicator */}
                        {selectedSolution && (
                          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <SparklesIcon className="w-5 h-5 text-purple-600" />
                              <span className="font-semibold text-purple-900">Premium Boost</span>
                            </div>
                            <p className="text-sm text-purple-800">
                              {selectedSolution.pricing?.price 
                                ? "Your proposal will appear at the top of the customer's list with priority highlighting."
                                : "Your verified product has been attached with priority status."}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
              </div>

                {/* Footer Navigation */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => currentStep === 2 ? setCurrentStep(1) : onClose()}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    {currentStep === 1 ? 'Cancel' : 'Previous'}
                  </button>
                  <div className="flex items-center gap-3">
                    {currentStep === 1 ? (
                <button
                  type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // Validate page 1
                          if (!formData.solutionId) {
                            toast.error('Please select a product from your portfolio');
                            return;
                          }
                          if (!formData.proposalText.trim()) {
                            toast.error('Please provide a proposal description');
                            return;
                          }
                          setCurrentStep(2);
                        }}
                        className="px-6 py-2 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white rounded-md hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 transition-colors font-medium"
                      >
                        Next
                </button>
                    ) : (
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={loading || (isEditMode && !hasChanges())}
                  className={`px-6 py-2 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white rounded-md hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 transition-colors flex items-center gap-2 font-medium shadow-md ${
                    (isEditMode && !hasChanges()) 
                      ? 'opacity-50 cursor-not-allowed bg-gray-400 hover:bg-gray-400' 
                      : 'disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {isEditMode ? 'Updating...' : 'Submitting...'}
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-5 h-5" />
                      {isEditMode ? 'Update Proposal' : 'Submit Proposal'}
                    </>
                  )}
                </button>
                    )}
                  </div>
              </div>
            </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
