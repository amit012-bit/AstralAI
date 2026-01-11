/**
 * Create Proposal Modal Component
 * Modal form for customers and vendors to create new proposals
 */

import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { proposalsApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

interface CreateProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  'Chatbots',
  'Predictive Analytics',
  'Computer Vision',
  'Recommendation Systems',
  'Machine Learning',
  'Natural Language Processing',
  'Other'
];

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

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
];

interface ProposalFormData {
  description: string;
  category: string;
  industry: string;
  priority: string;
  requirements: {
    requiredFeatures: string[];
    preferredFeatures: string[];
  };
}

export const CreateProposalModal: React.FC<CreateProposalModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentRequiredFeature, setCurrentRequiredFeature] = useState('');
  const [currentPreferredFeature, setCurrentPreferredFeature] = useState('');
  
  const [formData, setFormData] = useState<ProposalFormData>({
    description: '',
    category: '',
    industry: '',
    priority: 'medium',
    requirements: {
      requiredFeatures: [],
      preferredFeatures: []
    }
  });

  const handleChange = (field: keyof ProposalFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddFeature = (type: 'required' | 'preferred') => {
    const feature = type === 'required' ? currentRequiredFeature : currentPreferredFeature;
    if (!feature.trim()) return;
    setFormData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        [type === 'required' ? 'requiredFeatures' : 'preferredFeatures']: [
          ...prev.requirements[type === 'required' ? 'requiredFeatures' : 'preferredFeatures'],
          feature.trim()
        ]
      }
    }));
    if (type === 'required') {
      setCurrentRequiredFeature('');
    } else {
      setCurrentPreferredFeature('');
    }
  };

  const handleRemoveFeature = (type: 'required' | 'preferred', index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        [type === 'required' ? 'requiredFeatures' : 'preferredFeatures']: 
          prev.requirements[type === 'required' ? 'requiredFeatures' : 'preferredFeatures'].filter((_, i) => i !== index)
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (!formData.category) {
      toast.error('Category is required');
      return;
    }
    if (!formData.industry) {
      toast.error('Industry is required');
      return;
    }

    setLoading(true);
    try {
      // Generate title from description (first 100 characters)
      const title = formData.description.trim().substring(0, 100) + (formData.description.trim().length > 100 ? '...' : '');
      
      // Prepare submission data
      const submissionData: any = {
        title: title,
        description: formData.description.trim(),
        category: formData.category,
        industry: formData.industry,
        priority: formData.priority,
        status: 'active',
        requirements: {
          requiredFeatures: formData.requirements.requiredFeatures,
          preferredFeatures: formData.requirements.preferredFeatures
        },
        contactName: user ? `${user.firstName} ${user.lastName}` : '',
        contactEmail: user?.email || ''
      };

      const response = await proposalsApi.createProposal(submissionData);
      
      if (response.success) {
        toast.success('Problem submitted successfully!');
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          description: '',
          category: '',
          industry: '',
          priority: 'medium',
          requirements: {
            requiredFeatures: [],
            preferredFeatures: []
          }
        });
        setCurrentRequiredFeature('');
        setCurrentPreferredFeature('');
      }
    } catch (error: any) {
      console.error('Error creating proposal:', error);
      toast.error(error.response?.data?.error || error.message || 'Failed to submit problem');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-gray-900">List out Your Problem Here</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <p className="text-sm text-gray-600">We will Find the solution for you</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe Your Problem *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe your problem, requirements, and what you're looking for..."
                required
              />
            </div>

            {/* Category and Industry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry *
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => handleChange('industry', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select industry</option>
                  {INDUSTRIES.map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {PRIORITIES.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Required Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Features (Optional)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={currentRequiredFeature}
                  onChange={(e) => setCurrentRequiredFeature(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFeature('required');
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add required feature"
                />
                <button
                  type="button"
                  onClick={() => handleAddFeature('required')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.requirements.requiredFeatures.map((feature, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature('required', index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Preferred Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Features (Optional)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={currentPreferredFeature}
                  onChange={(e) => setCurrentPreferredFeature(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFeature('preferred');
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add preferred feature"
                />
                <button
                  type="button"
                  onClick={() => handleAddFeature('preferred')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.requirements.preferredFeatures.map((feature, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature('preferred', index)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
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
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Problem'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
