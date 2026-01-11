"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "./FormField";

interface StyledSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  placeholder: string;
  required?: boolean;
  className?: string;
  error?: boolean;
  otherValue?: string;
  onOtherValueChange?: (value: string) => void;
}

export const StyledSelect = ({
  value,
  onValueChange,
  options,
  placeholder,
  required = false,
  className = "",
  error = false,
  otherValue = "",
  onOtherValueChange,
}: StyledSelectProps) => {
  const showOtherInput = value === "Other" && onOtherValueChange;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="relative rounded-2xl bg-white border border-zinc-300">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-zinc-400 z-10">
          ●
        </span>
        <Select value={value || undefined} onValueChange={onValueChange} required={required}>
          <SelectTrigger 
            className={`
              w-full rounded-[16px] border bg-white px-7 py-3 text-sm font-semibold text-zinc-900 
              transition-all duration-200 hover:border-zinc-400 pl-7
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              [&[data-placeholder]]:font-normal
              ${error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-zinc-300"}
            `}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="bg-white border border-zinc-300 rounded-xl">
            {options.map((option) => (
              <SelectItem
                key={option}
                value={option}
                className="text-zinc-900 bg-white hover:bg-zinc-50 focus:bg-zinc-50 cursor-pointer transition-colors"
              >
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {showOtherInput && (
        <div className="animate-in slide-in-from-top-2 duration-200">
          <Input
            type="text"
            value={otherValue}
            onChange={(e) => onOtherValueChange?.(e.target.value)}
            placeholder="Please specify..."
            required={required}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
};

