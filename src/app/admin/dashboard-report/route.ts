import { NextResponse } from "next/server";

import { db } from "@/db/client";
import {
  buildDashboardPdfBuffer,
  buildDashboardPdfFilename,
} from "@/features/admin/server/build-dashboard-pdf";
import { requireAdminApiSession } from "@/features/admin/server/auth";
import { DashboardAdminRepository } from "@/features/admin/server/dashboard-admin-repository";
import { isAppError, toPublicError } from "@/server/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const dashboardRepository = new DashboardAdminRepository(db);

export async function GET() {
  try {
    await requireAdminApiSession();

    const data = await dashboardRepository.getDashboardData();
    const buffer = await buildDashboardPdfBuffer(data);
    const filename = buildDashboardPdfFilename();

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const status = isAppError(error) ? error.statusCode : 500;

    return NextResponse.json(toPublicError(error), { status });
  }
}
