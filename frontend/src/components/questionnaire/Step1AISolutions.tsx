"use client";

import { StepProps } from "./types";
import { CheckboxGroup } from "./CheckboxGroup";
import { AI_SOLUTIONS_OPTIONS } from "./constants";

export const Step1AISolutions = ({ formData, updateField }: StepProps) => {
  const handleSolutionChange = (value: string, checked: boolean) => {
    const currentSolutions = formData.selectedAISolutions || [];
    if (checked) {
      updateField("selectedAISolutions", [...currentSolutions, value]);
    } else {
      updateField("selectedAISolutions", currentSolutions.filter((item) => item !== value));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Section Header */}
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-zinc-900">AI Solutions Available</h3>
      </div>

      <div className="space-y-6">
        {/* AI Solutions Available */}
        <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50/50 to-teal-50/50 rounded-2xl border border-blue-200">
          <CheckboxGroup
            label="General AI solutions you might be looking for ??"
            options={AI_SOLUTIONS_OPTIONS}
            selectedValues={formData.selectedAISolutions || []}
            onChange={handleSolutionChange}
            columns={3}
          />
        </div>
      </div>
    </div>
  );
};

