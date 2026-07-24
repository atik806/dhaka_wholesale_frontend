"use client";

import { forwardRef, useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { fieldBase, fieldLabel } from "./Input";
import type { SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const generatedId = useId();
    const fieldId = id ?? generatedId;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={fieldId} className={fieldLabel}>
            {label}
            {props.required && <span className="text-danger ml-0.5">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={fieldId}
          aria-invalid={!!error}
          {...props}
          className={cn(
            fieldBase,
            "px-3.5 py-3 text-sm resize-y min-h-[7rem]",
            error ? "border-danger focus:border-danger focus:ring-danger/25" : "border-line-strong",
            className,
          )}
        />
        {error ? (
          <p className="text-[12px] font-medium text-danger mt-1.5">{error}</p>
        ) : hint ? (
          <p className="text-[12px] text-muted mt-1.5">{hint}</p>
        ) : null}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, className, id, children, ...props }, ref) => {
    const generatedId = useId();
    const fieldId = id ?? generatedId;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={fieldId} className={fieldLabel}>
            {label}
            {props.required && <span className="text-danger ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={fieldId}
            aria-invalid={!!error}
            {...props}
            className={cn(
              fieldBase,
              "h-11 pl-3.5 pr-10 text-sm appearance-none cursor-pointer",
              error ? "border-danger" : "border-line-strong",
              className,
            )}
          >
            {children}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-subtle pointer-events-none" />
        </div>
        {error ? (
          <p className="text-[12px] font-medium text-danger mt-1.5">{error}</p>
        ) : hint ? (
          <p className="text-[12px] text-muted mt-1.5">{hint}</p>
        ) : null}
      </div>
    );
  },
);

Select.displayName = "Select";
