import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/auth-error",
  },

  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isLoginPage = nextUrl.pathname.startsWith("/login");
      // Meta App Review policies and deletion instructions must be publicly accessible.
      const publicPages = ["/privacy-policy", "/terms-of-service", "/data-deletion", "/api/version","/accept-invite","/api/invitations/accept","/api/automation/run"];
      if (publicPages.some(path => nextUrl.pathname === path || nextUrl.pathname === path + "/")) return true;

      if (isLoginPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/", nextUrl));
        }

        return true;
      }

      if (!isLoggedIn) {
        return false;
      }

      return true;
    },
  },

  providers: [],
} satisfies NextAuthConfig;