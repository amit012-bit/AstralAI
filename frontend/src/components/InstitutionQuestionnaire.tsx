"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { QuestionnaireData, InstitutionQuestionnaireProps } from "./questionnaire/types";
import { QuestionnaireHeader } from "./questionnaire/QuestionnaireHeader";
import { QuestionnaireFooter } from "./questionnaire/QuestionnaireFooter";
import { Step1AISolutions } from "./questionnaire/Step1AISolutions";
import { Step2GeneralInfo } from "./questionnaire/Step2GeneralInfo";
import { Step3MedicalInfo } from "./questionnaire/Step3MedicalInfo";
import { Step4ProblemsSolutions } from "./questionnaire/Step4ProblemsSolutions";

export function InstitutionQuestionnaire({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}: InstitutionQuestionnaireProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<QuestionnaireData>({
    selectedAISolutions: [],
    institutionName: "",
    institutionType: "",
    institutionTypeOther: "",
    state: "",
    country: "",
    countryOther: "",
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
    medicalSpecialties: [],
    medicalSpecialtiesOther: "",
    patientVolume: "",
    currentSystems: [],
    currentSystemsOther: "",
    complianceRequirements: [],
    complianceOther: "",
    willingToShareData: "",
    dataTypesToShare: [],
    dataTypesToShareOther: "",
    dataSharingFormat: "",
    dataSharingFormatOther: "",
    dataSharingSecurityRequirements: [],
    dataSharingSecurityOther: "",
    dataSharingTimeline: "",
    dataSharingRestrictions: "",
    dataSharingRestrictionsOther: "",
    integrationRequirements: [],
    integrationRequirementsOther: "",
    dataSecurityNeeds: [],
    dataSecurityNeedsOther: "",
    primaryChallenges: [],
    primaryChallengesOther: "",
    currentPainPoints: [],
    currentPainPointsOther: "",
    goals: [],
    goalsOther: "",
    interestedSolutionAreas: [],
    specificSolutions: [],
    mustHaveFeatures: [],
    mustHaveFeaturesOther: "",
    niceToHaveFeatures: [],
    niceToHaveFeaturesOther: "",
    budgetRange: "",
    timeline: "",
    decisionMakers: [],
    decisionMakersOther: "",
    procurementProcess: [],
    procurementProcessOther: "",
    additionalNotes: "",
    ...initialData,
  });

  const totalSteps = 4;

  // Update email when user loads
  useEffect(() => {
    if (user?.email && !formData.primaryContactEmail) {
      updateField("primaryContactEmail", user.email);
    }
  }, [user]);

  const updateField = (field: keyof QuestionnaireData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateArrayField = (field: keyof QuestionnaireData, value: string, checked: boolean) => {
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
      // Smooth scroll to top
      const content = document.getElementById("questionnaire-content");
      if (content) {
        content.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Smooth scroll to top
      const content = document.getElementById("questionnaire-content");
      if (content) {
        content.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
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

  // Prevent body scroll when modal is open
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

        {/* Content */}
        <div
          id="questionnaire-content"
          className="flex-1 overflow-y-auto px-6 sm:px-8 py-8 bg-gradient-to-b from-white to-zinc-50/30"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#d4d4d8 transparent",
          }}
        >
          {currentStep === 1 && (
            <Step1AISolutions
              formData={formData}
              updateField={updateField}
              updateArrayField={updateArrayField}
            />
          )}
          
          {currentStep === 2 && (
            <Step2GeneralInfo
              formData={formData}
              updateField={updateField}
              updateArrayField={updateArrayField}
            />
          )}
          
          {currentStep === 3 && (
            <Step3MedicalInfo
              formData={formData}
              updateField={updateField}
              updateArrayField={updateArrayField}
            />
          )}
          
          {currentStep === 4 && (
            <Step4ProblemsSolutions
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
