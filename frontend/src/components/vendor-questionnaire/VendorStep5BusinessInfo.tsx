"use client";

import { VendorStepProps } from "./types";
import { FormField, Input } from "../questionnaire/FormField";
import { MultiSelect } from "../questionnaire/MultiSelect";
import { StyledSelect } from "../questionnaire/StyledSelect";
import { PRICING_MODELS, PRICING_RANGES, CONTRACT_TERMS, IMPLEMENTATION_TIME_OPTIONS, SUPPORT_OPTIONS, TRAINING_OPTIONS } from "./constants";

export const VendorStep5BusinessInfo = ({ formData, updateField }: VendorStepProps) => {
  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-zinc-900">Business Information</h3>
        <p className="text-sm text-zinc-600 leading-relaxed">
          Tell us about your pricing, contracts, and support offerings
        </p>
      </div>

      <div className="space-y-6 p-6 bg-zinc-50/50 rounded-2xl border border-zinc-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormField label="Pricing Model" required>
            <StyledSelect
              value={formData.pricingModel}
              onValueChange={(value) => updateField("pricingModel", value)}
              options={PRICING_MODELS}
              placeholder="Select pricing model"
              required
              otherValue={formData.pricingModelOther || ""}
              onOtherValueChange={(value) => updateField("pricingModelOther", value)}
            />
          </FormField>

          <FormField label="Pricing Range" required>
            <StyledSelect
              value={formData.pricingRange}
              onValueChange={(value) => updateField("pricingRange", value)}
              options={PRICING_RANGES}
              placeholder="Select pricing range"
              required
            />
          </FormField>
        </div>

        <FormField label="Contract Terms" required hint="Select all contract terms you offer">
          <MultiSelect
            value={formData.contractTerms}
            onValueChange={(value) => updateField("contractTerms", value)}
            options={CONTRACT_TERMS}
            placeholder="Type to search and select contract terms"
            required
            otherValue={formData.contractTermsOther || ""}
            onOtherValueChange={(value) => updateField("contractTermsOther", value)}
          />
        </FormField>

        <FormField label="Implementation Time" required>
          <StyledSelect
            value={formData.implementationTime}
            onValueChange={(value) => updateField("implementationTime", value)}
            options={IMPLEMENTATION_TIME_OPTIONS}
            placeholder="Select implementation time"
            required
          />
        </FormField>

        <FormField label="Support Offered" required hint="Select all support options you provide">
          <MultiSelect
            value={formData.supportOffered}
            onValueChange={(value) => updateField("supportOffered", value)}
            options={SUPPORT_OPTIONS}
            placeholder="Type to search and select support options"
            required
            otherValue={formData.supportOfferedOther || ""}
            onOtherValueChange={(value) => updateField("supportOfferedOther", value)}
          />
        </FormField>

        <FormField label="Training Provided" required hint="Select all training options you provide">
          <MultiSelect
            value={formData.trainingProvided}
            onValueChange={(value) => updateField("trainingProvided", value)}
            options={TRAINING_OPTIONS}
            placeholder="Type to search and select training options"
            required
            otherValue={formData.trainingProvidedOther || ""}
            onOtherValueChange={(value) => updateField("trainingProvidedOther", value)}
          />
        </FormField>
      </div>
    </div>
  );
};

