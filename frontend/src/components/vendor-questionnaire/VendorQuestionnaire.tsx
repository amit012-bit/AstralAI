"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { VendorQuestionnaireData, VendorQuestionnaireProps } from "./types";
import { QuestionnaireHeader } from "../questionnaire/QuestionnaireHeader";
import { QuestionnaireFooter } from "../questionnaire/QuestionnaireFooter";
import { VendorStep1CompanyInfo } from "./VendorStep1CompanyInfo";
import { VendorStep2ContactInfo } from "./VendorStep2ContactInfo";
import { VendorStep3SolutionInfo } from "./VendorStep3SolutionInfo";
import { VendorStep4ComplianceSecurity } from "./VendorStep4ComplianceSecurity";
import { VendorStep5BusinessInfo } from "./VendorStep5BusinessInfo";
import { VendorStep6MarketClients } from "./VendorStep6MarketClients";
import { VendorStep7AdditionalInfo } from "./VendorStep7AdditionalInfo";

export function VendorQuestionnaire({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}: VendorQuestionnaireProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<VendorQuestionnaireData>({
    companyName: "",
    companyType: "",
    companyTypeOther: "",
    website: "",
    foundedYear: undefined,
    state: "",
    country: "",
    countryOther: "",
    companySize: "",
    primaryContactName: "",
    primaryContactTitle: "",
    primaryContactEmail: user?.email || "",
    primaryContactPhone: "",
    secondaryContactName: "",
    secondaryContactTitle: "",
    secondaryContactEmail: "",
    secondaryContactPhone: "",
    preferredContactMethod: "Email",
    bestTimeToContactDays: "",
    bestTimeToContactStartTime: "",
    bestTimeToContactEndTime: "",
    bestTimeToContactTimeZone: "",
    bestTimeToContactTimeZoneOther: "",
    solutionName: "",
    solutionDescription: "",
    solutionCategory: [],
    solutionCategoryOther: "",
    targetSpecialties: [],
    targetSpecialtiesOther: "",
    targetInstitutionTypes: [],
    targetInstitutionTypesOther: "",
    keyFeatures: [],
    keyFeaturesOther: "",
    technologyStack: [],
    technologyStackOther: "",
    deploymentOptions: [],
    integrationCapabilities: [],
    integrationCapabilitiesOther: "",
    complianceCertifications: [],
    complianceCertificationsOther: "",
    securityFeatures: [],
    securityFeaturesOther: "",
    dataHandling: "",
    pricingModel: "",
    pricingModelOther: "",
    pricingRange: "",
    contractTerms: [],
    contractTermsOther: "",
    implementationTime: "",
    supportOffered: [],
    supportOfferedOther: "",
    trainingProvided: [],
    trainingProvidedOther: "",
    currentClients: [],
    currentClientsOther: "",
    clientCount: undefined,
    caseStudies: "",
    testimonials: "",
    awards: [],
    awardsOther: "",
    competitiveAdvantages: [],
    competitiveAdvantagesOther: "",
    futureRoadmap: "",
    additionalNotes: "",
    ...initialData,
  });

  const totalSteps = 7;

  // Update email when user loads
  useEffect(() => {
    if (user?.email && !formData.primaryContactEmail) {
      updateField("primaryContactEmail", user.email);
    }
  }, [user]);

  const updateField = (field: keyof VendorQuestionnaireData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateArrayField = (field: keyof VendorQuestionnaireData, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentArray = (prev[field] as string[]) || [];
      if (checked) {
        return { ...prev, [field]: [...currentArray, value] };
      } else {
        return { ...prev, [field]: currentArray.filter(item => item !== value) };
      }
    });
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      const content = document.getElementById("questionnaire-content");
      if (content) {
        content.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      const content = document.getElementById("questionnaire-content");
      if (content) {
        content.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    onSave(formData);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in-50 duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col animate-in slide-in-from-top-2 duration-300">
        <QuestionnaireHeader
          currentStep={currentStep}
          totalSteps={totalSteps}
          onClose={onClose}
        />

        <div
          id="questionnaire-content"
          className="flex-1 overflow-y-auto px-6 sm:px-8 py-8 bg-gradient-to-b from-white to-zinc-50/30"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#d4d4d8 transparent",
          }}
        >
          {currentStep === 1 && (
            <VendorStep1CompanyInfo
              formData={formData}
              updateField={updateField}
              updateArrayField={updateArrayField}
            />
          )}
          
          {currentStep === 2 && (
            <VendorStep2ContactInfo
              formData={formData}
              updateField={updateField}
              updateArrayField={updateArrayField}
            />
          )}
          
          {currentStep === 3 && (
            <VendorStep3SolutionInfo
              formData={formData}
              updateField={updateField}
              updateArrayField={updateArrayField}
            />
          )}
          
          {currentStep === 4 && (
            <VendorStep4ComplianceSecurity
              formData={formData}
              updateField={updateField}
              updateArrayField={updateArrayField}
            />
          )}
          
          {currentStep === 5 && (
            <VendorStep5BusinessInfo
              formData={formData}
              updateField={updateField}
              updateArrayField={updateArrayField}
            />
          )}
          
          {currentStep === 6 && (
            <VendorStep6MarketClients
              formData={formData}
              updateField={updateField}
              updateArrayField={updateArrayField}
            />
          )}
          
          {currentStep === 7 && (
            <VendorStep7AdditionalInfo
              formData={formData}
              updateField={updateField}
              updateArrayField={updateArrayField}
            />
          )}
        </div>

        <QuestionnaireFooter
          currentStep={currentStep}
          totalSteps={totalSteps}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onSubmit={handleSubmit}
          onSaveDraft={handleSaveDraft}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
