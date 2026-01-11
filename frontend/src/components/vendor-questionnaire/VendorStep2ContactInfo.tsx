"use client";

import { useState } from "react";
import { VendorStepProps } from "./types";
import { FormField, Input } from "../questionnaire/FormField";
import { StyledSelect } from "../questionnaire/StyledSelect";
import { ContactTimeSelector } from "../questionnaire/ContactTimeSelector";
import { Plus, X } from "lucide-react";

const PREFERRED_CONTACT_METHODS = ["Email", "Phone", "Video Call", "In-Person"];

export const VendorStep2ContactInfo = ({ formData, updateField }: VendorStepProps) => {
  const [showAdditionalContact, setShowAdditionalContact] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-zinc-900">Contact Information</h3>
        <p className="text-sm text-zinc-600 leading-relaxed">
          How can institutions reach you?
        </p>
      </div>

      <div className="space-y-6 p-6 bg-blue-50/50 rounded-2xl border border-blue-200">
        <div className="space-y-4 p-4 bg-white rounded-xl border border-blue-100">
          <div className="flex items-center justify-between">
            <h5 className="font-semibold text-zinc-900">Primary Contact</h5>
            <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Required</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Name" required>
              <Input
                type="text"
                value={formData.primaryContactName}
                onChange={(e) => updateField("primaryContactName", e.target.value)}
                placeholder="Full name"
                required
              />
            </FormField>
            
            <FormField label="Title" required>
              <Input
                type="text"
                value={formData.primaryContactTitle}
                onChange={(e) => updateField("primaryContactTitle", e.target.value)}
                placeholder="Job title"
                required
              />
            </FormField>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Email" required>
              <Input
                type="email"
                value={formData.primaryContactEmail}
                onChange={(e) => updateField("primaryContactEmail", e.target.value)}
                placeholder="email@example.com"
                required
              />
            </FormField>
            
            <FormField label="Phone" required>
              <Input
                type="tel"
                value={formData.primaryContactPhone}
                onChange={(e) => updateField("primaryContactPhone", e.target.value)}
                placeholder="+1 (555) 000-0000"
                required
              />
            </FormField>
          </div>
        </div>

        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setShowAdditionalContact(!showAdditionalContact)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-600 
                       hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-200"
          >
            {showAdditionalContact ? (
              <>
                <X className="w-4 h-4" />
                Hide Additional Contact
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Additional Contact
              </>
            )}
          </button>

          {showAdditionalContact && (
            <div className="space-y-4 p-4 bg-white rounded-xl border border-blue-100 animate-in fade-in-50 duration-200">
              <h5 className="font-semibold text-zinc-900">Secondary Contact</h5>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Name">
                  <Input
                    type="text"
                    value={formData.secondaryContactName}
                    onChange={(e) => updateField("secondaryContactName", e.target.value)}
                    placeholder="Full name"
                  />
                </FormField>
                
                <FormField label="Title">
                  <Input
                    type="text"
                    value={formData.secondaryContactTitle}
                    onChange={(e) => updateField("secondaryContactTitle", e.target.value)}
                    placeholder="Job title"
                  />
                </FormField>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Email">
                  <Input
                    type="email"
                    value={formData.secondaryContactEmail}
                    onChange={(e) => updateField("secondaryContactEmail", e.target.value)}
                    placeholder="email@example.com"
                  />
                </FormField>
                
                <FormField label="Phone">
                  <Input
                    type="tel"
                    value={formData.secondaryContactPhone}
                    onChange={(e) => updateField("secondaryContactPhone", e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </FormField>
              </div>
            </div>
          )}
        </div>

        <FormField label="Preferred Contact Method" required>
          <StyledSelect
            value={formData.preferredContactMethod}
            onValueChange={(value) => updateField("preferredContactMethod", value)}
            options={PREFERRED_CONTACT_METHODS}
            placeholder="Select preferred method"
            required
          />
        </FormField>

        <ContactTimeSelector
          days={formData.bestTimeToContactDays}
          startTime={formData.bestTimeToContactStartTime}
          endTime={formData.bestTimeToContactEndTime}
          timeZone={formData.bestTimeToContactTimeZone}
          onDaysChange={(value) => updateField("bestTimeToContactDays", value)}
          onStartTimeChange={(value) => updateField("bestTimeToContactStartTime", value)}
          onEndTimeChange={(value) => updateField("bestTimeToContactEndTime", value)}
          onTimeZoneChange={(value) => updateField("bestTimeToContactTimeZone", value)}
          timeZoneOther={formData.bestTimeToContactTimeZoneOther || ""}
          onTimeZoneOtherChange={(value) => updateField("bestTimeToContactTimeZoneOther", value)}
        />
      </div>
    </div>
  );
};

