"use client";

import { FormField, Input } from "./FormField";

interface CheckboxGroupProps {
  label: string;
  required?: boolean;
  hint?: string;
  options: string[];
  selectedValues: string[];
  onChange: (value: string, checked: boolean) => void;
  columns?: 1 | 2 | 3;
  className?: string;
  otherValue?: string;
  onOtherValueChange?: (value: string) => void;
}

export const CheckboxGroup = ({
  label,
  required,
  hint,
  options,
  selectedValues,
  onChange,
  columns = 2,
  className = "",
  otherValue = "",
  onOtherValueChange,
}: CheckboxGroupProps) => {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  };

  const hasOther = options.includes("Other") || options.includes("Other EHR");
  const showOtherInput = (selectedValues.includes("Other") || selectedValues.includes("Other EHR")) && onOtherValueChange;

  return (
    <FormField label={label} required={required} hint={hint} className={className}>
      <div className="space-y-3">
        <div className={`grid ${gridCols[columns]} gap-3 mt-2`}>
          {options.map((option) => {
            const isChecked = selectedValues.includes(option);
            return (
              <label
                key={option}
                className={`
                  flex items-center gap-3 cursor-pointer p-3.5 rounded-xl border
                  transition-all duration-200 ease-in-out
                  ${isChecked 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
                  }
                `}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => {
                    onChange(option, e.target.checked);
                    if ((option === "Other" || option === "Other EHR") && !e.target.checked) {
                      onOtherValueChange?.("");
                    }
                  }}
                  className="w-4 h-4 text-blue-600 border-zinc-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer transition-all"
                />
                <span className={`text-sm font-medium flex-1 ${isChecked ? "text-zinc-900" : "text-zinc-700"}`}>
                  {option}
                </span>
                {isChecked && (
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </label>
            );
          })}
        </div>
        {showOtherInput && (
          <div className="animate-in slide-in-from-top-2 duration-200">
            <Input
              type="text"
              value={otherValue}
              onChange={(e) => onOtherValueChange?.(e.target.value)}
              placeholder="Please specify..."
              required={required && (selectedValues.includes("Other") || selectedValues.includes("Other EHR"))}
              className="w-full"
            />
          </div>
        )}
      </div>
    </FormField>
  );
};

