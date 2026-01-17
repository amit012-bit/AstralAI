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
  SparklesIcon
} from '@heroicons/react/24/outline';
import { DeleteConfirmationModal } from '../../common/DeleteConfirmationModal';
import { EditSolutionModal } from './EditSolutionModal';

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [solutionToDelete, setSolutionToDelete] = useState<{ id: string; title: string } | null>(null);

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

  const handleDelete = (solutionId: string, solutionTitle: string) => {
    setSolutionToDelete({ id: solutionId, title: solutionTitle });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!solutionToDelete) return;

    setDeletingId(solutionToDelete.id);
    try {
      const response = await solutionsApi.deleteSolution(solutionToDelete.id);
      
      if (response.success) {
        toast.success('Solution deleted successfully');
        // Remove from local state immediately for better UX
        const updatedSolutions = solutions.filter(s => s._id !== solutionToDelete.id);
        setSolutions(updatedSolutions);
        // Update count in parent
        if (onSolutionsCountChange) {
          onSolutionsCountChange(updatedSolutions.length);
        }
        // Refresh to ensure consistency
        setTimeout(() => fetchSolutions(), 100);
        setShowDeleteModal(false);
        setSolutionToDelete(null);
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
    setShowEditModal(true);
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

      {/* Edit Solution Modal */}
      {editingSolution && (
        <EditSolutionModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingSolution(null);
          }}
          onSuccess={() => {
            fetchSolutions();
            setShowEditModal(false);
            setEditingSolution(null);
          }}
          solution={editingSolution}
        />
      )}

      {/* Delete Confirmation Modal */}
      {solutionToDelete && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSolutionToDelete(null);
          }}
          onConfirm={confirmDelete}
          title="Delete Solution"
          message={`Are you sure you want to delete "${solutionToDelete.title}"? This action cannot be undone and the solution will be permanently removed from your portfolio.`}
          confirmText="Delete"
          cancelText="Cancel"
          loading={deletingId === solutionToDelete.id}
        />
      )}
    </div>
  );
};
