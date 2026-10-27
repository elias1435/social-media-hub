import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await auth();
  const orgId = session?.user?.organizationId;
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  if (typeof body.id !== "string") return NextResponse.json({ error: "Missing page" }, { status: 400 });
  const result = await prisma.socialAccount.updateMany({
    where: { id: body.id, organizationId: orgId, platform: "FACEBOOK" },
    data: { status: "DISCONNECTED", accessTokenCiphertext: null, refreshTokenCiphertext: null, tokenExpiresAt: null },
  });
  if (!result.count) return NextResponse.json({ error: "Page not found" }, { status: 404 });
  await prisma.activityLog.create({ data: { organizationId: orgId, actorUserId: session.user.id, action: "META_PAGE_DISCONNECTED", entityType: "SocialAccount", entityId: body.id } });
  return NextResponse.json({ ok: true });
}
