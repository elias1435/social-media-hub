import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export function GET() {
  return NextResponse.json(
    { application: "Ashik International Social Hub", release: "2026-11-26-feature-hardening", features: ["video-scheduling", "messenger-inbox", "role-navigation", "header-tools", "deployment-version-check"] },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
  );
}
