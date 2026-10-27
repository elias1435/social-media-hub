import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { decryptToken } from "@/lib/meta-connection";

export async function POST(request: NextRequest) {
 const session = await auth();
 const organizationId = session?.user?.organizationId;
 if (!organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 const body = await request.json().catch(() => null);
 const id = typeof body?.pageId === "string" ? body.pageId : "";
 const message = typeof body?.message === "string" ? body.message.trim() : "";
 if (!id || !message || message.length > 10000) return NextResponse.json({ error: "Choose a Page and enter a message (up to 10,000 characters)." }, { status: 400 });
 const account = await prisma.socialAccount.findFirst({ where: { id, organizationId, platform: "FACEBOOK", status: "CONNECTED" } });
 if (!account?.accessTokenCiphertext) return NextResponse.json({ error: "This Facebook Page is not connected." }, { status: 404 });
 try {
   const token = decryptToken(account.accessTokenCiphertext);
   const form = new URLSearchParams({ message });
   const response = await fetch("https://graph.facebook.com/v26.0/" + encodeURIComponent(account.externalAccountId) + "/feed", {
     method: "POST", headers: { Authorization: "Bearer " + token, "Content-Type": "application/x-www-form-urlencoded" }, body: form, cache: "no-store",
   });
   const result = await response.json();
   if (!response.ok || !result.id) return NextResponse.json({ error: result.error?.message || "Meta declined this post. Check pages_manage_posts permission." }, { status: 422 });
   await prisma.activityLog.create({ data: { organizationId, actorUserId: session.user.id, action: "FACEBOOK_POST_PUBLISHED", entityType: "SocialAccount", entityId: account.id, details: { postId: result.id } } });
   return NextResponse.json({ ok: true, postId: result.id });
 } catch (e) {
   console.error("FACEBOOK PUBLISH:", e instanceof Error ? e.message : "Unknown error");
   return NextResponse.json({ error: "Could not publish this post. Try reconnecting the Page." }, { status: 500 });
 }
}
