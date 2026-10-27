import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { decryptToken } from "@/lib/meta-connection";

export async function POST(request: NextRequest) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  if (!organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await request.json().catch(() => null);
  const accountId = typeof payload?.accountId === "string" ? payload.accountId : "";
  const commentId = typeof payload?.commentId === "string" ? payload.commentId : "";
  const message = typeof payload?.message === "string" ? payload.message.trim() : "";
  if (!accountId || !/^\d+_\d+$/.test(commentId) || !message || message.length > 8000) {
    return NextResponse.json({ error: "Invalid comment or reply." }, { status: 400 });
  }
  const account = await prisma.socialAccount.findFirst({
    where: { id: accountId, organizationId, platform: "FACEBOOK", status: "CONNECTED" },
  });
  if (!account?.accessTokenCiphertext) return NextResponse.json({ error: "Page not connected" }, { status: 404 });
  try {
    const token = decryptToken(account.accessTokenCiphertext);
    const response = await fetch("https://graph.facebook.com/v26.0/" + encodeURIComponent(commentId) + "/comments", {
      method: "POST", headers: { Authorization: "Bearer " + token, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ message }), cache: "no-store",
    });
    const result = await response.json();
    if (!response.ok || !result.id) return NextResponse.json({ error: result.error?.message || "Meta refused the reply. Check Page engagement permissions." }, { status: 422 });
    await prisma.activityLog.create({ data: { organizationId, actorUserId: session.user.id, action: "FACEBOOK_COMMENT_REPLIED", entityType: "SocialAccount", entityId: account.id, details: { commentId, replyId: result.id } } });
    return NextResponse.json({ ok: true, replyId: result.id });
  } catch {
    return NextResponse.json({ error: "Could not send reply." }, { status: 500 });
  }
}
