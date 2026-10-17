import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.redirect(
        new URL("/login", process.env.AUTH_URL)
      );
    }

    const code = request.nextUrl.searchParams.get("code");
    const error = request.nextUrl.searchParams.get("error");

    if (error) {
      console.error("META OAUTH ERROR:", error);

      return NextResponse.redirect(
        new URL("/facebook?meta=cancelled", process.env.AUTH_URL)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL("/facebook?meta=missing_code", process.env.AUTH_URL)
      );
    }

    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;
    const redirectUri = process.env.META_REDIRECT_URI;

    if (!appId || !appSecret || !redirectUri) {
      throw new Error("Meta environment variables missing");
    }

    const tokenUrl = new URL(
      "https://graph.facebook.com/v24.0/oauth/access_token"
    );

    tokenUrl.searchParams.set("client_id", appId);
    tokenUrl.searchParams.set("client_secret", appSecret);
    tokenUrl.searchParams.set("redirect_uri", redirectUri);
    tokenUrl.searchParams.set("code", code);

    const tokenResponse = await fetch(tokenUrl);

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("META TOKEN ERROR:", tokenData);

      return NextResponse.redirect(
        new URL("/facebook?meta=token_error", process.env.AUTH_URL)
      );
    }

    const userAccessToken = tokenData.access_token;

    const pagesResponse = await fetch(
      `https://graph.facebook.com/v24.0/me/accounts?fields=id,name,access_token,picture&access_token=${encodeURIComponent(
        userAccessToken
      )}`,
      {
        cache: "no-store",
      }
    );

    const pagesData = await pagesResponse.json();

    if (!pagesResponse.ok) {
      console.error("META PAGE ERROR:", pagesData);

      return NextResponse.redirect(
        new URL("/facebook?meta=pages_error", process.env.AUTH_URL)
      );
    }

    console.log(
      "META CONNECTED PAGES:",
      pagesData.data?.map((page: any) => ({
        id: page.id,
        name: page.name,
      }))
    );

    return NextResponse.redirect(
      new URL("/facebook?meta=success", process.env.AUTH_URL)
    );
  } catch (error) {
    console.error("META CALLBACK ERROR:", error);

    return NextResponse.redirect(
      new URL("/facebook?meta=error", process.env.AUTH_URL)
    );
  }
}