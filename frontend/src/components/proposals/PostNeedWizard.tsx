/**
 * Post Need Wizard Component
 * 3-step wizard for customers and vendors to post a new need
 * Step 1: The Goal (Title & Description)
 * Step 2: The Environment (Industry, Data Type, Compliance)
 * Step 3: The Logistics (Budget Range & Timeline)
 */

import React, { useState, useEffect } from 'react';
import { XMarkIcon, CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { proposalsApi, solutionsApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface PostNeedWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (proposalId?: string, matchedVendors?: any[]) => void;
  existingProposal?: {
    _id: string;
    title: string;
    description: string;
    industry: string;
    category?: string;
    requirements?: {
      budget?: {
        min?: number;
        max?: number;
        currency: string;
      };
      timeline?: string;
      dataType?: string;
      compliance?: string[];
    };
    dataType?: string;
    compliance?: string;
  };
  isEditMode?: boolean;
}

const INDUSTRIES = [
  'Healthcare',
  'E-commerce',
  'Finance',
  'Technology',
  'Manufacturing',
  'Education',
  'Retail',
  'Other'
];

const DATA_TYPES = [
  'Images',
  'Text',
  'Audio',
  'Video',
  'Structured Data',
  'Mixed',
  'Other'
];

const COMPLIANCE_OPTIONS = [
  'HIPAA',
  'GDPR',
  'SOC 2',
  'PCI DSS',
  'ISO 27001',
  'None Required',
  'Other'
];

const TIMELINE_OPTIONS = [
  { value: 'immediate', label: 'Immediate (Within 1 month)' },
  { value: '1-month', label: '1 Month' },
  { value: '3-months', label: '3 Months' },
  { value: '6-months', label: '6 Months' },
  { value: '1-year', label: '1 Year' },
  { value: 'flexible', label: 'Flexible' }
];

interface Step1Data {
  title: string;
  description: string;
}

interface Step2Data {
  industry: string;
  dataType: string;
  compliance: string;
}

interface Step3Data {
  budgetMin: number;
  budgetMax: number;
  currency: string;
  timeline: string;
}

export const PostNeedWizard: React.FC<PostNeedWizardProps> = ({
  isOpen,
  onClose,
  onSuccess,
  existingProposal,
  isEditMode = false
}) => {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [matchedVendors, setMatchedVendors] = useState<any[]>([]);

  const [step1Data, setStep1Data] = useState<Step1Data>({
    title: '',
    description: ''
  });

  const [step2Data, setStep2Data] = useState<Step2Data>({
    industry: '',
    dataType: '',
    compliance: ''
  });

  const [step3Data, setStep3Data] = useState<Step3Data>({
    budgetMin: 0,
    budgetMax: 0,
    currency: 'USD',
    timeline: 'flexible'
  });

  // Store original form data for comparison in edit mode
  const [originalFormData, setOriginalFormData] = useState<{
    step1: Step1Data;
    step2: Step2Data;
    step3: Step3Data;
  } | null>(null);

  // Pre-fill form when in edit mode
  useEffect(() => {
    if (isOpen && isEditMode && existingProposal) {
      const initialStep1: Step1Data = {
        title: existingProposal.title || '',
        description: existingProposal.description || ''
      };

      const initialStep2: Step2Data = {
        industry: existingProposal.industry || '',
        dataType: existingProposal.dataType || existingProposal.requirements?.dataType || '',
        compliance: existingProposal.compliance || existingProposal.requirements?.compliance?.[0] || ''
      };

      const initialStep3: Step3Data = {
        budgetMin: existingProposal.requirements?.budget?.min || 0,
        budgetMax: existingProposal.requirements?.budget?.max || 0,
        currency: existingProposal.requirements?.budget?.currency || 'USD',
        timeline: existingProposal.requirements?.timeline || 'flexible'
      };

      setStep1Data(initialStep1);
      setStep2Data(initialStep2);
      setStep3Data(initialStep3);

      // Store original data for comparison
      setOriginalFormData({
        step1: JSON.parse(JSON.stringify(initialStep1)),
        step2: JSON.parse(JSON.stringify(initialStep2)),
        step3: JSON.parse(JSON.stringify(initialStep3))
      });
    } else if (isOpen && !isEditMode) {
      // Reset form when opening in create mode
      setStep1Data({ title: '', description: '' });
      setStep2Data({ industry: '', dataType: '', compliance: '' });
      setStep3Data({ budgetMin: 0, budgetMax: 0, currency: 'USD', timeline: 'flexible' });
      setOriginalFormData(null);
    }
  }, [isOpen, isEditMode, existingProposal]);

  // Check if form data has changed (for edit mode)
  const hasChanges = (): boolean => {
    if (!isEditMode || !originalFormData) {
      return true; // Always enabled in create mode
    }

    // Compare step1Data
    if (step1Data.title.trim() !== originalFormData.step1.title.trim() ||
        step1Data.description.trim() !== originalFormData.step1.description.trim()) {
      return true;
    }

    // Compare step2Data
    if (step2Data.industry !== originalFormData.step2.industry ||
        step2Data.dataType !== originalFormData.step2.dataType ||
        step2Data.compliance !== originalFormData.step2.compliance) {
      return true;
    }

    // Compare step3Data
    if (step3Data.budgetMin !== originalFormData.step3.budgetMin ||
        step3Data.budgetMax !== originalFormData.step3.budgetMax ||
        step3Data.currency !== originalFormData.step3.currency ||
        step3Data.timeline !== originalFormData.step3.timeline) {
      return true;
    }

    return false;
  };

  // Reset wizard when closing
  const handleClose = () => {
    setStep1Data({ title: '', description: '' });
    setStep2Data({ industry: '', dataType: '', compliance: '' });
    setStep3Data({ budgetMin: 0, budgetMax: 0, currency: 'USD', timeline: 'flexible' });
    setMatchedVendors([]);
    onClose();
  };

  // Validate all fields
  const validateForm = (): boolean => {
    if (!step1Data.title.trim()) {
      toast.error('Title is required');
      return false;
    }
    if (!step1Data.description.trim()) {
      toast.error('Description is required');
      return false;
    }
    if (!step2Data.industry) {
      toast.error('Industry is required');
      return false;
    }
    if (!step2Data.dataType) {
      toast.error('Data Type is required');
      return false;
    }
    if (!step2Data.compliance) {
      toast.error('Compliance requirement is required');
      return false;
    }
    if (step3Data.budgetMin < 0 || step3Data.budgetMax < 0) {
      toast.error('Budget must be valid');
      return false;
    }
    if (step3Data.budgetMin > step3Data.budgetMax && step3Data.budgetMax > 0) {
      toast.error('Maximum budget must be greater than minimum budget');
      return false;
    }
    return true;
  };

  // Find matched vendors based on proposal data
  const findMatchedVendors = async (proposalData: any) => {
    try {
      // Search for vendors with matching solutions
      // This would query solutions based on category, industry, and tags
      const response = await solutionsApi.getSolutions({
        category: proposalData.category || '',
        industry: proposalData.industry || '',
        limit: 20
      });

      if (response.success && response.solutions) {
        // Group solutions by vendor
        const vendorMap = new Map();
        response.solutions.forEach((solution: any) => {
          if (solution.vendorId) {
            if (!vendorMap.has(solution.vendorId._id)) {
              vendorMap.set(solution.vendorId._id, {
                vendor: solution.vendorId,
                solutions: []
              });
            }
            vendorMap.get(solution.vendorId._id).solutions.push(solution);
          }
        });

        const vendors = Array.from(vendorMap.values()).slice(0, 5);
        return vendors;
      }
      return [];
    } catch (error) {
      console.error('Error finding matched vendors:', error);
      return [];
    }
  };

  // Handle final submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      // Generate tags from the proposal data
      const tags = [
        step2Data.industry.toLowerCase(),
        step2Data.dataType.toLowerCase(),
        step1Data.title.toLowerCase().split(' ').slice(0, 3)
      ].flat().filter(Boolean);

      // Prepare proposal data
      const proposalData = {
        title: step1Data.title.trim(),
        description: step1Data.description.trim(),
        category: step2Data.dataType, // Using dataType as category for matching
        industry: step2Data.industry,
        tags: tags,
        status: 'active',
        priority: 'medium',
        creatorType: 'customer',
        requirements: {
          budget: {
            min: step3Data.budgetMin || undefined,
            max: step3Data.budgetMax || undefined,
            currency: step3Data.currency
          },
          timeline: step3Data.timeline,
          deploymentPreference: 'any',
          requiredFeatures: [],
          preferredFeatures: []
        },
        contactName: user ? `${user.firstName} ${user.lastName}` : '',
        contactEmail: user?.email || '',
        compliance: step2Data.compliance,
        dataType: step2Data.dataType
      };

      let response;
      if (isEditMode && existingProposal) {
        // Update existing proposal
        response = await proposalsApi.updateProposal(existingProposal._id, proposalData);
        if (response.success) {
          toast.success('Proposal updated successfully!');
          onSuccess(existingProposal._id);
          handleClose();
        }
      } else {
        // Create new proposal
        response = await proposalsApi.createProposal(proposalData);
        if (response.success) {
          // Find matched vendors
          const vendors = await findMatchedVendors(proposalData);
          setMatchedVendors(vendors);

          toast.success('Need posted successfully!');
          onSuccess(response.proposal?._id, vendors);
          
          // Auto-close after showing matched vendors (optional)
          setTimeout(() => {
            handleClose();
          }, 3000);
        }
      }
    } catch (error: any) {
      console.error('Error creating proposal:', error);
      toast.error(error.response?.data?.error || error.message || 'Failed to post need');
    } finally {
      setSubmitting(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal - Two Column Layout */}
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
                  <h2 className="text-2xl font-bold">{isEditMode ? 'Edit Proposal' : 'Post a New Need'}</h2>
                  <p className="text-purple-100 text-sm mt-0.5">{isEditMode ? 'Update the details below' : 'Fill in the details below'}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-white hover:text-purple-100 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content - Two Column Layout */}
          <div className="flex-1 overflow-hidden flex min-h-0">
            {/* Left Column: Information - Signin Style */}
            <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 p-8 lg:p-10 flex-col justify-center relative overflow-y-auto border-r border-gray-700">
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
                {/* Information Card */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
                      <SparklesIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Post Your Need</h3>
                      <p className="text-blue-200 text-sm">Share Your Challenge</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-white font-medium mb-2">Complete Your Posting</p>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Fill in all the details below to help vendors understand your needs and submit relevant proposals.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/20">
                      <p className="text-xs text-purple-200 mb-2">Why post here?</p>
                      <ul className="space-y-2 text-xs text-gray-300">
                        <li className="flex items-start">
                          <CheckCircleIcon className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Get matched with verified vendors</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircleIcon className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Receive quality proposals quickly</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircleIcon className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Compare multiple solutions side-by-side</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Form Content */}
            <div className="flex-1 overflow-hidden bg-gray-50 p-4 flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {/* Title */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={step1Data.title}
                    onChange={(e) => setStep1Data({ ...step1Data, title: e.target.value })}
                    placeholder="e.g., Automate Radiology Report Summaries"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={step1Data.description}
                    onChange={(e) => setStep1Data({ ...step1Data, description: e.target.value })}
                    rows={3}
                    placeholder="Describe your problem, current challenges, and what you're looking to solve..."
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                    required
                  />
                </div>

                {/* Industry, Data Type, Compliance - Grid */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Industry *
                    </label>
                    <select
                      value={step2Data.industry}
                      onChange={(e) => setStep2Data({ ...step2Data, industry: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      required
                    >
                      <option value="">Select</option>
                      {INDUSTRIES.map(ind => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Data Type *
                    </label>
                    <select
                      value={step2Data.dataType}
                      onChange={(e) => setStep2Data({ ...step2Data, dataType: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      required
                    >
                      <option value="">Select</option>
                      {DATA_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Compliance *
                    </label>
                    <select
                      value={step2Data.compliance}
                      onChange={(e) => setStep2Data({ ...step2Data, compliance: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      required
                    >
                      <option value="">Select</option>
                      {COMPLIANCE_OPTIONS.map(comp => (
                        <option key={comp} value={comp}>{comp}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Budget Range */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Budget Range
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <select
                        value={step3Data.currency}
                        onChange={(e) => setStep3Data({ ...step3Data, currency: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="INR">INR</option>
                      </select>
                    </div>
                    <div>
                      <input
                        type="number"
                        value={step3Data.budgetMin || ''}
                        onChange={(e) => setStep3Data({ ...step3Data, budgetMin: parseFloat(e.target.value) || 0 })}
                        placeholder="Min"
                        min="0"
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={step3Data.budgetMax || ''}
                        onChange={(e) => setStep3Data({ ...step3Data, budgetMax: parseFloat(e.target.value) || 0 })}
                        placeholder="Max"
                        min="0"
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Expected Timeline *
                  </label>
                  <select
                    value={step3Data.timeline}
                    onChange={(e) => setStep3Data({ ...step3Data, timeline: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    required
                  >
                    {TIMELINE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Footer Actions */}
              <div className="flex-shrink-0 pt-3 border-t border-gray-200 flex justify-end mt-3">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || (isEditMode && !hasChanges())}
                  className={`px-6 py-2 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white rounded-md hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 transition-colors text-sm font-medium ${
                    (isEditMode && !hasChanges()) 
                      ? 'opacity-50 cursor-not-allowed bg-gray-400 hover:bg-gray-400' 
                      : 'disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {submitting ? (isEditMode ? 'Updating...' : 'Posting...') : (isEditMode ? 'Update Proposal' : 'Post Need')}
                </button>
              </div>

              {/* Matched Vendors (after submission) */}
              {matchedVendors.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircleIcon className="w-4 h-4 text-blue-600" />
                    <h4 className="text-sm font-semibold text-blue-900">Found {matchedVendors.length} Matched Vendors</h4>
                  </div>
                  <p className="text-xs text-blue-700">
                    We found vendors with existing products that match your requirements.
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
