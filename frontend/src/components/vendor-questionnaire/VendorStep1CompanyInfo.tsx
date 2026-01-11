"use client";

import { VendorStepProps } from "./types";
import { FormField, Input } from "../questionnaire/FormField";
import { StyledSelect } from "../questionnaire/StyledSelect";
import { US_STATES, COUNTRIES } from "../questionnaire/constants";
import { COMPANY_TYPES, COMPANY_SIZES } from "./constants";

export const VendorStep1CompanyInfo = ({ formData, updateField }: VendorStepProps) => {
  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-zinc-900">Company Information</h3>
        <p className="text-sm text-zinc-600 leading-relaxed">
          Tell us about your company
        </p>
      </div>

      <div className="space-y-6 p-6 bg-zinc-50/50 rounded-2xl border border-zinc-200">
        <FormField label="Company Name" required>
          <Input
            type="text"
            value={formData.companyName}
            onChange={(e) => updateField("companyName", e.target.value)}
            placeholder="Enter your company name"
            required
          />
        </FormField>

        <FormField label="Company Type" required>
          <StyledSelect
            value={formData.companyType}
            onValueChange={(value) => updateField("companyType", value)}
            options={COMPANY_TYPES}
            placeholder="Select company type"
            required
            otherValue={formData.companyTypeOther || ""}
            onOtherValueChange={(value) => updateField("companyTypeOther", value)}
          />
        </FormField>

        <FormField label="Website" required>
          <Input
            type="url"
            value={formData.website}
            onChange={(e) => updateField("website", e.target.value)}
            placeholder="https://example.com"
            required
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormField label="Founded Year" hint="Optional">
            <Input
              type="number"
              value={formData.foundedYear || ""}
              onChange={(e) => updateField("foundedYear", e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="e.g., 2020"
              min="1900"
              max={new Date().getFullYear()}
            />
          </FormField>

          <FormField label="Company Size" required>
            <StyledSelect
              value={formData.companySize}
              onValueChange={(value) => updateField("companySize", value)}
              options={COMPANY_SIZES}
              placeholder="Select company size"
              required
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormField label="State" required>
            <StyledSelect
              value={formData.state}
              onValueChange={(value) => updateField("state", value)}
              options={US_STATES}
              placeholder="Select state"
              required
            />
          </FormField>
          
          <FormField label="Country" required>
            <StyledSelect
              value={formData.country}
              onValueChange={(value) => updateField("country", value)}
              options={COUNTRIES}
              placeholder="Select country"
              required
              otherValue={formData.countryOther || ""}
              onOtherValueChange={(value) => updateField("countryOther", value)}
            />
          </FormField>
        </div>
      </div>
    </div>
  );
};

