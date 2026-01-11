"use client";

import { FormField } from "./FormField";
import { StyledSelect } from "./StyledSelect";
import { Input } from "./FormField";

interface ContactTimeSelectorProps {
  days: string;
  startTime: string;
  endTime: string;
  timeZone: string;
  timeZoneOther?: string;
  onDaysChange: (value: string) => void;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  onTimeZoneChange: (value: string) => void;
  onTimeZoneOtherChange?: (value: string) => void;
}

const DAYS_OPTIONS = ["Weekdays", "Weekends", "All Days"];
const TIME_ZONES = [
  "EST (Eastern Standard Time)",
  "CST (Central Standard Time)",
  "MST (Mountain Standard Time)",
  "PST (Pacific Standard Time)",
  "AKST (Alaska Standard Time)",
  "HST (Hawaii Standard Time)",
  "UTC (Coordinated Universal Time)",
  "Other"
];

export const ContactTimeSelector = ({
  days,
  startTime,
  endTime,
  timeZone,
  timeZoneOther = "",
  onDaysChange,
  onStartTimeChange,
  onEndTimeChange,
  onTimeZoneChange,
  onTimeZoneOtherChange,
}: ContactTimeSelectorProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField 
          label="Available Days"
          hint="Select when you're available"
        >
          <StyledSelect
            value={days}
            onValueChange={onDaysChange}
            options={DAYS_OPTIONS}
            placeholder="Select days"
          />
        </FormField>

        <FormField 
          label="Time Zone"
          hint="Select your time zone"
        >
          <StyledSelect
            value={timeZone}
            onValueChange={onTimeZoneChange}
            options={TIME_ZONES}
            placeholder="Select time zone"
            otherValue={timeZoneOther}
            onOtherValueChange={onTimeZoneOtherChange}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField 
          label="Start Time"
          hint="e.g., 09:00"
        >
          <Input
            type="time"
            value={startTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
            placeholder="09:00"
            className="w-full"
          />
        </FormField>

        <FormField 
          label="End Time"
          hint="e.g., 17:00"
        >
          <Input
            type="time"
            value={endTime}
            onChange={(e) => onEndTimeChange(e.target.value)}
            placeholder="17:00"
            className="w-full"
          />
        </FormField>
      </div>
    </div>
  );
};

