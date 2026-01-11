"use client";

import { useState } from "react";
import { FormField, Input } from "../questionnaire/FormField";

interface Step0UrlInputProps {
  onUrlSubmit: (url: string) => Promise<void>;
  onSkip: () => void;
  isParsing: boolean;
  parseError: string | null;
}

export const Step0UrlInput = ({ onUrlSubmit, onSkip, isParsing, parseError }: Step0UrlInputProps) => {
  const [url, setUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      await onUrlSubmit(url.trim());
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
    <div className="space-y-5 animate-in fade-in-50 duration-300">
      <div className="space-y-1.5">
        <h3 className="text-2xl font-bold text-white">Auto-fill from Website</h3>
        <p className="text-sm text-gray-400">
          Enter a URL to automatically extract and pre-fill solution information
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField 
          label="Website URL" 
          error={parseError || undefined}
        >
          <div className="flex gap-2">
            <Input
              type="url"
              name="solutionUrl"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              disabled={isParsing}
              error={!!parseError}
              className="flex-1 bg-gray-800 text-white border-gray-600"
            />
            <button
              type="submit"
              disabled={isParsing || !url.trim() || !isValidUrl(url)}
              className="px-5 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md flex items-center gap-2 whitespace-nowrap"
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
        </FormField>

        {/* Info Card */}
        <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-xl border border-purple-700/50 p-4">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-purple-700/50 rounded-lg flex-shrink-0">
              <svg className="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-300 leading-relaxed">
                <span className="font-medium text-gray-200">AI-powered extraction:</span> We'll analyze the website and auto-fill the solution details. You can review and edit before submitting.
              </p>
            </div>
          </div>
        </div>

        {/* Skip option */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onSkip}
            disabled={isParsing}
            className="w-full py-2.5 px-4 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 hover:border-gray-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Skip and fill manually
          </button>
        </div>
      </form>
    </div>
  );
};
