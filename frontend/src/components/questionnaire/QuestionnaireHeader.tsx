"use client";

import { X } from "lucide-react";
import { STEP_TITLES } from "./constants";

interface QuestionnaireHeaderProps {
  currentStep: number;
  totalSteps: number;
  onClose: () => void;
}

export const QuestionnaireHeader = ({
  currentStep,
  totalSteps,
  onClose,
}: QuestionnaireHeaderProps) => {
  const stepTitles = STEP_TITLES;

  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="px-6 sm:px-8 py-6 border-b border-zinc-200 bg-white sticky top-0 z-10">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1 pr-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-2 leading-tight">
            Institution Profile
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed">
            Help us understand your needs to match you with the right AI solutions
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-all duration-200"
          aria-label="Close questionnaire"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-zinc-900">
            {stepTitles[currentStep as keyof typeof stepTitles]}
          </span>
          <span className="text-sm font-medium text-zinc-500">
            Step {currentStep} of {totalSteps}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="relative w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 via-blue-500 to-teal-600 rounded-full transition-all duration-500 ease-out shadow-sm"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>{Math.round(progress)}% Complete</span>
          <span className="flex items-center gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <span
                key={i}
                className={`inline-block w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i + 1 <= currentStep ? "bg-blue-600" : "bg-zinc-300"
                }`}
              />
            ))}
          </span>
        </div>
      </div>
    </div>
  );
};

