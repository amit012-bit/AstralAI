"use client";

import { useState } from "react";
import { StepProps } from "./types";
import { FormField, Input } from "./FormField";
import { StyledSelect } from "./StyledSelect";
import { ContactTimeSelector } from "./ContactTimeSelector";
import { US_STATES, COUNTRIES, INSTITUTION_TYPES } from "./constants";
import { Plus, X } from "lucide-react";

export const Step2GeneralInfo = ({ formData, updateField }: StepProps) => {
  const [showAdditionalContact, setShowAdditionalContact] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Section Header */}
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-zinc-900">General Information</h3>
        <p className="text-sm text-zinc-600 leading-relaxed">
          Tell us about your institution and how to reach you
        </p>
      </div>

      <div className="space-y-6">
        {/* Institution Details */}
        <div className="space-y-6 p-6 bg-zinc-50/50 rounded-2xl border border-zinc-200">
          <h4 className="text-lg font-semibold text-zinc-900">Institution Details</h4>
          
          <FormField label="Institution Name" required>
            <Input
              type="text"
              value={formData.institutionName}
              onChange={(e) => updateField("institutionName", e.target.value)}
              placeholder="Enter your institution name"
              required
            />
          </FormField>

          <FormField label="Institution Type" required>
            <StyledSelect
              value={formData.institutionType}
              onValueChange={(value) => updateField("institutionType", value)}
              options={INSTITUTION_TYPES}
              placeholder="Select institution type"
              required
              otherValue={formData.institutionTypeOther || ""}
              onOtherValueChange={(value) => updateField("institutionTypeOther", value)}
            />
          </FormField>

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

        {/* Contact Information */}
        <div className="space-y-6 p-6 bg-blue-50/50 rounded-2xl border border-blue-200">
          <h4 className="text-lg font-semibold text-zinc-900">Contact Information</h4>
          
          {/* Primary Contact */}
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

          {/* Additional Contact */}
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
              <div className="space-y-4 p-4 bg-white rounded-xl border border-zinc-200 animate-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between">
                  <h5 className="font-semibold text-zinc-900">Additional Contact</h5>
                  <button
                    type="button"
                    onClick={() => setShowAdditionalContact(false)}
                    className="p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
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

          {/* Contact Preferences */}
          <div className="space-y-6 pt-4 border-t border-blue-200">
            <FormField 
              label="Preferred Contact Method"
              hint="How would you like us to reach you?"
            >
              <StyledSelect
                value={formData.preferredContactMethod}
                onValueChange={(value) => updateField("preferredContactMethod", value)}
                options={["Email", "Phone", "Video Call", "In-Person"]}
                placeholder="Select contact method"
              />
            </FormField>
            
            <div>
              <div className="space-y-2 mb-4">
                <label className="block text-sm font-medium text-zinc-900 leading-5">
                  Best Time to Contact
                </label>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Specify your preferred contact times
                </p>
              </div>
              <ContactTimeSelector
                days={formData.bestTimeToContactDays || ""}
                startTime={formData.bestTimeToContactStartTime || ""}
                endTime={formData.bestTimeToContactEndTime || ""}
                timeZone={formData.bestTimeToContactTimeZone || ""}
                timeZoneOther={formData.bestTimeToContactTimeZoneOther || ""}
                onDaysChange={(value) => updateField("bestTimeToContactDays", value)}
                onStartTimeChange={(value) => updateField("bestTimeToContactStartTime", value)}
                onEndTimeChange={(value) => updateField("bestTimeToContactEndTime", value)}
                onTimeZoneChange={(value) => updateField("bestTimeToContactTimeZone", value)}
                onTimeZoneOtherChange={(value) => updateField("bestTimeToContactTimeZoneOther", value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

