/**
 * Dynamic Section Configuration for Solution Form
 * Defines sections that can be auto-filled or manually filled
 */

import { SectionConfig, FieldMetadata, SolutionFormMetadata } from '../types/solutionForm';

export const SECTION_DEFINITIONS: SectionConfig[] = [
  {
    id: 'basic-info',
    name: 'Basic Information',
    description: 'Core solution details',
    fields: ['title', 'shortDescription', 'description', 'category', 'industry', 'subcategory', 'tags'],
    required: true,
    enabled: true,
    autoFilled: false,
    order: 1,
  },
  {
    id: 'features',
    name: 'Features',
    description: 'Key features and capabilities',
    fields: ['features'],
    required: true,
    enabled: true,
    autoFilled: false,
    order: 2,
  },
  {
    id: 'pricing',
    name: 'Pricing',
    description: 'Pricing model and details',
    fields: ['pricing'],
    required: true,
    enabled: true,
    autoFilled: false,
    order: 3,
  },
  {
    id: 'deployment',
    name: 'Deployment',
    description: 'Deployment options and requirements',
    fields: ['deployment'],
    required: true,
    enabled: true,
    autoFilled: false,
    order: 4,
  },
  {
    id: 'technical',
    name: 'Technical Details',
    description: 'Capabilities, technologies, and integrations',
    fields: ['capabilities', 'technologies', 'integrationRequirements'],
    required: false,
    enabled: true,
    autoFilled: false,
    order: 5,
  },
  {
    id: 'contact',
    name: 'Contact Information',
    description: 'Contact details and URLs',
    fields: ['contactInfo'],
    required: true,
    enabled: true,
    autoFilled: false,
    order: 6,
  },
  {
    id: 'customer-focus',
    name: 'Customer-Focused Metrics',
    description: 'Value propositions and benefits',
    fields: ['valuePropositions', 'useCases', 'integrationHighlights', 'trustIndicators', 'quickBenefits', 'implementationTime'],
    required: false,
    enabled: true,
    autoFilled: false,
    order: 7,
  },
  {
    id: 'ai-details',
    name: 'AI Technology Details',
    description: 'AI-specific technical information',
    fields: ['aiTechnology'],
    required: false,
    enabled: true,
    autoFilled: false,
    order: 8,
  },
  {
    id: 'performance',
    name: 'Performance Metrics',
    description: 'Performance and benchmark data',
    fields: ['performanceMetrics'],
    required: false,
    enabled: true,
    autoFilled: false,
    order: 9,
  },
];

/**
 * Create metadata from parsed data
 */
export function createMetadataFromParsedData(
  parsedData: any,
  sections: SectionConfig[] = SECTION_DEFINITIONS
): SolutionFormMetadata {
  const fields: Record<string, FieldMetadata> = {};
  const autoFilledFields: string[] = [];
  const manualFields: string[] = [];

  // Mark fields as auto-filled if they exist in parsed data
  sections.forEach(section => {
    section.fields.forEach(fieldKey => {
      const hasValue = checkFieldHasValue(parsedData, fieldKey);
      const isRequired = section.required;
      
      fields[fieldKey] = {
        fieldKey,
        autoFilled: hasValue,
        required: isRequired,
        editable: true,
        source: hasValue ? 'website' : undefined,
      };
      
      if (hasValue) {
        autoFilledFields.push(fieldKey);
      } else if (isRequired) {
        manualFields.push(fieldKey);
      }
    });
  });

  // Update section auto-filled status
  const updatedSections = sections.map(section => ({
    ...section,
    autoFilled: section.fields.every(fieldKey => fields[fieldKey]?.autoFilled || false),
  }));

  return {
    fields,
    sections: updatedSections,
    autoFilledFields,
    manualFields,
  };
}

/**
 * Check if a field has a value in parsed data
 */
function checkFieldHasValue(data: any, fieldKey: string): boolean {
  if (!data) return false;
  
  // Handle nested fields
  if (fieldKey.includes('.')) {
    const parts = fieldKey.split('.');
    let value = data;
    for (const part of parts) {
      value = value?.[part];
      if (value === undefined || value === null) return false;
    }
    return value !== '' && value !== null && value !== undefined;
  }
  
  const value = data[fieldKey];
  
  // Check for empty arrays
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  
  // Check for empty objects
  if (typeof value === 'object' && value !== null) {
    return Object.keys(value).length > 0;
  }
  
  // Check for strings
  return value !== '' && value !== null && value !== undefined;
}

/**
 * Get sections that should be enabled based on parsed data
 */
export function getEnabledSections(
  metadata: SolutionFormMetadata,
  includeOptional: boolean = true
): SectionConfig[] {
  return metadata.sections
    .filter(section => {
      if (section.required) return true;
      if (!includeOptional) return false;
      return section.enabled && (section.autoFilled || section.fields.some(fieldKey => metadata.fields[fieldKey]?.required));
    })
    .sort((a, b) => a.order - b.order);
}
