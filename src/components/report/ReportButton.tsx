"use client";

import { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquareWarning } from "lucide-react";
import { ReportModal } from "./ReportModal";

export const ReportButton = memo(function ReportButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setOpen(true)}
          className="fixed bottom-[13.5rem] md:bottom-40 right-4 md:right-6 z-50 flex items-center justify-center w-11 h-11 rounded-full bg-amber-500 text-white shadow-lg hover:bg-amber-600 transition-colors"
          title="Report a bug"
        >
          <MessageSquareWarning className="w-5 h-5" />
        </motion.button>
      </AnimatePresence>
      {open && <ReportModal open={open} onClose={() => setOpen(false)} />}
    </>
  );
});
