import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,

  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        try {
          const email =
            typeof credentials?.email === "string"
              ? credentials.email.trim().toLowerCase()
              : "";

          const password =
            typeof credentials?.password === "string"
              ? credentials.password
              : "";

          if (!email || !password) {
            return null;
          }

          const user = await prisma.user.findUnique({
            where: {
              email,
            },
            include: {
              memberships: {
                include: {
                  organization: true,
                  role: true,
                },
                take: 1,
              },
            },
          });

          if (!user) {
            return null;
          }

          if (!user.passwordHash) {
            return null;
          }

          if (user.status !== "ACTIVE") {
            return null;
          }

          const passwordMatches = await bcrypt.compare(
            password,
            user.passwordHash
          );

          if (!passwordMatches) {
            return null;
          }

          const membership = user.memberships[0];

          if (!membership) {
            return null;
          }

          return {
            id: user.id,
            name: user.name ?? "User",
            email: user.email,

            organizationId: membership.organizationId,
            organizationName: membership.organization.name,

            roleId: membership.roleId,
            roleKey: membership.role.key,
            roleName: membership.role.name,

            isSystemAdmin: user.isSystemAdmin,
          };
        } catch (error) {
          console.error("AUTH AUTHORIZE ERROR:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    ...authConfig.callbacks,

    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id as string;

        token.organizationId = user.organizationId;
        token.organizationName = user.organizationName;

        token.roleId = user.roleId;
        token.roleKey = user.roleKey;
        token.roleName = user.roleName;

        token.isSystemAdmin = user.isSystemAdmin;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId;

        session.user.organizationId = token.organizationId;
        session.user.organizationName = token.organizationName;

        session.user.roleId = token.roleId;
        session.user.roleKey = token.roleKey;
        session.user.roleName = token.roleName;

        session.user.isSystemAdmin = token.isSystemAdmin;
      }

      return session;
    },
  },
});