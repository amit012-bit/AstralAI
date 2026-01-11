"use client";

import { StepProps } from "./types";
import { FormField } from "./FormField";
import { StyledSelect } from "./StyledSelect";
import { MultiSelect } from "./MultiSelect";
import { PRIMARY_CHALLENGES, SOLUTION_AREAS, BUDGET_RANGES, TIMELINE_OPTIONS, PAIN_POINTS_OPTIONS, GOALS_OPTIONS, MUST_HAVE_FEATURES_OPTIONS, NICE_TO_HAVE_FEATURES_OPTIONS, PROCUREMENT_PROCESS_OPTIONS } from "./constants";

export const Step4ProblemsSolutions = ({ formData, updateField, updateArrayField }: StepProps) => {
  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Section Header */}
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-zinc-900">Problems & AI Solutions Needed</h3>
        <p className="text-sm text-zinc-600 leading-relaxed">
          Help us understand your challenges and what AI solutions you're looking for
        </p>
      </div>

      <div className="space-y-6">
        {/* Challenges & Goals */}
        <div className="space-y-6 p-6 bg-zinc-50/50 rounded-2xl border border-zinc-200">
          <h4 className="text-lg font-semibold text-zinc-900">Challenges & Goals</h4>
          
          <MultiSelect
            label="Primary Challenges"
            required
            hint="Type to search and select all challenges your institution is facing"
            value={formData.primaryChallenges || []}
            onValueChange={(values) => updateField("primaryChallenges", values)}
            options={PRIMARY_CHALLENGES}
            placeholder="Type to search challenges..."
            otherValue={formData.primaryChallengesOther || ""}
            onOtherValueChange={(value) => updateField("primaryChallengesOther", value)}
          />

          <MultiSelect
            label="Current Pain Points"
            required
            hint="Type to search and select all main challenges your institution is facing that AI solutions could help solve"
            value={formData.currentPainPoints || []}
            onValueChange={(values) => updateField("currentPainPoints", values)}
            options={PAIN_POINTS_OPTIONS}
            placeholder="Type to search pain points..."
            otherValue={formData.currentPainPointsOther || ""}
            onOtherValueChange={(value) => updateField("currentPainPointsOther", value)}
          />

          <MultiSelect
            label="Goals & Objectives"
            required
            hint="Type to search and select all primary goals for implementing AI solutions"
            value={formData.goals || []}
            onValueChange={(values) => updateField("goals", values)}
            options={GOALS_OPTIONS}
            placeholder="Type to search goals..."
            otherValue={formData.goalsOther || ""}
            onOtherValueChange={(value) => updateField("goalsOther", value)}
          />
        </div>

        {/* Solution Requirements */}
        <div className="space-y-6 p-6 bg-blue-50/50 rounded-2xl border border-blue-200">
          <h4 className="text-lg font-semibold text-zinc-900">Solution Requirements</h4>
          
          <MultiSelect
            label="Interested Solution Areas"
            required
            hint="Type to search and select all solution areas you're interested in"
            value={formData.interestedSolutionAreas}
            onValueChange={(values) => updateField("interestedSolutionAreas", values)}
            options={SOLUTION_AREAS}
            placeholder="Type to search solution areas..."
          />

          <MultiSelect
            label="Must-Have Features"
            required
            hint="Type to search and select all must-have features"
            value={formData.mustHaveFeatures || []}
            onValueChange={(values) => updateField("mustHaveFeatures", values)}
            options={MUST_HAVE_FEATURES_OPTIONS}
            placeholder="Type to search features..."
            otherValue={formData.mustHaveFeaturesOther || ""}
            onOtherValueChange={(value) => updateField("mustHaveFeaturesOther", value)}
          />

          <MultiSelect
            label="Nice-to-Have Features"
            hint="Type to search and select all nice-to-have features"
            value={formData.niceToHaveFeatures || []}
            onValueChange={(values) => updateField("niceToHaveFeatures", values)}
            options={NICE_TO_HAVE_FEATURES_OPTIONS}
            placeholder="Type to search features..."
            otherValue={formData.niceToHaveFeaturesOther || ""}
            onOtherValueChange={(value) => updateField("niceToHaveFeaturesOther", value)}
          />
        </div>

        {/* Budget & Timeline */}
        <div className="space-y-6 p-6 bg-teal-50/50 rounded-2xl border border-teal-200">
          <h4 className="text-lg font-semibold text-zinc-900">Budget & Timeline</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField label="Budget Range" required>
              <StyledSelect
                value={formData.budgetRange}
                onValueChange={(value) => updateField("budgetRange", value)}
                options={BUDGET_RANGES}
                placeholder="Select budget range"
                required
              />
            </FormField>
            
            <FormField label="Implementation Timeline" required>
              <StyledSelect
                value={formData.timeline}
                onValueChange={(value) => updateField("timeline", value)}
                options={TIMELINE_OPTIONS}
                placeholder="Select timeline"
                required
              />
            </FormField>
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-6 p-6 bg-amber-50/50 rounded-2xl border border-amber-200">
          <h4 className="text-lg font-semibold text-zinc-900">Additional Information</h4>
          
          <MultiSelect
            label="Procurement Process"
            required
            hint="Type to search and select all steps in your procurement and approval process"
            value={formData.procurementProcess || []}
            onValueChange={(values) => updateField("procurementProcess", values)}
            options={PROCUREMENT_PROCESS_OPTIONS}
            placeholder="Type to search procurement steps..."
            otherValue={formData.procurementProcessOther || ""}
            onOtherValueChange={(value) => updateField("procurementProcessOther", value)}
          />
        </div>
      </div>
    </div>
  );
};

