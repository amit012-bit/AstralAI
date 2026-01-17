/**
 * Manage Sections Modal Component
 * Two-column modal for selecting and managing vendor detail fields
 * Left column: Information about field management
 * Right column: Available fields grouped by section with checkboxes
 */

import React, { useState, useEffect } from 'react';
import { XMarkIcon, SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { dataFieldsApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

interface DataField {
  _id: string;
  fieldKey: string;
  fieldLabel: string;
  fieldType: string;
  category: string;
  section: string;
  isDefault: boolean;
  isRequired: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  description?: string;
}

interface ManageSectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ManageSectionsModal: React.FC<ManageSectionsModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allFields, setAllFields] = useState<DataField[]>([]);
  const [selectedFieldIds, setSelectedFieldIds] = useState<string[]>([]);
  const [vendorFields, setVendorFields] = useState<DataField[]>([]);

  // Fetch all available fields and vendor's current fields
  useEffect(() => {
    if (isOpen && user?._id) {
      fetchFields();
    }
  }, [isOpen, user?._id]);

  const fetchFields = async () => {
    setLoading(true);
    try {
      const [allFieldsResponse, vendorFieldsResponse] = await Promise.all([
        dataFieldsApi.getAllFields({ isActive: true }),
        dataFieldsApi.getVendorFields(user!._id)
      ]);

      if (allFieldsResponse.success) {
        setAllFields(allFieldsResponse.data || []);
      }

      if (vendorFieldsResponse.success) {
        const fields = vendorFieldsResponse.data || [];
        setVendorFields(fields);
        // Set selected field IDs from vendor's current mappings
        setSelectedFieldIds(fields.map((f: DataField) => f._id));
      }
    } catch (error: any) {
      console.error('Error fetching fields:', error);
      toast.error('Failed to load fields');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldToggle = (fieldId: string, isDefault: boolean) => {
    // Don't allow deselecting default fields
    if (isDefault) {
      return;
    }

    setSelectedFieldIds(prev => {
      if (prev.includes(fieldId)) {
        return prev.filter(id => id !== fieldId);
      } else {
        return [...prev, fieldId];
      }
    });
  };

  const handleSave = async () => {
    if (!user?._id) return;

    setSaving(true);
    try {
      const response = await dataFieldsApi.updateVendorMappings(user._id, selectedFieldIds);
      
      if (response.success) {
        toast.success('Sections updated successfully!');
        onSuccess?.();
        onClose();
      } else {
        toast.error(response.message || 'Failed to update sections');
      }
    } catch (error: any) {
      console.error('Error updating field mappings:', error);
      toast.error(error.response?.data?.error || error.message || 'Failed to update sections');
    } finally {
      setSaving(false);
    }
  };

  // Group fields by section
  const fieldsBySection = allFields.reduce((acc, field) => {
    const section = field.section || 'other';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(field);
    return acc;
  }, {} as Record<string, DataField[]>);

  // Get section display names
  const sectionNames: Record<string, string> = {
    basic: 'Basic Information',
    location: 'Location',
    contact: 'Contact Information',
    additional: 'Additional Details'
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
            className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-[900px] h-[75vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex-shrink-0 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white px-6 py-4 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SparklesIcon className="w-6 h-6" />
                  <div>
                    <h2 className="text-2xl font-bold">Manage Sections</h2>
                    <p className="text-purple-100 text-sm mt-0.5">Customize your vendor details form</p>
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
              {/* Left Column - Information */}
              <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 p-8 lg:p-10 flex-col justify-center relative overflow-y-auto border-r border-gray-700">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500 rounded-lg rotate-12"></div>
                  <div className="absolute top-32 right-16 w-16 h-16 bg-purple-500 rounded-lg -rotate-12"></div>
                  <div className="absolute bottom-20 left-20 w-12 h-12 bg-cyan-500 rounded-lg rotate-45"></div>
                </div>

                <div className="relative z-10">
                  {/* Info Card */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mr-4">
                        <SparklesIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Customize Your Form</h3>
                        <p className="text-blue-200 text-sm">Select fields to display</p>
                      </div>
                    </div>

                    <div className="space-y-4 text-white">
                      <div>
                        <p className="text-sm text-blue-200 mb-2">Available Fields</p>
                        <p className="text-xs text-gray-300 leading-relaxed">
                          Select which fields you want to display in your vendor details form. Default fields are always included and cannot be removed.
                        </p>
                      </div>

                      <div className="pt-4 border-t border-white/20">
                        <p className="text-xs text-purple-200 mb-2">Benefits:</p>
                        <ul className="space-y-2 text-xs text-gray-300">
                          <li className="flex items-start">
                            <CheckCircleIcon className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                            <span>Show only relevant information</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircleIcon className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                            <span>Organize fields by sections</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircleIcon className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                            <span>Easy form customization</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Field Selection */}
              <div className="flex-1 lg:w-3/5 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                  ) : allFields.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                      <div className="text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <h3 className="mt-4 text-lg font-medium text-gray-900">No fields available</h3>
                        <p className="mt-2 text-sm text-gray-500">
                          No data fields are configured. Please contact an administrator to set up the fields.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(fieldsBySection).map(([section, fields]) => (
                        <div key={section} className="border border-gray-200 rounded-lg p-3">
                          <h3 className="text-xs font-semibold text-gray-900 mb-2">
                            {sectionNames[section] || section.charAt(0).toUpperCase() + section.slice(1)}
                          </h3>
                          <div className="grid grid-cols-2 gap-1.5">
                            {fields.map(field => {
                              const isSelected = selectedFieldIds.includes(field._id);
                              const isDisabled = field.isDefault;

                              return (
                                <label
                                  key={field._id}
                                  className={`flex items-center gap-2 p-1.5 rounded-md cursor-pointer transition-colors ${
                                    isDisabled
                                      ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
                                      : isSelected
                                      ? 'bg-purple-50 text-purple-900'
                                      : 'hover:bg-gray-50 text-gray-700'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    disabled={isDisabled}
                                    onChange={() => handleFieldToggle(field._id, field.isDefault)}
                                    className="w-3.5 h-3.5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 disabled:opacity-50 flex-shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-xs font-medium">{field.fieldLabel}</span>
                                      {field.isRequired && (
                                        <span className="text-xs text-red-500">*</span>
                                      )}
                                      {field.isDefault && (
                                        <span className="text-xs bg-gray-200 text-gray-600 px-1 py-0.5 rounded">
                                          Default
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || loading}
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
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
