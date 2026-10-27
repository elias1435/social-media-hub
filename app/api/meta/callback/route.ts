import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { encryptToken, getPages } from "@/lib/meta-connection";

function same(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
export async function GET(request: NextRequest) {
  const origin = process.env.AUTH_URL || "https://social.ashikinternational.com";
  const finish = (status: string) => {
    const response = NextResponse.redirect(new URL("/facebook?meta=" + status, origin));
    response.cookies.delete("meta_oauth_state");
    return response;
  };
  try {
    const session = await auth();
    if (!session?.user?.organizationId) return finish("session_expired");
    const state = request.nextUrl.searchParams.get("state") || "";
    const expected = request.cookies.get("meta_oauth_state")?.value || "";
    if (!state || !expected || !same(state, expected)) return finish("invalid_state");
    if (request.nextUrl.searchParams.has("error")) return finish("cancelled");
    const code = request.nextUrl.searchParams.get("code");
    if (!code) return finish("missing_code");
    const appId = process.env.META_APP_ID, appSecret = process.env.META_APP_SECRET, redirect = process.env.META_REDIRECT_URI;
    if (!appId || !appSecret || !redirect) return finish("configuration");
    const url = new URL("https://graph.facebook.com/v26.0/oauth/access_token");
    url.searchParams.set("client_id", appId);
    url.searchParams.set("client_secret", appSecret);
    url.searchParams.set("redirect_uri", redirect);
    url.searchParams.set("code", code);
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    if (!res.ok || !data.access_token) { console.error("Meta token exchange failed", data.error?.code); return finish("token_error"); }

    // A Business Login configuration may yield a system-user token, with asset access
    // determined by the permissions/assets authorized in the Meta business configuration.
    const pages = await getPages(data.access_token);
    if (!pages.length) return finish("no_pages");
    let count = 0;
    for (const page of pages) {
      if (!page.id || !page.name) continue;
      const token = page.access_token || data.access_token;
      await prisma.socialAccount.upsert({
        where: { organizationId_platform_externalAccountId: { organizationId: session.user.organizationId, platform: "FACEBOOK", externalAccountId: page.id } },
        create: { organizationId: session.user.organizationId, platform: "FACEBOOK", externalAccountId: page.id, name: page.name, status: "CONNECTED", avatarUrl: page.picture?.data?.url || null, accessTokenCiphertext: encryptToken(token), metadata: { followersCount: page.followers_count ?? null } },
        update: { name: page.name, status: "CONNECTED", avatarUrl: page.picture?.data?.url || null, accessTokenCiphertext: encryptToken(token), metadata: { followersCount: page.followers_count ?? null } },
      });
      count++;
    }
    await prisma.activityLog.create({ data: { organizationId: session.user.organizationId, actorUserId: session.user.id, action: "META_PAGES_CONNECTED", entityType: "SocialAccount", details: { count } } });
    return finish("success");
  } catch (error) {
    console.error("Meta connection failed", error instanceof Error ? error.message : "Unknown error");
    return finish("error");
  }
}
