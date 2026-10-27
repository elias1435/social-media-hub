import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { randomBytes } from "node:crypto";

export async function GET() {
  const session = await auth();
  const origin = process.env.AUTH_URL || "https://social.ashikinternational.com";
  if (!session?.user?.organizationId) return NextResponse.redirect(new URL("/login", origin));

  const appId = process.env.META_APP_ID;
  const redirectUri = process.env.META_REDIRECT_URI;
  const configId = process.env.META_LOGIN_CONFIG_ID;
  if (!appId || !redirectUri || !configId) {
    return NextResponse.redirect(new URL("/connected-accounts/meta?error=configuration", origin));
  }
  const state = randomBytes(32).toString("hex");
  const url = new URL("https://www.facebook.com/v26.0/dialog/oauth");
  url.searchParams.set("client_id", appId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("config_id", configId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);
  const response = NextResponse.redirect(url);
  response.cookies.set("meta_oauth_state", state, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 600, path: "/" });
  return response;
}
