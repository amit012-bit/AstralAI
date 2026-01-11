"use client";

import { ChevronLeft, ChevronRight, Save } from "lucide-react";

interface QuestionnaireFooterProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onSaveDraft: () => void;
  isSubmitting?: boolean;
}

export const QuestionnaireFooter = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSubmit,
  onSaveDraft,
  isSubmitting = false,
}: QuestionnaireFooterProps) => {
  return (
    <div className="px-6 sm:px-8 py-5 border-t border-zinc-200 bg-white sticky bottom-0 z-10">
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onSaveDraft}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-zinc-700 
                     border border-zinc-300 rounded-xl hover:bg-zinc-50 hover:border-zinc-400 
                     transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          <span className="hidden sm:inline">Save Draft</span>
        </button>

        <div className="flex items-center gap-3">
          {currentStep > 1 && (
            <button
              onClick={onPrevious}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-zinc-700 
                         border border-zinc-300 rounded-xl hover:bg-zinc-50 hover:border-zinc-400 
                         transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
          )}
          
          {currentStep < totalSteps ? (
            <button
              onClick={onNext}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white 
                         bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl 
                         hover:from-blue-700 hover:to-teal-700 
                         shadow-md hover:shadow-lg 
                         transition-all duration-200 
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white 
                         bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl 
                         hover:from-blue-700 hover:to-teal-700 
                         shadow-md hover:shadow-lg 
                         transition-all duration-200 
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  Submit Profile
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

