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
  rotate?: boolean;
}

const variants = {
  primary: "bg-[#F5A300] hover:bg-[#D88900] text-[#132A3A] dark:text-[#E7DCC4] border border-[#D88900] shadow-sm font-extrabold",
  secondary: "bg-[#BE3D1F] hover:bg-[#9E3017] text-white border border-red-950 shadow-sm font-extrabold",
  outline: "border-2 border-[#132A3A] dark:border-[#E7DCC4] text-[#132A3A] dark:text-[#E7DCC4] hover:bg-[#132A3A] dark:hover:bg-[#0A1A28] hover:text-[#F5A300] font-bold",
  ghost: "text-[#1C1A17] dark:text-[#E7DCC4] hover:bg-[#E7DCC4]/40 dark:hover:bg-[#2a3d4d]/40 font-bold",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs font-mono uppercase tracking-wider",
  md: "px-5 py-2.5 text-xs font-mono uppercase tracking-wider",
  lg: "px-7 py-3 text-sm font-mono uppercase tracking-wider",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, children, motionProps, rotate = false, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.01 }}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-[3px] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A300] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          rotate ? "-rotate-1 hover:rotate-0" : "",
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
