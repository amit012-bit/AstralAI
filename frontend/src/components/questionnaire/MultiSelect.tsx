"use client";

import { useState, useRef, useEffect } from "react";
import { X, ChevronDown, Check } from "lucide-react";
import { FormField, Input } from "./FormField";

interface MultiSelectProps {
  value: string[];
  onValueChange: (value: string[]) => void;
  options: string[];
  placeholder: string;
  required?: boolean;
  className?: string;
  error?: boolean;
  label?: string;
  hint?: string;
  otherValue?: string;
  onOtherValueChange?: (value: string) => void;
}

export const MultiSelect = ({
  value = [],
  onValueChange,
  options,
  placeholder,
  required = false,
  className = "",
  error = false,
  label,
  hint,
  otherValue = "",
  onOtherValueChange,
}: MultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasOther = options.includes("Other") || options.includes("Other EHR");
  const showOtherInput = (value.includes("Other") || value.includes("Other EHR")) && onOtherValueChange;

  // Filter options based on search query
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    const isOtherOption = option === "Other" || option === "Other EHR";
    if (isOtherOption) {
      if (value.includes(option)) {
        // Remove "Other" or "Other EHR" and clear other value
        onValueChange(value.filter((v) => v !== option));
        onOtherValueChange?.("");
      } else {
        // Add "Other" or "Other EHR"
        onValueChange([...value, option]);
      }
    } else {
      if (value.includes(option)) {
        onValueChange(value.filter((v) => v !== option));
      } else {
        onValueChange([...value, option]);
      }
    }
    setSearchQuery("");
    inputRef.current?.focus();
  };

  const handleRemove = (option: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange(value.filter((v) => v !== option));
    if (option === "Other" || option === "Other EHR") {
      onOtherValueChange?.("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setSearchQuery("");
    } else if (e.key === "Backspace" && searchQuery === "" && value.length > 0) {
      // Remove last tag on backspace when input is empty
      onValueChange(value.slice(0, -1));
    }
  };

  const content = (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        className={`
          relative rounded-2xl bg-white border min-h-[44px] px-3 py-2
          transition-all duration-200 cursor-text
          ${isOpen ? "border-blue-500 ring-2 ring-blue-500" : "border-zinc-300"}
          ${error ? "border-red-500" : ""}
          hover:border-zinc-400
        `}
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
      >
        <div className="flex flex-wrap gap-2 items-center min-h-[28px]">
          {/* Selected Tags */}
          {value.map((selected) => (
            <span
              key={selected}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg border border-blue-200"
            >
              {selected}
              <button
                type="button"
                onClick={(e) => handleRemove(selected, e)}
                className="hover:bg-blue-100 rounded-full p-0.5 transition-colors"
                aria-label={`Remove ${selected}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {/* Search Input */}
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[120px] outline-none text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 placeholder:font-normal bg-transparent"
          />
        </div>

        {/* Dropdown Icon */}
        <ChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-zinc-300 rounded-xl max-h-60 overflow-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-zinc-500 text-center">
              No options found
            </div>
          ) : (
            <div className="p-1">
              {filteredOptions.map((option) => {
                const isSelected = value.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`
                      w-full text-left px-3 py-2 text-sm rounded-lg
                      transition-colors flex items-center gap-2
                      ${
                        isSelected
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-zinc-900 hover:bg-zinc-50"
                      }
                    `}
                  >
                    <div
                      className={`
                        w-4 h-4 rounded border-2 flex items-center justify-center
                        ${
                          isSelected
                            ? "bg-blue-600 border-blue-600"
                            : "border-zinc-300"
                        }
                      `}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const fullContent = (
    <div className="space-y-3">
      {content}
      {showOtherInput && (
        <div className="animate-in slide-in-from-top-2 duration-200">
          <Input
            type="text"
            value={otherValue}
            onChange={(e) => onOtherValueChange?.(e.target.value)}
            placeholder="Please specify..."
              required={required && (value.includes("Other") || value.includes("Other EHR"))}
            className="w-full"
          />
        </div>
      )}
    </div>
  );

  if (label) {
    return (
      <FormField label={label} required={required} hint={hint} error={error ? "This field is required" : undefined}>
        {fullContent}
      </FormField>
    );
  }

  return fullContent;
};

