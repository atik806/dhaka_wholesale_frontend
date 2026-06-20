"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/src/lib/utils";
import type { MotionProps } from "framer-motion";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  motionProps?: MotionProps;
}

const variants = {
  primary: "bg-primary text-white hover:bg-primary-dark shadow-sm",
  secondary: "bg-zinc-900 dark:bg-zinc-800 text-white hover:bg-zinc-800 dark:hover:bg-zinc-700",
  outline: "border-2 border-primary text-primary dark:text-primary-light hover:bg-primary-50 dark:hover:bg-primary-50/10",
  ghost: "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-8 py-3 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, children, motionProps, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.02 }}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...motionProps}
        {...(props as React.ComponentPropsWithoutRef<"button"> & MotionProps)}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
