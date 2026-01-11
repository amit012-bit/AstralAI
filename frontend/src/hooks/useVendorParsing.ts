/**
 * Hook for vendor website parsing
 * Extracts vendor info + multiple products from website
 */

import { useState, useCallback } from "react";
import { automationApi } from "../lib/api";

export interface ParsedVendorData {
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
  products: Array<{
    name: string;
    shortDescription: string;
    description: string;
    url?: string;
  }>;
}

export function useVendorParsing() {
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedVendorData | null>(null);

  const parseWebsite = useCallback(async (url: string) => {
    setIsParsing(true);
    setParseError(null);

    try {
      console.log('Calling API: /automation/vendor/parse-website');
      const response = await automationApi.parseVendorWebsite(url);
      console.log('API response received:', response.success);

      if (response.success && response.data) {
        const data = response.data as ParsedVendorData;
        setParsedData(data);
        return data;
      } else {
        throw new Error(response.message || "Failed to parse website");
      }
    } catch (error: any) {
      console.error("Error parsing vendor website:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to parse website. Please try again.";
      setParseError(errorMessage);
      throw error;
    } finally {
      setIsParsing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setParsedData(null);
    setParseError(null);
  }, []);

  return { isParsing, parseError, parsedData, parseWebsite, reset };
}
