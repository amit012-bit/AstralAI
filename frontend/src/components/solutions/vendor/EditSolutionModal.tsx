/**
 * Edit Solution Modal Component
 * Two-column modal for editing solution details
 * Left column: Solution overview/information
 * Right column: Editable form fields
 */

import React, { useState, useEffect } from 'react';
import { XMarkIcon, SparklesIcon, TagIcon, CurrencyDollarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { solutionsApi } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface Solution {
  _id: string;
  title: string;
  shortDescription: string;
  description: string;
  category: string;
  industry: string;
  pricing?: {
    price: number;
    currency: string;
    billingCycle: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface EditSolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  solution: Solution | null;
}

export const EditSolutionModal: React.FC<EditSolutionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  solution
}) => {
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    category: '',
    industry: '',
    pricing: {
      price: 0,
      currency: 'USD',
      billingCycle: 'monthly'
    }
  });

  const [originalFormData, setOriginalFormData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Pre-fill form when solution is provided
  useEffect(() => {
    if (isOpen && solution) {
      const initialData = {
        title: solution.title || '',
        shortDescription: solution.shortDescription || '',
        description: solution.description || '',
        category: solution.category || '',
        industry: solution.industry || '',
        pricing: solution.pricing || {
          price: 0,
          currency: 'USD',
          billingCycle: 'monthly'
        }
      };
      setFormData(initialData);
      setOriginalFormData(JSON.parse(JSON.stringify(initialData)));
    }
  }, [isOpen, solution]);

  // Check if form data has changed
  const hasChanges = (): boolean => {
    if (!originalFormData) return false; // Disable button if original data not loaded yet

    return (
      formData.title.trim() !== originalFormData.title.trim() ||
      formData.shortDescription.trim() !== originalFormData.shortDescription.trim() ||
      formData.description.trim() !== originalFormData.description.trim() ||
      formData.category !== originalFormData.category ||
      formData.industry !== originalFormData.industry ||
      formData.pricing.price !== originalFormData.pricing.price ||
      formData.pricing.currency !== originalFormData.pricing.currency ||
      formData.pricing.billingCycle !== originalFormData.pricing.billingCycle
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!solution) return;

    // Validation
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!formData.shortDescription.trim()) {
      toast.error('Short description is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (!formData.category.trim()) {
      toast.error('Category is required');
      return;
    }
    if (!formData.industry.trim()) {
      toast.error('Industry is required');
      return;
    }

    setSaving(true);
    try {
      const response = await solutionsApi.updateSolution(solution._id, formData);

      if (response.success) {
        toast.success('Solution updated successfully');
        onSuccess();
        onClose();
      } else {
        toast.error(response.message || 'Failed to update solution');
      }
    } catch (error: any) {
      console.error('Error updating solution:', error);
      let errorMessage = 'Failed to update solution';
      if (error.response?.data?.error) {
        const errorData = error.response.data.error;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !solution) return null;

  return (
    <AnimatePresence>
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
            className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-[900px] max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex-shrink-0 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white px-6 py-4 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SparklesIcon className="w-6 h-6" />
                  <div>
                    <h2 className="text-2xl font-bold">Edit Solution</h2>
                    <p className="text-purple-100 text-sm mt-0.5">Update your product information</p>
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
              {/* Left Column - Solution Overview */}
              <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 p-8 lg:p-10 flex-col justify-center relative overflow-y-auto border-r border-gray-700">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500 rounded-lg rotate-12"></div>
                  <div className="absolute top-32 right-16 w-16 h-16 bg-purple-500 rounded-lg -rotate-12"></div>
                  <div className="absolute bottom-20 left-20 w-12 h-12 bg-cyan-500 rounded-lg rotate-45"></div>
                </div>

                <div className="relative z-10">
                  {/* Solution Info Card */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mr-4">
                        <SparklesIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Solution Details</h3>
                        <p className="text-blue-200 text-sm">Edit your product information</p>
                      </div>
                    </div>

                    <div className="space-y-4 text-white">
                      <div>
                        <p className="text-sm text-blue-200 mb-1">Current Title</p>
                        <p className="font-medium">{solution.title}</p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <TagIcon className="w-4 h-4 text-blue-300" />
                          <span className="text-sm text-blue-200">{solution.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TagIcon className="w-4 h-4 text-purple-300" />
                          <span className="text-sm text-purple-200">{solution.industry}</span>
                        </div>
                      </div>

                      {solution.pricing && (
                        <div className="flex items-center gap-2">
                          <CurrencyDollarIcon className="w-4 h-4 text-green-300" />
                          <span className="text-sm text-green-200">
                            {solution.pricing.currency} {solution.pricing.price.toLocaleString()}
                            {' '}/ {solution.pricing.billingCycle}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info Text */}
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Update your solution information to keep your portfolio current and accurate.
                  </p>
                </div>
              </div>

              {/* Right Column - Edit Form */}
              <div className="flex-1 lg:w-3/5 flex flex-col overflow-hidden">
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-y-auto">
                  <div className="p-6 space-y-4">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        required
                      />
                    </div>

                    {/* Short Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Short Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.shortDescription}
                        onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Full Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        required
                      />
                    </div>

                    {/* Category and Industry */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Industry <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.industry}
                          onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          required
                        />
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Price
                        </label>
                        <input
                          type="number"
                          value={formData.pricing.price}
                          onChange={(e) => setFormData({
                            ...formData,
                            pricing: { ...formData.pricing, price: parseFloat(e.target.value) || 0 }
                          })}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Currency
                        </label>
                        <select
                          value={formData.pricing.currency}
                          onChange={(e) => setFormData({
                            ...formData,
                            pricing: { ...formData.pricing, currency: e.target.value }
                          })}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Billing Cycle
                        </label>
                        <select
                          value={formData.pricing.billingCycle}
                          onChange={(e) => setFormData({
                            ...formData,
                            pricing: { ...formData.pricing, billingCycle: e.target.value }
                          })}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly</option>
                          <option value="one-time">One-time</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex-shrink-0 px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving || !hasChanges()}
                      className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Saving...
                        </div>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
