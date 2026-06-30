import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: "arcadeghosts-crm",
    checkedAt: new Date().toISOString(),
  });
}
