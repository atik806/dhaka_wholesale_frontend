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
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 sm:py-20 px-4 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-surface-2 border border-line flex items-center justify-center mb-5">
        {icon || <Package className="w-7 h-7 text-subtle" />}
      </div>
      <h3 className="text-xl font-bold text-fg mb-2">{title}</h3>
      <p className="text-muted text-sm max-w-sm mb-7 leading-relaxed">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className={buttonClasses()}>
          {actionLabel}
        </Link>
      )}
    </motion.div>
  );
}
