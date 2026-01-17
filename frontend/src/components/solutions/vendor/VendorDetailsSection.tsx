/**
 * Vendor Details Section
 * Section 2: Vendor basic details form (auto-filled from parsing, editable)
 * White background classic design
 */

import React from 'react';

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

interface VendorDetailsSectionProps {
  vendorData: VendorDetails;
  onChange: (field: string, value: any) => void;
  errors?: Record<string, string>;
}

const COMPANY_TYPES = ['Startup', 'SME', 'Enterprise', 'Other'];
const COUNTRIES = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 
  'France', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Switzerland', 
  'Austria', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Japan', 
  'South Korea', 'Singapore', 'India', 'China', 'Brazil', 'Mexico', 'Other'
];

export const VendorDetailsSection: React.FC<VendorDetailsSectionProps> = ({
  vendorData,
  onChange,
  errors = {},
}) => {
  const handleInputChange = (field: string, value: any) => {
    onChange(field, value);
  };

  const handleNestedChange = (parentField: string, childField: string, value: any) => {
    onChange(parentField, {
      ...vendorData[parentField as keyof VendorDetails],
      [childField]: value,
    });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Company Name */}
        <div className="lg:col-span-2">
          <label htmlFor="companyName" className="block text-xs font-medium text-gray-700 mb-1.5">
            Company Name *
          </label>
          <input
            type="text"
            id="companyName"
            required
            value={vendorData.companyName}
            onChange={(e) => handleInputChange('companyName', e.target.value)}
            className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter company name"
          />
          {errors.companyName && (
            <p className="mt-1 text-xs text-red-600">{errors.companyName}</p>
          )}
        </div>

        {/* Company Type */}
        <div>
          <label htmlFor="companyType" className="block text-xs font-medium text-gray-700 mb-1.5">
            Company Type *
          </label>
          <select
            id="companyType"
            required
            value={vendorData.companyType}
            onChange={(e) => handleInputChange('companyType', e.target.value)}
            className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select company type</option>
            {COMPANY_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {errors.companyType && (
            <p className="mt-1 text-xs text-red-600">{errors.companyType}</p>
          )}
        </div>

        {/* Website */}
        <div>
          <label htmlFor="website" className="block text-xs font-medium text-gray-700 mb-1.5">
            Website URL *
          </label>
          <input
            type="url"
            id="website"
            required
            value={vendorData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com"
          />
          {errors.website && (
            <p className="mt-1 text-xs text-red-600">{errors.website}</p>
          )}
        </div>

        {/* Company Type Other */}
        {vendorData.companyType === 'Other' && (
          <div className="lg:col-span-2">
            <label htmlFor="companyTypeOther" className="block text-xs font-medium text-gray-700 mb-1.5">
              Specify Company Type *
            </label>
            <input
              type="text"
              id="companyTypeOther"
              required
              value={vendorData.companyTypeOther || ''}
              onChange={(e) => handleInputChange('companyTypeOther', e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter company type"
            />
          </div>
        )}

        {/* State */}
        <div>
          <label htmlFor="state" className="block text-xs font-medium text-gray-700 mb-1.5">
            State *
          </label>
          <input
            type="text"
            id="state"
            required
            value={vendorData.location.state}
            onChange={(e) => handleNestedChange('location', 'state', e.target.value)}
            className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., California"
          />
          {errors['location.state'] && (
            <p className="mt-1 text-xs text-red-600">{errors['location.state']}</p>
          )}
        </div>

        {/* Country */}
        <div>
          <label htmlFor="country" className="block text-xs font-medium text-gray-700 mb-1.5">
            Country *
          </label>
          <select
            id="country"
            required
            value={vendorData.location.country}
            onChange={(e) => handleNestedChange('location', 'country', e.target.value)}
            className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select country</option>
            {COUNTRIES.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
          {errors['location.country'] && (
            <p className="mt-1 text-xs text-red-600">{errors['location.country']}</p>
          )}
        </div>

        {/* Address */}
        <div className="lg:col-span-2">
          <label htmlFor="address" className="block text-xs font-medium text-gray-700 mb-1.5">
            Address
          </label>
          <textarea
            id="address"
            rows={2}
            value={vendorData.address || ''}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Full company address"
          />
        </div>

        {/* Primary Contact - Name */}
        <div>
          <label htmlFor="contactName" className="block text-xs font-medium text-gray-700 mb-1.5">
            Contact Name *
          </label>
          <input
            type="text"
            id="contactName"
            required
            value={vendorData.primaryContact.name}
            onChange={(e) => handleNestedChange('primaryContact', 'name', e.target.value)}
            className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Full name"
          />
        </div>

        {/* Primary Contact - Title */}
        <div>
          <label htmlFor="contactTitle" className="block text-xs font-medium text-gray-700 mb-1.5">
            Contact Title *
          </label>
          <input
            type="text"
            id="contactTitle"
            required
            value={vendorData.primaryContact.title}
            onChange={(e) => handleNestedChange('primaryContact', 'title', e.target.value)}
            className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., CEO, Sales Director"
          />
        </div>

        {/* Primary Contact - Email */}
        <div>
          <label htmlFor="contactEmail" className="block text-xs font-medium text-gray-700 mb-1.5">
            Contact Email *
          </label>
          <input
            type="email"
            id="contactEmail"
            required
            value={vendorData.primaryContact.email}
            onChange={(e) => handleNestedChange('primaryContact', 'email', e.target.value)}
            className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="contact@company.com"
          />
          {errors['primaryContact.email'] && (
            <p className="mt-1 text-xs text-red-600">{errors['primaryContact.email']}</p>
          )}
        </div>

        {/* Primary Contact - Phone */}
        <div>
          <label htmlFor="contactPhone" className="block text-xs font-medium text-gray-700 mb-1.5">
            Contact Phone *
          </label>
          <input
            type="tel"
            id="contactPhone"
            required
            value={vendorData.primaryContact.phone}
            onChange={(e) => handleNestedChange('primaryContact', 'phone', e.target.value)}
            className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>
    </div>
  );
};
