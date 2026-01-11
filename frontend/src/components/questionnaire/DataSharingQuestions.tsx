"use client";

import { StepProps } from "./types";
import { FormField } from "./FormField";
import { StyledSelect } from "./StyledSelect";
import { MultiSelect } from "./MultiSelect";

const WILLINGNESS_OPTIONS = [
  "Yes, we are willing to share data",
  "Yes, but with restrictions",
  "Maybe, depending on requirements",
  "No, we cannot share data"
];

const DATA_TYPES_OPTIONS = [
  "Patient demographics",
  "Clinical data (anonymized)",
  "Operational metrics",
  "Financial data",
  "System integration data",
  "Workflow data",
  "Quality metrics",
  "Other"
];

const DATA_FORMAT_OPTIONS = [
  "API integration",
  "File export (CSV, Excel)",
  "Database access (read-only)",
  "HL7 FHIR format",
  "Custom format",
  "Other"
];

const DATA_SECURITY_OPTIONS = [
  "End-to-end encryption required",
  "On-premise deployment only",
  "HIPAA compliance required",
  "Data anonymization required",
  "Audit trail required",
  "Limited access controls",
  "Other"
];

const TIMELINE_OPTIONS = [
  "Immediate",
  "Within 1 week",
  "Within 1 month",
  "Within 3 months",
  "After solution selection",
  "To be determined"
];

export const DataSharingQuestions = ({ formData, updateField, updateArrayField }: StepProps) => {
  return (
    <div className="space-y-6 pt-4 border-t border-blue-200">
      <div className="space-y-2 mb-4">
        <h5 className="text-base font-semibold text-zinc-900">
          Data Sharing & Information Access
        </h5>
        <p className="text-xs text-zinc-500">
          Help us understand your willingness and requirements for sharing information from your systems
        </p>
      </div>

      <FormField 
        label="Are you willing to share information from your systems if required?"
        required
        hint="This information helps us evaluate and implement solutions effectively"
      >
        <StyledSelect
          value={formData.willingToShareData || ""}
          onValueChange={(value) => updateField("willingToShareData", value)}
          options={WILLINGNESS_OPTIONS}
          placeholder="Select your response"
          required
        />
      </FormField>

      {formData.willingToShareData && formData.willingToShareData !== "No, we cannot share data" && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <MultiSelect
            label="What types of data are you willing to share?"
            hint="Select all applicable data types"
            value={formData.dataTypesToShare || []}
            onValueChange={(values) => updateField("dataTypesToShare", values)}
            options={DATA_TYPES_OPTIONS}
            placeholder="Type to search data types..."
            otherValue={formData.dataTypesToShareOther || ""}
            onOtherValueChange={(value) => updateField("dataTypesToShareOther", value)}
          />

          <FormField 
            label="Preferred data sharing format"
            hint="How would you prefer to share the data?"
          >
            <StyledSelect
              value={formData.dataSharingFormat || ""}
              onValueChange={(value) => updateField("dataSharingFormat", value)}
              options={DATA_FORMAT_OPTIONS}
              placeholder="Select data format"
              otherValue={formData.dataSharingFormatOther || ""}
              onOtherValueChange={(value) => updateField("dataSharingFormatOther", value)}
            />
          </FormField>

          <MultiSelect
            label="Security requirements for data sharing"
            hint="Select all security requirements that must be met"
            value={formData.dataSharingSecurityRequirements || []}
            onValueChange={(values) => updateField("dataSharingSecurityRequirements", values)}
            options={DATA_SECURITY_OPTIONS}
            placeholder="Type to search security requirements..."
            otherValue={formData.dataSharingSecurityOther || ""}
            onOtherValueChange={(value) => updateField("dataSharingSecurityOther", value)}
          />

          <FormField 
            label="Timeline for data sharing"
            hint="When can you begin sharing data?"
          >
            <StyledSelect
              value={formData.dataSharingTimeline || ""}
              onValueChange={(value) => updateField("dataSharingTimeline", value)}
              options={TIMELINE_OPTIONS}
              placeholder="Select timeline"
            />
          </FormField>

          <FormField 
            label="Data sharing restrictions or limitations"
            hint="Select any restrictions, limitations, or special considerations for data sharing"
          >
            <StyledSelect
              value={formData.dataSharingRestrictions || ""}
              onValueChange={(value) => updateField("dataSharingRestrictions", value)}
              options={[
                "No restrictions",
                "Only anonymized data",
                "Requires board approval",
                "Specific data fields excluded",
                "Limited time period",
                "Limited scope",
                "Other"
              ]}
              placeholder="Select restrictions"
              otherValue={formData.dataSharingRestrictionsOther || ""}
              onOtherValueChange={(value) => updateField("dataSharingRestrictionsOther", value)}
            />
          </FormField>
        </div>
      )}
    </div>
  );
};

