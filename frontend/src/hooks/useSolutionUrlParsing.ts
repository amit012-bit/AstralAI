import { useState, useCallback } from "react";
import api from "../lib/api";
import { SolutionFormData } from "../pages/solutions/new";

interface UseSolutionUrlParsingProps {
  setFormData: React.Dispatch<React.SetStateAction<SolutionFormData>>;
}

export function useSolutionUrlParsing({ setFormData }: UseSolutionUrlParsingProps) {
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const handleUrlSubmit = useCallback(async (url: string) => {
    setIsParsing(true);
    setParseError(null);

    try {
      console.log('Calling API: /automation/solutions/parse-website');
      const response = await api.post('/automation/solutions/parse-website', { url });
      console.log('API response received:', response.status);

      if (response.data.success && response.data.data) {
        const parsedData = response.data.data;
        
        // Merge parsed data into form
        setFormData((current) => ({
          ...current,
          title: parsedData.title || current.title,
          shortDescription: parsedData.shortDescription || current.shortDescription,
          description: parsedData.description || current.description,
          category: parsedData.category || current.category,
          industry: parsedData.industry || current.industry,
          subcategory: parsedData.subcategory || current.subcategory,
          tags: parsedData.tags?.length > 0 ? parsedData.tags : current.tags,
          features: parsedData.features?.length > 0 
            ? parsedData.features.map((f: any) => ({
                name: f.name || f.title || '',
                description: f.description || '',
                icon: f.icon || ''
              }))
            : current.features,
          pricing: parsedData.pricing ? {
            ...current.pricing,
            ...parsedData.pricing
          } : current.pricing,
          deployment: parsedData.deployment ? {
            ...current.deployment,
            ...parsedData.deployment
          } : current.deployment,
          capabilities: parsedData.capabilities?.length > 0 ? parsedData.capabilities : current.capabilities,
          technologies: parsedData.technologies?.length > 0 ? parsedData.technologies : current.technologies,
          integrationRequirements: parsedData.integrationRequirements || current.integrationRequirements,
          contactInfo: parsedData.contactInfo ? {
            ...current.contactInfo,
            ...parsedData.contactInfo
          } : current.contactInfo,
          valuePropositions: parsedData.valuePropositions?.length > 0 ? parsedData.valuePropositions : current.valuePropositions,
          useCases: parsedData.useCases?.length > 0 ? parsedData.useCases : current.useCases,
          implementationTime: parsedData.implementationTime || current.implementationTime,
        }));

        // Don't navigate - stay on step 0 to show the filled form
        // Navigation will happen when user clicks "Continue" or "Skip"
      } else {
        throw new Error(response.data.message || "Failed to parse website");
      }
    } catch (error: any) {
      console.error("Error parsing website:", error);
      setParseError(error.response?.data?.message || error.message || "Failed to parse website. Please try again.");
    } finally {
      setIsParsing(false);
    }
  }, [setFormData]);

  return { isParsing, parseError, handleUrlSubmit };
}
