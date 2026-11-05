import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { hasOrgPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { decryptToken } from "@/lib/meta-connection";

const GRAPH = "https://graph.facebook.com/v26.0";
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png"]);
function failed(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}
export async function POST(request: NextRequest) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;
  if (!organizationId) return failed("Unauthorized", 401);
  if (!await hasOrgPermission(session.user.id, organizationId, "facebook.posts.publish")) return failed("Forbidden", 403);
  const contentType = request.headers.get("content-type") || "";
  let pageId = "", message = "", mode = "now", scheduleAt = "", upload: File | null = null;
  if (contentType.includes("multipart/form-data")) {
    const declaredSize=Number(request.headers.get("content-length") || 0);
    if (declaredSize > MAX_IMAGE_BYTES + 100000) return failed("Upload exceeds 8 MB.", 413);
    const data = await request.formData().catch(() => null);
    if (!data) return failed("Invalid form data", 400);
    pageId = String(data.get("pageId") || "");
    message = String(data.get("message") || "").trim();
    mode = String(data.get("mode") || "now");
    scheduleAt = String(data.get("scheduleAt") || "");
    const selected = data.get("image");
    if (selected instanceof File && selected.size > 0) upload = selected;
  } else if (contentType.includes("application/json")) {
    const data = await request.json().catch(() => null);
    pageId = typeof data?.pageId === "string" ? data.pageId : "";
    message = typeof data?.message === "string" ? data.message.trim() : "";
    mode = typeof data?.mode === "string" ? data.mode : "now";
    scheduleAt = typeof data?.scheduleAt === "string" ? data.scheduleAt : "";
  } else return failed("Unsupported request format", 415);
  if (!pageId || pageId.length > 100 || message.length > 10000 || (!message && !upload)) {
    return failed("Choose a Page and provide text or an image.", 400);
  }
  if (!["now","schedule"].includes(mode)) return failed("Invalid publishing option", 400);
  if (upload && (upload.size > MAX_IMAGE_BYTES || !ACCEPTED_TYPES.has(upload.type))) {
    return failed("Please upload a JPG or PNG image under 8 MB.", 400);
  }
  if (mode === "schedule" && upload) return failed("Scheduling image posts is not enabled yet.", 400);
  let publishTime: number | undefined;
  if (mode === "schedule") {
    const date = new Date(scheduleAt);
    publishTime = Math.floor(date.getTime()/1000);
    const now = Math.floor(Date.now()/1000);
    if (!Number.isFinite(publishTime) || publishTime < now + 11*60 || publishTime > now + 29*86400) {
      return failed("Choose a scheduled time between 11 minutes and 29 days from now.", 400);
    }
  }
  const account = await prisma.socialAccount.findFirst({
    where: { id: pageId, organizationId, platform: "FACEBOOK", status: "CONNECTED" },
  });
  if (!account?.accessTokenCiphertext) return failed("This Facebook Page is not connected.", 404);
  try {
    const token = decryptToken(account.accessTokenCiphertext);
    let response: Response;
    if (upload) {
      const body = new FormData();
      body.set("source", upload, upload.name || "photo.jpg");
      body.set("caption", message);
      response = await fetch(GRAPH + "/" + encodeURIComponent(account.externalAccountId) + "/photos", {
        method: "POST", headers: { Authorization: "Bearer " + token }, body, cache: "no-store",
      });
    } else {
      const body = new URLSearchParams({ message });
      if (publishTime) {
        body.set("published", "false");
        body.set("scheduled_publish_time", String(publishTime));
      }
      response = await fetch(GRAPH + "/" + encodeURIComponent(account.externalAccountId) + "/feed", {
        method: "POST", headers: { Authorization: "Bearer " + token, "Content-Type": "application/x-www-form-urlencoded" },
        body, cache: "no-store",
      });
    }
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.id) return failed(result.error?.message || "Meta rejected this post. Check Page publishing permissions.", 422);
    await prisma.activityLog.create({
      data: { organizationId, actorUserId: session.user.id,
        action: publishTime ? "FACEBOOK_POST_SCHEDULED" : "FACEBOOK_POST_PUBLISHED",
        entityType: "SocialAccount", entityId: account.id,
        details: { postId: result.id, mode, mediaType: upload ? "image" : "text", scheduledAt: publishTime ? new Date(publishTime*1000).toISOString() : null },
      },
    }).catch(error => console.error("Facebook publish audit failed:", error));
    return NextResponse.json({ ok: true, postId: result.id, scheduled: Boolean(publishTime) });
  } catch (error) {
    console.error("Facebook publish request failed:", error instanceof Error ? error.message : "Unknown error");
    return failed("Unable to reach Meta. Please retry or reconnect your Page.", 502);
  }
}
