"use client";

import React, { useState } from 'react';
import { solutionsApi } from '../../../lib/api';
import { toast } from 'react-hot-toast';
import { PlusIcon, TrashIcon, CheckCircleIcon, PencilIcon } from '@heroicons/react/24/outline';

interface Product {
  name: string;
  shortDescription: string;
  description: string;
  url?: string;
  _id?: string; // Temporary ID for local tracking
  _saved?: boolean; // Track if saved as solution
}

interface ProductsListSectionProps {
  products: Product[];
  vendorContactInfo: {
    email: string;
    phone: string;
  };
  onUpdateProduct: (index: number, product: Product) => void;
  onDeleteProduct: (index: number) => void;
  onAddProduct: () => void;
}

export const ProductsListSection: React.FC<ProductsListSectionProps> = ({
  products,
  vendorContactInfo,
  onUpdateProduct,
  onDeleteProduct,
  onAddProduct,
}) => {
  const [savingIndex, setSavingIndex] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Product | null>(null);

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditForm({ ...products[index] });
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditForm(null);
  };

  const handleSaveEdit = (index: number) => {
    if (editForm) {
      onUpdateProduct(index, editForm);
      setEditingIndex(null);
      setEditForm(null);
    }
  };

  const handleSaveAsSolution = async (index: number) => {
    const product = products[index];
    setSavingIndex(index);

    try {
      // Create solution from product data
      const solutionData = {
        title: product.name,
        shortDescription: product.shortDescription || product.description.substring(0, 200),
        description: product.description,
        category: '', // Will be filled in product edit modal
        industry: '', // Will be filled in product edit modal
        tags: [],
        contactInfo: {
          email: vendorContactInfo.email,
          phone: vendorContactInfo.phone,
          address: '',
          demoUrl: product.url || '',
          documentationUrl: '',
        },
        // Set minimal required fields
        features: [],
        pricing: {
          model: 'contact',
          price: 0,
          currency: 'USD',
          billingCycle: 'monthly',
          customPricing: {
            available: false,
            description: '',
          },
        },
        deployment: {
          type: '',
          time: '',
          description: '',
          complexity: '',
        },
        capabilities: [],
        technologies: [],
        integrationRequirements: '',
        valuePropositions: [],
        performanceMetrics: [],
        aiTechnology: {
          approach: '',
          model: '',
          accuracy: '',
          processingTime: '',
        },
        useCases: [],
        integrationHighlights: [],
        trustIndicators: [],
        quickBenefits: [],
        implementationTime: '',
      };

      const response = await solutionsApi.createSolution(solutionData);
      
      if (response.success) {
        toast.success(`Solution "${product.name}" created successfully!`);
        onUpdateProduct(index, { ...product, _saved: true });
      } else {
        toast.error(response.message || 'Failed to create solution');
      }
    } catch (error: any) {
      console.error('Error saving solution:', error);
      toast.error(error.response?.data?.error || error.message || 'Failed to create solution');
    } finally {
      setSavingIndex(null);
    }
  };

  if (products.length === 0) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-gray-900">Products List</h3>
          <p className="text-sm text-gray-600">
            No products found. You can add products manually or parse a website to extract products.
          </p>
        </div>
        <button
          onClick={onAddProduct}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" /> Add Product
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-gray-900">Products List</h3>
          <p className="text-sm text-gray-600">
            {products.length} product{products.length !== 1 ? 's' : ''} found. Review and save each as a solution.
          </p>
        </div>
        <button
          onClick={onAddProduct}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
        >
          <PlusIcon className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Products Grid - Classic Card View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product, index) => (
          <div
            key={product._id || index}
            className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden"
          >
            {editingIndex === index ? (
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={editForm?.name || ''}
                    onChange={(e) => setEditForm({ ...editForm!, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description *
                  </label>
                  <textarea
                    value={editForm?.shortDescription || ''}
                    onChange={(e) => setEditForm({ ...editForm!, shortDescription: e.target.value })}
                    rows={2}
                    maxLength={200}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {editForm?.shortDescription?.length || 0}/200 characters
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Description *
                  </label>
                  <textarea
                    value={editForm?.description || ''}
                    onChange={(e) => setEditForm({ ...editForm!, description: e.target.value })}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product URL (optional)
                  </label>
                  <input
                    type="url"
                    value={editForm?.url || ''}
                    onChange={(e) => setEditForm({ ...editForm!, url: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveEdit(index)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Card Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h4>
                      {product._saved && (
                        <div className="inline-flex items-center gap-1.5 text-green-600 text-xs font-medium">
                          <CheckCircleIcon className="w-4 h-4" />
                          Saved as Solution
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Body - Sections */}
                <div className="p-6 space-y-5">
                  {/* Short Description Section */}
                  <div>
                    <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Short Description
                    </h5>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {product.shortDescription || product.description.substring(0, 200)}
                    </p>
                  </div>

                  {/* Full Description Section */}
                  <div>
                    <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Full Description
                    </h5>
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
                      {product.description}
                    </p>
                  </div>

                  {/* Product URL */}
                  {product.url && (
                    <div>
                      <a
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1.5"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View Product Page
                      </a>
                    </div>
                  )}
                </div>

                {/* Card Footer - Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-2">
                  <button
                    onClick={() => handleEdit(index)}
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm flex items-center justify-center gap-1.5"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleSaveAsSolution(index)}
                    disabled={savingIndex === index || product._saved}
                    className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-1.5"
                  >
                    {savingIndex === index ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : product._saved ? (
                      <>
                        <CheckCircleIcon className="h-4 w-4" />
                        Saved
                      </>
                    ) : (
                      'Save as Solution'
                    )}
                  </button>
                  {products.length > 1 && (
                    <button
                      onClick={() => onDeleteProduct(index)}
                      className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm flex items-center justify-center"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
