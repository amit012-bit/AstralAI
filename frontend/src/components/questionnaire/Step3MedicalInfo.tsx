"use client";

import { StepProps } from "./types";
import { FormField, Textarea } from "./FormField";
import { StyledSelect } from "./StyledSelect";
import { MultiSelect } from "./MultiSelect";
import { DataSharingQuestions } from "./DataSharingQuestions";
import { MEDICAL_SPECIALTIES, PATIENT_VOLUME_OPTIONS, CURRENT_SYSTEMS, COMPLIANCE_OPTIONS, INTEGRATION_REQUIREMENTS_OPTIONS, DATA_SECURITY_NEEDS_OPTIONS } from "./constants";

export const Step3MedicalInfo = ({ formData, updateField, updateArrayField }: StepProps) => {
  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Section Header */}
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-zinc-900">Medical Information</h3>
        <p className="text-sm text-zinc-600 leading-relaxed">
          Tell us about your medical operations and technical infrastructure
        </p>
      </div>

      <div className="space-y-6">
        {/* Technical Infrastructure */}
        <div className="space-y-6 p-6 bg-blue-50/50 rounded-2xl border border-blue-200">
          <h4 className="text-lg font-semibold text-zinc-900">Technical Infrastructure</h4>
          
          <MultiSelect
            label="Current Systems in Use"
            required
            hint="Type to search and select all systems currently in use at your institution"
            value={formData.currentSystems}
            onValueChange={(values) => updateField("currentSystems", values)}
            options={CURRENT_SYSTEMS}
            placeholder="Type to search systems..."
            otherValue={formData.currentSystemsOther || ""}
            onOtherValueChange={(value) => updateField("currentSystemsOther", value)}
          />

          <MultiSelect
            label="Compliance Requirements"
            required
            hint="Type to search and select all compliance standards you need to meet"
            value={formData.complianceRequirements}
            onValueChange={(values) => updateField("complianceRequirements", values)}
            options={COMPLIANCE_OPTIONS}
            placeholder="Type to search compliance standards..."
            otherValue={formData.complianceOther || ""}
            onOtherValueChange={(value) => updateField("complianceOther", value)}
          />

          <DataSharingQuestions
            formData={formData}
            updateField={updateField}
            updateArrayField={updateArrayField}
          />
        </div>

        {/* Medical Operations */}
        <div className="space-y-6 p-6 bg-zinc-50/50 rounded-2xl border border-zinc-200">
          <h4 className="text-lg font-semibold text-zinc-900">Medical Operations</h4>
          
          <MultiSelect
            label="Medical Specialties"
            required
            hint="Type to search and select all specialties your institution offers"
            value={formData.medicalSpecialties}
            onValueChange={(values) => updateField("medicalSpecialties", values)}
            options={MEDICAL_SPECIALTIES}
            placeholder="Type to search specialties..."
            otherValue={formData.medicalSpecialtiesOther || ""}
            onOtherValueChange={(value) => updateField("medicalSpecialtiesOther", value)}
          />

          <FormField 
            label="Patient Volume" 
            required
            hint="Average number of patients per month"
          >
            <StyledSelect
              value={formData.patientVolume}
              onValueChange={(value) => updateField("patientVolume", value)}
              options={PATIENT_VOLUME_OPTIONS}
              placeholder="Select patient volume"
              required
            />
          </FormField>
        </div>

        {/* Integration & Security */}
        <div className="space-y-6 p-6 bg-teal-50/50 rounded-2xl border border-teal-200">
          <h4 className="text-lg font-semibold text-zinc-900">Integration & Security</h4>
          
          <MultiSelect
            label="Integration Requirements"
            required
            hint="Type to search and select all integration requirements with existing systems"
            value={formData.integrationRequirements || []}
            onValueChange={(values) => updateField("integrationRequirements", values)}
            options={INTEGRATION_REQUIREMENTS_OPTIONS}
            placeholder="Type to search integration requirements..."
            otherValue={formData.integrationRequirementsOther || ""}
            onOtherValueChange={(value) => updateField("integrationRequirementsOther", value)}
          />

          <MultiSelect
            label="Data Security Needs"
            required
            hint="Type to search and select all data security and privacy requirements"
            value={formData.dataSecurityNeeds || []}
            onValueChange={(values) => updateField("dataSecurityNeeds", values)}
            options={DATA_SECURITY_NEEDS_OPTIONS}
            placeholder="Type to search security requirements..."
            otherValue={formData.dataSecurityNeedsOther || ""}
            onOtherValueChange={(value) => updateField("dataSecurityNeedsOther", value)}
          />
        </div>
      </div>
    </div>
  );
};

