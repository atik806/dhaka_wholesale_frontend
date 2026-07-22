"use client";

import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        <label className="block font-mono text-xs font-bold uppercase tracking-wider text-[#132A3A] mb-1.5">
          {label}
        </label>
        <input
          ref={ref}
          {...props}
          className={`w-full rounded-[3px] border-2 px-4 py-2.5 text-xs font-mono outline-none transition-all text-[#132A3A] placeholder:text-[#1C1A17]/40 bg-white ${
            error
              ? "border-[#BE3D1F] focus:ring-2 focus:ring-[#BE3D1F]/20"
              : "border-[#E7DCC4] focus:border-[#F5A300] focus:ring-2 focus:ring-[#F5A300]/20"
          } ${className ?? ""}`}
        />
        {error && (
          <p className="font-mono text-[11px] font-bold text-[#BE3D1F] mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
