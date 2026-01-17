/**
 * Add Product Modal Component
 * Two-column modal for adding new products
 * Left column: Product information
 * Right column: Editable form fields
 */

import React, { useState } from 'react';
import { XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  name: string;
  shortDescription: string;
  description: string;
  url?: string;
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<Product>({
    name: '',
    shortDescription: '',
    description: '',
    url: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      return;
    }
    if (!formData.shortDescription.trim()) {
      return;
    }
    if (!formData.description.trim()) {
      return;
    }

    onSave(formData);
    // Reset form
    setFormData({
      name: '',
      shortDescription: '',
      description: '',
      url: ''
    });
    onClose();
  };

  if (!isOpen) return null;

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
                    <h2 className="text-2xl font-bold">Add New Product</h2>
                    <p className="text-purple-100 text-sm mt-0.5">Enter product information</p>
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
              {/* Left Column - Product Overview */}
              <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 p-8 lg:p-10 flex-col justify-center relative overflow-y-auto border-r border-gray-700">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500 rounded-lg rotate-12"></div>
                  <div className="absolute top-32 right-16 w-16 h-16 bg-purple-500 rounded-lg -rotate-12"></div>
                  <div className="absolute bottom-20 left-20 w-12 h-12 bg-cyan-500 rounded-lg rotate-45"></div>
                </div>

                <div className="relative z-10">
                  {/* Product Info Card */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mr-4">
                        <SparklesIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Product Details</h3>
                        <p className="text-blue-200 text-sm">Add your product information</p>
                      </div>
                    </div>

                    <div className="space-y-4 text-white">
                      <div>
                        <p className="text-sm text-blue-200 mb-2">What to include:</p>
                        <ul className="space-y-2 text-sm text-gray-300">
                          <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>Clear product name and description</span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>Key features and benefits</span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>Product URL if available</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Info Text */}
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Add products to your portfolio. You can save each product as a solution later.
                  </p>
                </div>
              </div>

              {/* Right Column - Add Product Form */}
              <div className="flex-1 lg:w-3/5 flex flex-col overflow-hidden">
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-y-auto">
                  <div className="p-6 space-y-4">
                    {/* Product Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        required
                        placeholder="Enter product name"
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
                        maxLength={200}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        required
                        placeholder="Brief description (max 200 characters)"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        {formData.shortDescription.length}/200 characters
                      </p>
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
                        placeholder="Detailed product description"
                      />
                    </div>

                    {/* Product URL */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Product URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="https://example.com/product"
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex-shrink-0 px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 transition-colors"
                    >
                      Add Product
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
