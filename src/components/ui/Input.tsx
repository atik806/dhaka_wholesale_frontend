"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/src/lib/utils";
import type { InputHTMLAttributes, ReactNode } from "react";

export const fieldBase =
  "w-full rounded-md border bg-surface text-fg placeholder:text-subtle outline-none transition-colors " +
  "focus:border-accent focus:ring-2 focus:ring-accent/25 disabled:opacity-60 disabled:cursor-not-allowed";

export const fieldLabel = "block text-[13px] font-semibold text-fg mb-1.5";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leadingIcon, trailingIcon, className, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className={fieldLabel}>
            {label}
            {props.required && <span className="text-danger ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          {leadingIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle pointer-events-none">
              {leadingIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
            className={cn(
              fieldBase,
              "h-11 px-3.5 text-sm",
              leadingIcon && "pl-10",
              trailingIcon && "pr-10",
              error ? "border-danger focus:border-danger focus:ring-danger/25" : "border-line-strong",
              className,
            )}
          />
          {trailingIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle">
              {trailingIcon}
            </span>
          )}
        </div>
        {error ? (
          <p id={`${inputId}-error`} className="text-[12px] font-medium text-danger mt-1.5">
            {error}
          </p>
        ) : hint ? (
          <p className="text-[12px] text-muted mt-1.5">{hint}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
