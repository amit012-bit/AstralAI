/**
 * Solution Form Types with Auto-fill Metadata
 */

export interface FieldMetadata {
  fieldKey: string;
  autoFilled: boolean;
  required: boolean;
  editable: boolean;
  source?: 'website' | 'manual' | 'default';
}

export interface SectionConfig {
  id: string;
  name: string;
  description?: string;
  fields: string[]; // Field keys in this section
  required: boolean;
  enabled: boolean;
  autoFilled: boolean; // Are all fields auto-filled?
  order: number;
}

export interface SolutionFormMetadata {
  fields: Record<string, FieldMetadata>;
  sections: SectionConfig[];
  autoFilledFields: string[];
  manualFields: string[];
}

export interface SolutionFormData {
  // Basic Information
  title: string;
  shortDescription: string;
  description: string;
  category: string;
  industry: string;
  subcategory: string;
  tags: string[];
  
  // Features
  features: Array<{
    name: string;
    description: string;
    icon: string;
  }>;
  
  // Pricing
  pricing: {
    model: string;
    price: number;
    currency: string;
    billingCycle: string;
    customPricing: {
      available: boolean;
      description: string;
    };
  };
  
  // Deployment
  deployment: {
    type: string;
    time: string;
    description: string;
    complexity: string;
  };
  
  // Technical
  capabilities: string[];
  technologies: string[];
  integrationRequirements: string;
  
  // Contact
  contactInfo: {
    email: string;
    phone: string;
    address: string;
    demoUrl: string;
    documentationUrl: string;
  };
  
  // Additional
  valuePropositions: string[];
  performanceMetrics: Array<{
    metric: string;
    value: string;
    description: string;
  }>;
  aiTechnology: {
    approach: string;
    model: string;
    accuracy: string;
    processingTime: string;
  };
  useCases: string[];
  integrationHighlights: string[];
  trustIndicators: string[];
  quickBenefits: string[];
  implementationTime: string;
  
  // Metadata (not submitted to backend)
  _metadata?: SolutionFormMetadata;
}
