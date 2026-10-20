import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.redirect(
      new URL("/login", process.env.AUTH_URL)
    );
  }

  const appId = process.env.META_APP_ID;
  const redirectUri = process.env.META_REDIRECT_URI;

  if (!appId || !redirectUri) {
    return NextResponse.json(
      { error: "Meta environment variables are missing." },
      { status: 500 }
    );
  }

  const scopes = [
    "pages_show_list",
    "pages_read_engagement",
    "pages_messaging",
  ].join(",");

  const url = new URL("https://www.facebook.com/v26.0/dialog/oauth");

  url.searchParams.set("client_id", appId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", scopes);
  url.searchParams.set("response_type", "code");

  return NextResponse.redirect(url);
}