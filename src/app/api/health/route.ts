import { NextResponse } from "next/server";

/**
 * Lightweight health probe used by uptime checks and CI smoke tests.
 *
 * Intentionally does not hit Supabase so it stays cheap and dependency-free.
 * Add a separate `/api/health/db` route once the schema exists if you need
 * end-to-end coverage.
 */
export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "cafe-management-system",
    timestamp: new Date().toISOString(),
  });
}
