import { NextResponse } from "next/server";
import { runDatabaseHealthCheck } from "@/lib/db-health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const health = await runDatabaseHealthCheck();

  return NextResponse.json(health.result, {
    status: health.status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
