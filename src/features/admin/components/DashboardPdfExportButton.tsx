"use client";

import { FileDown } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { adminCopy } from "@/features/admin/copy";
import { downloadDashboardPdfReport } from "@/features/admin/lib/dashboard-export";

export function DashboardPdfExportButton() {
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    setIsExporting(true);

    try {
      await downloadDashboardPdfReport();
    } catch {
      window.alert(adminCopy.dashboard.exportPdfFailed);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="cursor-pointer gap-2"
      disabled={isExporting}
      onClick={handleExport}
    >
      <FileDown className="h-4 w-4" aria-hidden />
      {isExporting
        ? adminCopy.dashboard.exportPdfLoading
        : adminCopy.dashboard.exportPdf}
    </Button>
  );
}
