"use client";

import { useState } from "react";

interface RoleSelectionProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (role: "buyer" | "seller") => void;
}

export function RoleSelection({ isOpen, onClose, onSelect }: RoleSelectionProps) {
  const [selectedRole, setSelectedRole] = useState<"buyer" | "seller" | null>(null);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedRole) {
      onSelect(selectedRole);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 p-8 animate-in fade-in-50 duration-300">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-zinc-900 mb-3">Welcome to AstroVault AI</h2>
          <p className="text-zinc-600 text-lg">
            Are you here to sell an AI solution or looking for an AI solution?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Buyer Option */}
          <button
            onClick={() => setSelectedRole("buyer")}
            className={`p-8 rounded-xl border-2 transition-all duration-200 text-left ${
              selectedRole === "buyer"
                ? "border-blue-600 bg-blue-50 shadow-lg scale-105"
                : "border-zinc-300 bg-white hover:border-blue-400 hover:shadow-md"
            }`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                selectedRole === "buyer" ? "bg-blue-600" : "bg-zinc-100"
              }`}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-zinc-900">Looking for Solutions</h3>
            </div>
            <p className="text-zinc-600">
              I'm looking for AI solutions to improve patient care and operations.
            </p>
          </button>

          {/* Seller Option */}
          <button
            onClick={() => setSelectedRole("seller")}
            className={`p-8 rounded-xl border-2 transition-all duration-200 text-left ${
              selectedRole === "seller"
                ? "border-teal-600 bg-teal-50 shadow-lg scale-105"
                : "border-zinc-300 bg-white hover:border-teal-400 hover:shadow-md"
            }`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                selectedRole === "seller" ? "bg-teal-600" : "bg-zinc-100"
              }`}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-zinc-900">Selling Solutions</h3>
            </div>
            <p className="text-zinc-600">
              I'm here to sell AI solutions for healthcare institutions.
            </p>
          </button>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedRole}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
