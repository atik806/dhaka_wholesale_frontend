"use client";

import { motion } from "framer-motion";
import { Package } from "lucide-react";
import { Button } from "./Button";
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-4 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-20 h-20 rounded-full bg-[#132A3A]/10 flex items-center justify-center mb-6"
      >
        {icon || <Package className="w-10 h-10 text-[#132A3A]/40" />}
      </motion.div>
      <h3 className="font-serif text-xl font-bold text-[#132A3A] mb-2">{title}</h3>
      <p className="text-[#1C1A17]/60 text-sm max-w-sm mb-8 font-sans">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <Button>{actionLabel}</Button>
        </Link>
      )}
    </motion.div>
  );
}
