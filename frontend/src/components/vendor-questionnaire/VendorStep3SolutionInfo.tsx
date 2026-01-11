"use client";

import { VendorStepProps } from "./types";
import { FormField, Input, Textarea } from "../questionnaire/FormField";
import { MultiSelect } from "../questionnaire/MultiSelect";
import { StyledSelect } from "../questionnaire/StyledSelect";
import { SOLUTION_CATEGORIES, DEPLOYMENT_OPTIONS } from "./constants";
import { MEDICAL_SPECIALTIES, INSTITUTION_TYPES } from "../questionnaire/constants";
import { TECHNOLOGY_STACK_OPTIONS, INTEGRATION_CAPABILITIES_OPTIONS } from "./constants";

export const VendorStep3SolutionInfo = ({ formData, updateField, updateArrayField }: VendorStepProps) => {
  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-zinc-900">Solution Information</h3>
        <p className="text-sm text-zinc-600 leading-relaxed">
          Tell us about your AI solution
        </p>
      </div>

      <div className="space-y-6 p-6 bg-zinc-50/50 rounded-2xl border border-zinc-200">
        <FormField label="Solution Name" required>
          <Input
            type="text"
            value={formData.solutionName}
            onChange={(e) => updateField("solutionName", e.target.value)}
            placeholder="Enter your solution name"
            required
          />
        </FormField>

        <FormField label="Solution Description" required hint="Provide a detailed description of your solution">
          <Textarea
            value={formData.solutionDescription}
            onChange={(e) => updateField("solutionDescription", e.target.value)}
            placeholder="Describe what your solution does, its key benefits, and how it helps healthcare institutions..."
            rows={6}
            required
          />
        </FormField>

        <FormField label="Solution Category" required hint="Select all that apply">
          <MultiSelect
            value={formData.solutionCategory}
            onValueChange={(value) => updateField("solutionCategory", value)}
            options={SOLUTION_CATEGORIES}
            placeholder="Type to search and select categories"
            required
            otherValue={formData.solutionCategoryOther || ""}
            onOtherValueChange={(value) => updateField("solutionCategoryOther", value)}
          />
        </FormField>

        <FormField label="Target Medical Specialties" hint="Select all specialties your solution serves">
          <MultiSelect
            value={formData.targetSpecialties}
            onValueChange={(value) => updateField("targetSpecialties", value)}
            options={MEDICAL_SPECIALTIES}
            placeholder="Type to search and select specialties"
            otherValue={formData.targetSpecialtiesOther || ""}
            onOtherValueChange={(value) => updateField("targetSpecialtiesOther", value)}
          />
        </FormField>

        <FormField label="Target Institution Types" hint="Select all institution types you serve">
          <MultiSelect
            value={formData.targetInstitutionTypes}
            onValueChange={(value) => updateField("targetInstitutionTypes", value)}
            options={INSTITUTION_TYPES}
            placeholder="Type to search and select institution types"
            otherValue={formData.targetInstitutionTypesOther || ""}
            onOtherValueChange={(value) => updateField("targetInstitutionTypesOther", value)}
          />
        </FormField>

        <FormField label="Key Features" required hint="Select or type the main features of your solution">
          <MultiSelect
            value={formData.keyFeatures}
            onValueChange={(value) => updateField("keyFeatures", value)}
            options={[]}
            placeholder="Type and press Enter to add features"
            required
            otherValue={formData.keyFeaturesOther || ""}
            onOtherValueChange={(value) => updateField("keyFeaturesOther", value)}
          />
        </FormField>

        <FormField label="Technology Stack" hint="Select technologies used in your solution">
          <MultiSelect
            value={formData.technologyStack}
            onValueChange={(value) => updateField("technologyStack", value)}
            options={TECHNOLOGY_STACK_OPTIONS}
            placeholder="Type to search and select technologies"
            otherValue={formData.technologyStackOther || ""}
            onOtherValueChange={(value) => updateField("technologyStackOther", value)}
          />
        </FormField>

        <FormField label="Deployment Options" required hint="Select all deployment options you support">
          <MultiSelect
            value={formData.deploymentOptions}
            onValueChange={(value) => updateField("deploymentOptions", value)}
            options={DEPLOYMENT_OPTIONS}
            placeholder="Select deployment options"
            required
          />
        </FormField>

        <FormField label="Integration Capabilities" hint="Select integration methods your solution supports">
          <MultiSelect
            value={formData.integrationCapabilities}
            onValueChange={(value) => updateField("integrationCapabilities", value)}
            options={INTEGRATION_CAPABILITIES_OPTIONS}
            placeholder="Type to search and select integration capabilities"
            otherValue={formData.integrationCapabilitiesOther || ""}
            onOtherValueChange={(value) => updateField("integrationCapabilitiesOther", value)}
          />
        </FormField>
      </div>
    </div>
  );
};

