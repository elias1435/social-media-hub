import { hasOrgPermission } from "@/lib/permissions";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { decryptToken, graphGet } from "@/lib/meta-connection";

type PageData = {
 id?: string; name?: string; followers_count?: number;
 picture?: { data?: { url?: string } };
};
export async function POST(request: NextRequest) {
 const session = await auth();
 const organizationId = session?.user?.organizationId;
 if (!organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 if (!await hasOrgPermission(session.user.id,organizationId,"social_accounts.manage")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
 const body = await request.json().catch(() => null);
 if (typeof body?.accountId !== "string") return NextResponse.json({ error: "Missing Page" }, { status: 400 });
 const account = await prisma.socialAccount.findFirst({
  where: { id: body.accountId, organizationId, platform: "FACEBOOK", status: "CONNECTED" },
 });
 if (!account?.accessTokenCiphertext) return NextResponse.json({ error: "Page is not connected." }, { status: 404 });
 try {
  const data = await graphGet<PageData>("/" + encodeURIComponent(account.externalAccountId),
   decryptToken(account.accessTokenCiphertext), { fields: "id,name,followers_count,picture" });
  if (data.id !== account.externalAccountId) return NextResponse.json({ error: "Unexpected Page returned by Meta." }, { status: 502 });
  const oldMeta = account.metadata;
  const metadata: Record<string, string | number | boolean | null> = {};
  if (oldMeta && typeof oldMeta === "object" && !Array.isArray(oldMeta)) {
    for (const [key,value] of Object.entries(oldMeta)) {
      if (value === null || ["string","number","boolean"].includes(typeof value)) {
        metadata[key] = value as string | number | boolean | null;
      }
    }
  }
  metadata.followersCount = typeof data.followers_count === "number" ? data.followers_count : null;
  const updated = await prisma.socialAccount.update({
   where: { id: account.id },
   data: { name: data.name || account.name, avatarUrl: data.picture?.data?.url || account.avatarUrl, metadata },
  });
  return NextResponse.json({ ok: true, name: updated.name, followers: metadata.followersCount });
 } catch (error) {
  console.error("FACEBOOK REFRESH FAILED:", error instanceof Error ? error.message : "Unknown error");
  return NextResponse.json({ error: "Unable to refresh the Page. Check its permissions or reconnect it." }, { status: 422 });
 }
}
