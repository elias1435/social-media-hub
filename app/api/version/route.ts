import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export function GET() {
  return NextResponse.json(
    { application: "Ashik International Social Hub", release: "2026-11-26-production-readiness", features: ["video-scheduling", "facebook-reels", "messenger-collaboration", "role-navigation", "email-invitations", "instagram-scheduling", "automation-jobs", "ads-confirmation", "analytics-history", "ads-readiness"] },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
  );
}
