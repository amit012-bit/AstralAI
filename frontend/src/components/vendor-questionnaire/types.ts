export interface VendorQuestionnaireData {
  // Section 1: Company Information
  companyName: string;
  companyType: string;
  companyTypeOther?: string;
  website: string;
  foundedYear?: number;
  state: string;
  country: string;
  countryOther?: string;
  companySize: string;
  
  // Section 2: Contact Information
  primaryContactName: string;
  primaryContactTitle: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  secondaryContactName: string;
  secondaryContactTitle: string;
  secondaryContactEmail: string;
  secondaryContactPhone: string;
  preferredContactMethod: string;
  bestTimeToContactDays: string;
  bestTimeToContactStartTime: string;
  bestTimeToContactEndTime: string;
  bestTimeToContactTimeZone: string;
  bestTimeToContactTimeZoneOther?: string;
  
  // Section 3: Solution Information
  solutionName: string;
  solutionDescription: string;
  solutionCategory: string[];
  solutionCategoryOther?: string;
  targetSpecialties: string[];
  targetSpecialtiesOther?: string;
  targetInstitutionTypes: string[];
  targetInstitutionTypesOther?: string;
  keyFeatures: string[];
  keyFeaturesOther?: string;
  technologyStack: string[];
  technologyStackOther?: string;
  deploymentOptions: string[];
  integrationCapabilities: string[];
  integrationCapabilitiesOther?: string;
  
  // Section 4: Compliance & Security
  complianceCertifications: string[];
  complianceCertificationsOther?: string;
  securityFeatures: string[];
  securityFeaturesOther?: string;
  dataHandling: string;
  
  // Section 5: Business Information
  pricingModel: string;
  pricingModelOther?: string;
  pricingRange: string;
  contractTerms: string[];
  contractTermsOther?: string;
  implementationTime: string;
  supportOffered: string[];
  supportOfferedOther?: string;
  trainingProvided: string[];
  trainingProvidedOther?: string;
  
  // Section 6: Market & Clients
  currentClients: string[];
  currentClientsOther?: string;
  clientCount?: number;
  caseStudies: string;
  testimonials: string;
  awards: string[];
  awardsOther?: string;
  
  // Section 7: Additional Information
  competitiveAdvantages: string[];
  competitiveAdvantagesOther?: string;
  futureRoadmap: string;
  additionalNotes: string;
}

export interface VendorQuestionnaireProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: VendorQuestionnaireData) => void;
  initialData?: Partial<VendorQuestionnaireData>;
}

export interface VendorStepProps {
  formData: VendorQuestionnaireData;
  updateField: (field: keyof VendorQuestionnaireData, value: any) => void;
  updateArrayField: (field: keyof VendorQuestionnaireData, value: string, checked: boolean) => void;
}

