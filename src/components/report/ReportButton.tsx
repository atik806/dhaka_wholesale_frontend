"use client";

import { useState, useEffect, memo } from "react";
import { ReportModal } from "./ReportModal";

export const OPEN_REPORT_EVENT = "dw:open-report";

export const ReportButton = memo(function ReportButton() {
  const [open, setOpen] = useState(false);

  // No floating button: the footer's "Report a problem" link opens the modal.
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_REPORT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_REPORT_EVENT, onOpen);
  }, []);

  return open ? <ReportModal open={open} onClose={() => setOpen(false)} /> : null;
});
