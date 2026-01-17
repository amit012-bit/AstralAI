/**
 * Vendor Tab Component
 * Contains all 3 sections: Parse Website, Vendor Details, Products List
 */

import React, { useState, useCallback, useEffect } from 'react';
import { ParseWebsiteSection } from './ParseWebsiteSection';
import { VendorDetailsSection } from './VendorDetailsSection';
import { ProductsListSection } from './ProductsListSection';
import { AddProductModal } from './AddProductModal';
import { ManageSectionsModal } from './ManageSectionsModal';
import { useVendorParsing, ParsedVendorData } from '../../../hooks/useVendorParsing';
import { vendorApi } from '../../../lib/api';
import { toast } from 'react-hot-toast';
import { 
  GlobeAltIcon, 
  BuildingStorefrontIcon, 
  ClipboardDocumentCheckIcon,
  PlusIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

interface VendorTabProps {
  onComplete?: () => void;
}

interface VendorDetails {
  companyName: string;
  companyType: string;
  companyTypeOther?: string;
  location: {
    state: string;
    country: string;
    countryOther?: string;
  };
  website: string;
  address?: string;
  primaryContact: {
    name: string;
    title: string;
    email: string;
    phone: string;
  };
}

interface Product {
  name: string;
  shortDescription: string;
  description: string;
  url?: string;
  _id?: string;
  _saved?: boolean;
}

export const VendorTab: React.FC<VendorTabProps> = ({ onComplete }) => {
  const { isParsing, parseError, parsedData, parseWebsite, reset } = useVendorParsing();
  
  const [vendorDetails, setVendorDetails] = useState<VendorDetails>({
    companyName: '',
    companyType: '',
    location: {
      state: '',
      country: 'United States',
    },
    website: '',
    primaryContact: {
      name: '',
      title: '',
      email: '',
      phone: '',
    },
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState<number>(1);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showManageSectionsModal, setShowManageSectionsModal] = useState(false);
  const [vendorFieldsRefreshTrigger, setVendorFieldsRefreshTrigger] = useState(0);

  // Section navigation items with icons
  const sections = [
    { id: 1, name: 'Parse Website', icon: GlobeAltIcon },
    { id: 2, name: 'Vendor Details', icon: BuildingStorefrontIcon },
    { id: 3, name: 'Products List', icon: ClipboardDocumentCheckIcon },
  ];

  // Update vendor details and products when parsing completes
  useEffect(() => {
    if (parsedData) {
      setVendorDetails({
        companyName: parsedData.companyName || '',
        companyType: parsedData.companyType || '',
        companyTypeOther: parsedData.companyTypeOther,
        location: parsedData.location || { state: '', country: 'United States' },
        website: parsedData.website || '',
        address: parsedData.address,
        primaryContact: parsedData.primaryContact || {
          name: '',
          title: '',
          email: '',
          phone: '',
        },
      });

      // Initialize products with temporary IDs
      const productsWithIds = (parsedData.products || []).map((p, index) => ({
        ...p,
        _id: `product-${Date.now()}-${index}`,
        _saved: false,
      }));
      setProducts(productsWithIds);
      
      // Auto-advance to section 2 after parsing
      setActiveSection(2);
    }
  }, [parsedData]);

  const handleParse = useCallback(async (url: string) => {
    try {
      await parseWebsite(url);
      toast.success('Website parsed successfully!');
    } catch (error) {
      // Error is handled in the hook
      console.error('Parse error:', error);
    }
  }, [parseWebsite]);

  const handleVendorDetailsChange = useCallback((field: string, value: any) => {
    setVendorDetails(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const handleUpdateProduct = useCallback((index: number, product: Product) => {
    setProducts(prev => {
      const updated = [...prev];
      updated[index] = product;
      return updated;
    });
  }, []);

  const handleDeleteProduct = useCallback((index: number) => {
    setProducts(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleAddProduct = useCallback(() => {
    setProducts(prev => [
      ...prev,
      {
        name: '',
        shortDescription: '',
        description: '',
        _id: `product-${Date.now()}-${prev.length}`,
        _saved: false,
      },
    ]);
    setTimeout(() => {
      setActiveSection(3);
    }, 100);
  }, [products.length]);

  const handleSaveVendorDetails = useCallback(async () => {
    // Validate required fields
    const newErrors: Record<string, string> = {};
    if (!vendorDetails.companyName) newErrors.companyName = 'Company name is required';
    if (!vendorDetails.companyType) newErrors.companyType = 'Company type is required';
    if (!vendorDetails.website) newErrors.website = 'Website is required';
    if (!vendorDetails.location.state) newErrors['location.state'] = 'State is required';
    if (!vendorDetails.location.country) newErrors['location.country'] = 'Country is required';
    if (!vendorDetails.primaryContact.email) newErrors['primaryContact.email'] = 'Contact email is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await vendorApi.createOrUpdateVendor(vendorDetails);
      if (response.success) {
        toast.success('Vendor details saved successfully!');
        setActiveSection(3);
      } else {
        throw new Error(response.message || 'Failed to save vendor details');
      }
    } catch (error: any) {
      console.error('Error saving vendor details:', error);
      // Extract error message properly - handle both string and object errors
      let errorMessage = 'Failed to save vendor details';
      if (error.response?.data?.error) {
        const errorData = error.response.data.error;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'object') {
          // Handle validation errors object
          const errorKeys = Object.keys(errorData);
          if (errorKeys.length > 0) {
            const firstError = errorData[errorKeys[0]];
            errorMessage = typeof firstError === 'string' ? firstError : 'Validation failed';
          }
        }
      } else if (error.message) {
        errorMessage = typeof error.message === 'string' ? error.message : 'Failed to save vendor details';
      }
      toast.error(errorMessage);
    }
  }, [vendorDetails]);

  return (
    <div className="w-full">
      {/* Section Navigation - Horizontal Bar with Icons */}
      <div className="bg-gray-50 border-b border-gray-200 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {sections.map((section, index) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <React.Fragment key={section.id}>
                  <button
                    onClick={() => setActiveSection(section.id)}
                    className={`
                      relative flex items-center gap-2 px-4 py-3 font-medium transition-all
                      ${isActive 
                        ? 'bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white' 
                        : 'text-gray-600 hover:bg-gray-100'
                      }
                      ${isActive && index < sections.length - 1 ? 'pr-6' : ''}
                    `}
                    style={{
                      clipPath: isActive && index < sections.length - 1 
                        ? 'polygon(0% 0%, calc(100% - 12px) 0%, 100% 50%, calc(100% - 12px) 100%, 0% 100%)'
                        : 'none'
                    }}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-current'}`} />
                    <span>{section.name}</span>
                    {isActive && index < sections.length - 1 && (
                      <div className="absolute right-0 top-0 bottom-0 w-0 h-0 border-l-[12px] border-l-purple-600 border-t-[24px] border-t-transparent border-b-[24px] border-b-transparent" />
                    )}
                  </button>
                  {index < sections.length - 1 && (
                    <div className="h-8 w-px bg-gray-300" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          {/* Action Buttons - Show based on active section */}
          <div className="flex items-center gap-2 mr-4">
            {activeSection === 2 && (
              <>
                <button
                  onClick={() => setShowManageSectionsModal(true)}
                  className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 transition-all duration-200 text-sm font-medium"
                >
                  <Cog6ToothIcon className="w-4 h-4" />
                  Manage Sections
                </button>
                <button
                  onClick={handleSaveVendorDetails}
                  className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 transition-all duration-200 text-sm font-medium"
                >
                  Save
                </button>
              </>
            )}
            {activeSection === 3 && (
              <button
                onClick={() => setShowAddProductModal(true)}
                className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 transition-all duration-200 text-sm font-medium"
              >
                <PlusIcon className="w-4 h-4" />
                Add New
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Section Content */}
      <div className="w-full">
        {/* Section 1: Parse Website */}
        {activeSection === 1 && (
          <ParseWebsiteSection
            onParse={handleParse}
            isParsing={isParsing}
            parseError={parseError}
            parsedData={parsedData}
            onSkip={() => setActiveSection(2)}
          />
        )}

        {/* Section 2: Vendor Details */}
        {activeSection === 2 && (
          <div className="w-full">
            <VendorDetailsSection
              vendorData={vendorDetails}
              onChange={handleVendorDetailsChange}
              errors={errors}
            />
          </div>
        )}

        {/* Section 3: Products List */}
        {activeSection === 3 && (
          <ProductsListSection
            products={products}
            vendorContactInfo={{
              email: vendorDetails.primaryContact.email,
              phone: vendorDetails.primaryContact.phone,
            }}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onAddProduct={handleAddProduct}
          />
        )}
      </div>

      {/* Add Product Modal - Managed by parent */}
      <AddProductModal
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onSave={(product) => {
          const newProduct: Product = {
            ...product,
            _id: `product-${Date.now()}-${products.length}`,
            _saved: false,
          };
          handleUpdateProduct(products.length, newProduct);
          setShowAddProductModal(false);
        }}
      />

      {/* Manage Sections Modal */}
      <ManageSectionsModal
        isOpen={showManageSectionsModal}
        onClose={() => setShowManageSectionsModal(false)}
        onSuccess={() => {
          setVendorFieldsRefreshTrigger(prev => prev + 1);
        }}
      />
    </div>
  );
};
