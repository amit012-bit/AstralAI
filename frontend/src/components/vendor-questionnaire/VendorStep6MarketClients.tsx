"use client";

import { VendorStepProps } from "./types";
import { FormField, Input, Textarea } from "../questionnaire/FormField";
import { MultiSelect } from "../questionnaire/MultiSelect";
import { CLIENT_TYPES } from "./constants";

export const VendorStep6MarketClients = ({ formData, updateField }: VendorStepProps) => {
  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-zinc-900">Market & Clients</h3>
        <p className="text-sm text-zinc-600 leading-relaxed">
          Tell us about your current clients and market presence
        </p>
      </div>

      <div className="space-y-6 p-6 bg-zinc-50/50 rounded-2xl border border-zinc-200">
        <FormField label="Current Client Types" hint="Select types of clients you currently serve">
          <MultiSelect
            value={formData.currentClients}
            onValueChange={(value) => updateField("currentClients", value)}
            options={CLIENT_TYPES}
            placeholder="Type to search and select client types"
            otherValue={formData.currentClientsOther || ""}
            onOtherValueChange={(value) => updateField("currentClientsOther", value)}
          />
        </FormField>

        <FormField label="Number of Clients" hint="Approximate number of active clients">
          <Input
            type="number"
            value={formData.clientCount || ""}
            onChange={(e) => updateField("clientCount", e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="e.g., 50"
            min="0"
          />
        </FormField>

        <FormField label="Case Studies" hint="Links or descriptions of case studies">
          <Textarea
            value={formData.caseStudies}
            onChange={(e) => updateField("caseStudies", e.target.value)}
            placeholder="Provide links or descriptions of case studies showcasing your solution's success..."
            rows={4}
          />
        </FormField>

        <FormField label="Testimonials" hint="Client testimonials or quotes">
          <Textarea
            value={formData.testimonials}
            onChange={(e) => updateField("testimonials", e.target.value)}
            placeholder="Share testimonials from satisfied clients..."
            rows={4}
          />
        </FormField>

        <FormField label="Awards & Recognition" hint="Select or type awards your solution has received">
          <MultiSelect
            value={formData.awards}
            onValueChange={(value) => updateField("awards", value)}
            options={[]}
            placeholder="Type and press Enter to add awards"
            otherValue={formData.awardsOther || ""}
            onOtherValueChange={(value) => updateField("awardsOther", value)}
          />
        </FormField>
      </div>
    </div>
  );
};

