/**
 * Existing Solutions Tab
 * Displays all solutions created by the vendor
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { solutionsApi } from '../../../lib/api';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';
import { 
  MagnifyingGlassIcon, 
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  SparklesIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

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
  createdAt: string;
  updatedAt: string;
}

interface ExistingSolutionsTabProps {
  onSolutionsCountChange?: (count: number) => void;
  searchQuery?: string;
}

export const ExistingSolutionsTab: React.FC<ExistingSolutionsTabProps> = ({ onSolutionsCountChange, searchQuery: externalSearchQuery = '' }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingSolution, setEditingSolution] = useState<Solution | null>(null);
  const [editFormData, setEditFormData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Fetch vendor's solutions
  useEffect(() => {
    if (user?._id) {
      fetchSolutions();
    }
  }, [user?._id]);

  const fetchSolutions = async () => {
    if (!user?._id) return;
    
    setLoading(true);
    try {
      const response = await solutionsApi.getSolutions({
        vendorId: user._id,
        limit: 100,
      });
      
      if (response.success) {
        const solutionsList = response.solutions || [];
        setSolutions(solutionsList);
        // Notify parent of solution count
        if (onSolutionsCountChange) {
          onSolutionsCountChange(solutionsList.length);
        }
      } else {
        toast.error('Failed to load solutions');
      }
    } catch (error: any) {
      console.error('Error fetching solutions:', error);
      toast.error('Failed to load solutions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (solutionId: string, solutionTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${solutionTitle}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(solutionId);
    try {
      const response = await solutionsApi.deleteSolution(solutionId);
      
      if (response.success) {
        toast.success('Solution deleted successfully');
        // Remove from local state immediately for better UX
        const updatedSolutions = solutions.filter(s => s._id !== solutionId);
        setSolutions(updatedSolutions);
        // Update count in parent
        if (onSolutionsCountChange) {
          onSolutionsCountChange(updatedSolutions.length);
        }
        // Refresh to ensure consistency
        setTimeout(() => fetchSolutions(), 100);
      } else {
        toast.error(response.message || 'Failed to delete solution');
      }
    } catch (error: any) {
      console.error('Error deleting solution:', error);
      // Extract error message properly
      let errorMessage = 'Failed to delete solution';
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
      setDeletingId(null);
    }
  };

  const handleEdit = (solution: Solution) => {
    setEditingSolution(solution);
    setEditFormData({
      title: solution.title,
      shortDescription: solution.shortDescription,
      description: solution.description,
      category: solution.category,
      industry: solution.industry,
      pricing: solution.pricing || {
        price: 0,
        currency: 'USD',
        billingCycle: 'monthly'
      }
    });
  };

  const handleSaveEdit = async () => {
    if (!editingSolution || !editFormData) return;

    setSaving(true);
    try {
      const response = await solutionsApi.updateSolution(editingSolution._id, editFormData);
      
      if (response.success) {
        toast.success('Solution updated successfully');
        setEditingSolution(null);
        setEditFormData(null);
        fetchSolutions(); // Refresh the list
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

  const filteredSolutions = solutions.filter(solution =>
    solution.title.toLowerCase().includes(externalSearchQuery.toLowerCase()) ||
    solution.shortDescription.toLowerCase().includes(externalSearchQuery.toLowerCase()) ||
    solution.category.toLowerCase().includes(externalSearchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Solutions Grid */}
      {filteredSolutions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <SparklesIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {externalSearchQuery ? 'No solutions found' : 'No solutions yet'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {externalSearchQuery 
              ? 'Try adjusting your search terms'
              : 'Parse your website or create solutions manually to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSolutions.map((solution) => (
            <div
              key={solution._id}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden"
            >
              {/* Gradient Accent Bar */}
              <div className="h-1 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600"></div>
              
              <div className="p-6">
                {/* Category Badge */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <SparklesIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {solution.category || 'Uncategorized'}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {solution.title}
                </h3>

                {/* Short Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {solution.shortDescription || solution.description}
                </p>

                {/* Pricing */}
                {solution.pricing && solution.pricing.price > 0 && (
                  <div className="mb-4">
                    <span className="text-base font-semibold text-gray-900">
                      {solution.pricing.currency || 'USD'} {solution.pricing.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">
                      /{solution.pricing.billingCycle}
                    </span>
                  </div>
                )}

                {/* Industry */}
                {solution.industry && (
                  <div className="mb-4">
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                      {solution.industry}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => router.push(`/solutions/${solution._id}`)}
                    className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <EyeIcon className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(solution);
                    }}
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm flex items-center justify-center"
                    title="Edit"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(solution._id, solution.title);
                    }}
                    disabled={deletingId === solution._id}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete"
                  >
                    {deletingId === solution._id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700"></div>
                    ) : (
                      <TrashIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingSolution && editFormData && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setEditingSolution(null)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Edit Solution</h2>
                  <button
                    onClick={() => setEditingSolution(null)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} className="p-6 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description *
                  </label>
                  <textarea
                    value={editFormData.shortDescription}
                    onChange={(e) => setEditFormData({ ...editFormData, shortDescription: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Description *
                  </label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Category and Industry */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <input
                      type="text"
                      value={editFormData.category}
                      onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry *
                    </label>
                    <input
                      type="text"
                      value={editFormData.industry}
                      onChange={(e) => setEditFormData({ ...editFormData, industry: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price
                    </label>
                    <input
                      type="number"
                      value={editFormData.pricing?.price || 0}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        pricing: { ...editFormData.pricing, price: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      value={editFormData.pricing?.currency || 'USD'}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        pricing: { ...editFormData.pricing, currency: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Billing Cycle
                    </label>
                    <select
                      value={editFormData.pricing?.billingCycle || 'monthly'}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        pricing: { ...editFormData.pricing, billingCycle: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                      <option value="one-time">One-time</option>
                    </select>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setEditingSolution(null)}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
