/**
 * Parse Website Section
 * Section 1: URL input and parsing functionality
 * White background classic design
 */

import React, { useState } from 'react';

interface ParseWebsiteSectionProps {
  onParse: (url: string) => Promise<void>;
  isParsing: boolean;
  parseError: string | null;
  parsedData: any;
}

export const ParseWebsiteSection: React.FC<ParseWebsiteSectionProps> = ({
  onParse,
  isParsing,
  parseError,
  parsedData,
}) => {
  const [url, setUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      await onParse(url.trim());
    }
  };

  const isValidUrl = (urlString: string): boolean => {
    try {
      const urlObj = new URL(urlString);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  };

      return (
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-gray-900">Parse Website</h3>
            <p className="text-sm text-gray-600">
              Enter your company website URL to automatically extract vendor information and all products/solutions
            </p>
          </div>

      {!parsedData ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700 mb-2">
              Website URL *
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                id="websiteUrl"
                name="websiteUrl"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                disabled={isParsing}
                className={`flex-1 px-4 py-3 bg-white border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  parseError ? 'border-red-300' : 'border-gray-300'
                } disabled:bg-gray-50 disabled:cursor-not-allowed`}
              />
              <button
                type="submit"
                disabled={isParsing || !url.trim() || !isValidUrl(url)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md flex items-center gap-2 whitespace-nowrap"
              >
                {isParsing ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Parsing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Parse</span>
                  </>
                )}
              </button>
            </div>
            {parseError && (
              <p className="mt-1 text-sm text-red-600">{parseError}</p>
            )}
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-blue-100 rounded-lg flex-shrink-0">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 leading-relaxed">
                  <span className="font-medium text-gray-900">AI-powered extraction:</span> We'll analyze the website and extract company information, contact details, and all products/solutions. You can review and edit the extracted data before proceeding.
                </p>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-green-900 mb-2">Website Parsed Successfully!</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p><span className="font-medium text-gray-900">Company:</span> {parsedData.companyName || 'Not found'}</p>
                <p><span className="font-medium text-gray-900">Products Found:</span> {parsedData.products?.length || 0}</p>
                <p><span className="font-medium text-gray-900">Contact:</span> {parsedData.primaryContact?.email || 'Not found'}</p>
              </div>
              <p className="text-xs text-gray-600 mt-4">
                Review the vendor details and products list below. You can edit any field before proceeding.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
