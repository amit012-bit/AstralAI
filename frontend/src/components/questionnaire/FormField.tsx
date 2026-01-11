"use client";

import { forwardRef } from "react";

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, required, error, hint, className = "", children }, ref) => {
    return (
      <div ref={ref} className={`space-y-1.5 ${className}`}>
        <label className="block text-sm font-medium text-zinc-900 leading-5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {hint && (
          <p className="text-xs text-zinc-500 leading-relaxed">{hint}</p>
        )}
        {children}
        {error && (
          <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`
          w-full px-4 py-3 text-sm text-zinc-900 bg-white border rounded-xl
          transition-all duration-200 ease-in-out
          placeholder:text-zinc-400
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          hover:border-zinc-400
          disabled:bg-zinc-50 disabled:text-zinc-500 disabled:cursor-not-allowed
          ${error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-zinc-300"}
          ${className}
        `}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className = "", ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`
          w-full px-4 py-3 text-sm text-zinc-900 bg-white border rounded-xl
          transition-all duration-200 ease-in-out
          placeholder:text-zinc-400 resize-y
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          hover:border-zinc-400
          disabled:bg-zinc-50 disabled:text-zinc-500 disabled:cursor-not-allowed
          ${error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-zinc-300"}
          ${className}
        `}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

