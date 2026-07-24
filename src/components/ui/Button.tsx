"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/src/lib/utils";
import type { MotionProps } from "framer-motion";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "link";
type Size = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  motionProps?: MotionProps;
  loading?: boolean;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-fg hover:bg-accent-hover border border-transparent shadow-xs",
  secondary:
    "bg-brand text-brand-fg hover:bg-brand-hover border border-transparent shadow-xs",
  outline:
    "bg-surface text-fg border border-line-strong hover:bg-surface-2 hover:border-brand",
  ghost: "bg-transparent text-fg border border-transparent hover:bg-surface-2",
  danger:
    "bg-danger text-white hover:brightness-110 border border-transparent shadow-xs",
  link: "bg-transparent text-link hover:text-link-hover underline underline-offset-4 border border-transparent",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[13px] gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-12 px-7 text-[15px] gap-2",
  icon: "h-10 w-10 p-0",
};

/** Shared button styling so links can look like buttons without nesting <a> in <button>. */
export function buttonClasses({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
} = {}) {
  return cn(
    "inline-flex items-center justify-center rounded-md font-semibold transition-colors duration-150",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
    "disabled:pointer-events-none disabled:opacity-55",
    variants[variant],
    sizes[size],
    fullWidth && "w-full",
    className,
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      className,
      children,
      motionProps,
      loading = false,
      fullWidth = false,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-semibold transition-colors duration-150",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
          "disabled:pointer-events-none disabled:opacity-55",
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className,
        )}
        {...motionProps}
        {...(props as React.ComponentPropsWithoutRef<"button"> & MotionProps)}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </motion.button>
    );
  },
);

Button.displayName = "Button";
