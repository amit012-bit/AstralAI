"use client";

import { VendorStepProps } from "./types";
import { FormField, Textarea } from "../questionnaire/FormField";
import { MultiSelect } from "../questionnaire/MultiSelect";
import { COMPLIANCE_CERTIFICATIONS, SECURITY_FEATURES_OPTIONS } from "./constants";

export const VendorStep4ComplianceSecurity = ({ formData, updateField }: VendorStepProps) => {
  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-zinc-900">Compliance & Security</h3>
        <p className="text-sm text-zinc-600 leading-relaxed">
          Tell us about your compliance certifications and security features
        </p>
      </div>

      <div className="space-y-6 p-6 bg-zinc-50/50 rounded-2xl border border-zinc-200">
        <FormField label="Compliance Certifications" required hint="Select all certifications your solution has">
          <MultiSelect
            value={formData.complianceCertifications}
            onValueChange={(value) => updateField("complianceCertifications", value)}
            options={COMPLIANCE_CERTIFICATIONS}
            placeholder="Type to search and select certifications"
            required
            otherValue={formData.complianceCertificationsOther || ""}
            onOtherValueChange={(value) => updateField("complianceCertificationsOther", value)}
          />
        </FormField>

        <FormField label="Security Features" required hint="Select all security features your solution provides">
          <MultiSelect
            value={formData.securityFeatures}
            onValueChange={(value) => updateField("securityFeatures", value)}
            options={SECURITY_FEATURES_OPTIONS}
            placeholder="Type to search and select security features"
            required
            otherValue={formData.securityFeaturesOther || ""}
            onOtherValueChange={(value) => updateField("securityFeaturesOther", value)}
          />
        </FormField>

        <FormField label="Data Handling" required hint="Describe how your solution handles patient data">
          <Textarea
            value={formData.dataHandling}
            onChange={(e) => updateField("dataHandling", e.target.value)}
            placeholder="Explain your data storage, processing, and privacy practices..."
            rows={6}
            required
          />
        </FormField>
      </div>
    </div>
  );
};

