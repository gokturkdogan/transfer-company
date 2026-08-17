import { adminCopy } from "@/features/admin/copy";

export async function downloadDashboardPdfReport(): Promise<void> {
  const response = await fetch("/admin/dashboard-report", {
    method: "GET",
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(`Dashboard PDF export failed with status ${response.status}`);
  }

  const blob = await response.blob();
  const filename =
    parseContentDispositionFilename(
      response.headers.get("Content-Disposition"),
    ) ?? `${adminCopy.dashboard.exportFilename}.pdf`;

  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

function parseContentDispositionFilename(
  header: string | null,
): string | null {
  if (!header) {
    return null;
  }

  const match = header.match(/filename="([^"]+)"/);

  return match?.[1] ?? null;
}
