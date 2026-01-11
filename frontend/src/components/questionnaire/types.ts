export interface QuestionnaireData {
  // Section 1: General Information
  selectedAISolutions: string[];
  institutionName: string;
  institutionType: string;
  institutionTypeOther?: string;
  state: string;
  country: string;
  countryOther?: string;
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
  
  // Section 2: Medical Information
  medicalSpecialties: string[];
  medicalSpecialtiesOther?: string;
  patientVolume: string;
  currentSystems: string[];
  currentSystemsOther?: string;
  complianceRequirements: string[];
  complianceOther?: string;
  // Data Sharing Compliance Questions
  willingToShareData: string;
  dataTypesToShare: string[];
  dataTypesToShareOther?: string;
  dataSharingFormat: string;
  dataSharingFormatOther?: string;
  dataSharingSecurityRequirements: string[];
  dataSharingSecurityOther?: string;
  dataSharingTimeline: string;
  dataSharingRestrictions: string;
  dataSharingRestrictionsOther?: string;
  integrationRequirements: string[];
  integrationRequirementsOther?: string;
  dataSecurityNeeds: string[];
  dataSecurityNeedsOther?: string;
  
  // Section 3: Problems & AI Solutions Needed
  primaryChallenges: string[];
  primaryChallengesOther?: string;
  currentPainPoints: string[];
  currentPainPointsOther?: string;
  goals: string[];
  goalsOther?: string;
  interestedSolutionAreas: string[];
  specificSolutions: string[];
  mustHaveFeatures: string[];
  mustHaveFeaturesOther?: string;
  niceToHaveFeatures: string[];
  niceToHaveFeaturesOther?: string;
  budgetRange: string;
  timeline: string;
  decisionMakers: string[];
  decisionMakersOther?: string;
  procurementProcess: string[];
  procurementProcessOther?: string;
  additionalNotes: string;
}

export interface InstitutionQuestionnaireProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: QuestionnaireData) => void;
  initialData?: Partial<QuestionnaireData>;
}

export interface StepProps {
  formData: QuestionnaireData;
  updateField: (field: keyof QuestionnaireData, value: any) => void;
  updateArrayField: (field: keyof QuestionnaireData, value: string, checked: boolean) => void;
}

