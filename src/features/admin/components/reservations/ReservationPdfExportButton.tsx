"use client";

import { FileDown } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { adminCopy } from "@/features/admin/copy";
import { downloadReservationPdfReport } from "@/features/admin/lib/reservation-export";

type ReservationPdfExportButtonProps = {
  reservationId: string;
};

export function ReservationPdfExportButton({
  reservationId,
}: ReservationPdfExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    setIsExporting(true);

    try {
      await downloadReservationPdfReport(reservationId);
    } catch {
      window.alert(adminCopy.reservations.detail.exportPdfFailed);
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
        ? adminCopy.reservations.detail.exportPdfLoading
        : adminCopy.reservations.detail.exportPdf}
    </Button>
  );
}
