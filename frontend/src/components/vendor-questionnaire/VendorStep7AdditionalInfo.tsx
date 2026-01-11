"use client";

import { VendorStepProps } from "./types";
import { FormField, Textarea } from "../questionnaire/FormField";
import { MultiSelect } from "../questionnaire/MultiSelect";
import { COMPETITIVE_ADVANTAGES_OPTIONS } from "./constants";

export const VendorStep7AdditionalInfo = ({ formData, updateField }: VendorStepProps) => {
  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-zinc-900">Additional Information</h3>
        <p className="text-sm text-zinc-600 leading-relaxed">
          Share any additional information about your solution
        </p>
      </div>

      <div className="space-y-6 p-6 bg-zinc-50/50 rounded-2xl border border-zinc-200">
        <FormField label="Competitive Advantages" hint="What makes your solution stand out?">
          <MultiSelect
            value={formData.competitiveAdvantages}
            onValueChange={(value) => updateField("competitiveAdvantages", value)}
            options={COMPETITIVE_ADVANTAGES_OPTIONS}
            placeholder="Type to search and select advantages"
            otherValue={formData.competitiveAdvantagesOther || ""}
            onOtherValueChange={(value) => updateField("competitiveAdvantagesOther", value)}
          />
        </FormField>

        <FormField label="Future Roadmap" hint="Share your plans for future development">
          <Textarea
            value={formData.futureRoadmap}
            onChange={(e) => updateField("futureRoadmap", e.target.value)}
            placeholder="Describe upcoming features, improvements, or strategic direction..."
            rows={6}
          />
        </FormField>

        <FormField label="Additional Notes" hint="Any other information you'd like to share">
          <Textarea
            value={formData.additionalNotes}
            onChange={(e) => updateField("additionalNotes", e.target.value)}
            placeholder="Add any additional information that might be helpful..."
            rows={6}
          />
        </FormField>
      </div>
    </div>
  );
};

