"use client";

import { motion } from "framer-motion";
import { Package } from "lucide-react";
import { buttonClasses } from "./Button";
import Link from "next/link";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  /** Renders a button with this click handler when provided (takes precedence over actionHref) */
  onAction?: () => void;
  /** Secondary action shown below the primary CTA */
  secondaryLabel?: string;
  secondaryHref?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  secondaryLabel,
  secondaryHref,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center justify-center py-16 sm:py-20 px-4 text-center"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="w-16 h-16 rounded-full bg-surface-2 border border-line flex items-center justify-center mb-5"
      >
        {icon || <Package className="w-7 h-7 text-subtle" />}
      </motion.div>
      <h3 className="text-xl font-bold text-fg mb-2">{title}</h3>
      <p className="text-muted text-sm max-w-sm mb-7 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button type="button" className={buttonClasses()} onClick={onAction}>
          {actionLabel}
        </button>
      )}
      {actionLabel && !onAction && actionHref && (
        <Link href={actionHref} className={buttonClasses()}>
          {actionLabel}
        </Link>
      )}
      {secondaryLabel && secondaryHref && (
        <Link
          href={secondaryHref}
          className="mt-2.5 text-[13px] font-semibold text-link hover:text-link-hover transition-colors"
        >
          {secondaryLabel}
        </Link>
      )}
    </motion.div>
  );
}
