/**
 * Vendor Tab Component
 * Contains all 3 sections: Parse Website, Vendor Details, Products List
 */

import React, { useState, useCallback, useEffect } from 'react';
import { ParseWebsiteSection } from './ParseWebsiteSection';
import { VendorDetailsSection } from './VendorDetailsSection';
import { ProductsListSection } from './ProductsListSection';
import { useVendorParsing, ParsedVendorData } from '../../../hooks/useVendorParsing';
import { vendorApi } from '../../../lib/api';
import { toast } from 'react-hot-toast';
import { 
  GlobeAltIcon, 
  BuildingStorefrontIcon, 
  ClipboardDocumentCheckIcon 
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
        <div className="flex items-center">
          {sections.map((section, index) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            const isDisabled = section.id > 1 && !parsedData;
            
            return (
              <React.Fragment key={section.id}>
                <button
                  onClick={() => !isDisabled && setActiveSection(section.id)}
                  disabled={isDisabled}
                  className={`
                    relative flex items-center gap-2 px-4 py-3 font-medium transition-all
                    ${isActive 
                      ? 'bg-blue-600 text-white' 
                      : isDisabled
                      ? 'text-gray-400 cursor-not-allowed'
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
                    <div className="absolute right-0 top-0 bottom-0 w-0 h-0 border-l-[12px] border-l-blue-600 border-t-[24px] border-t-transparent border-b-[24px] border-b-transparent" />
                  )}
                </button>
                {index < sections.length - 1 && (
                  <div className="h-8 w-px bg-gray-300" />
                )}
              </React.Fragment>
            );
          })}
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
          />
        )}

        {/* Section 2: Vendor Details */}
        {activeSection === 2 && parsedData && (
          <div className="w-full">
            <VendorDetailsSection
              vendorData={vendorDetails}
              onChange={handleVendorDetailsChange}
              errors={errors}
            />
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSaveVendorDetails}
                className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
              >
                Save Vendor Details
              </button>
            </div>
          </div>
        )}

        {/* Section 3: Products List */}
        {activeSection === 3 && parsedData && (
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

        {/* Help text when no data parsed yet */}
        {activeSection !== 1 && !parsedData && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-center">
            <p className="text-yellow-800 text-sm">
              Please parse a website first to extract vendor information and products.
            </p>
            <button
              onClick={() => setActiveSection(1)}
              className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors text-sm"
            >
              Go to Parse Website
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
