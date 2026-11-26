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
        // Refresh authority from the database so suspensions and role changes
        // take effect without waiting for an existing JWT to expire.
        const user = token.userId ? await prisma.user.findUnique({
          where: { id: token.userId as string },
          include: { memberships: { include: { organization: true, role: true }, take: 1 } },
        }).catch(() => null) : null;
        const member = user?.memberships[0];
        if (!user || user.status !== "ACTIVE" || !member || member.organization.status !== "ACTIVE") {
          session.user.id = "";
          session.user.organizationId = "";
          session.user.organizationName = "";
          session.user.roleId = "";
          session.user.roleKey = "";
          session.user.roleName = "";
          session.user.isSystemAdmin = false;
        } else {
          session.user.id = user.id;
          session.user.name = user.name || "User";
          session.user.email = user.email;
          session.user.organizationId = member.organizationId;
          session.user.organizationName = member.organization.name;
          session.user.roleId = member.roleId;
          session.user.roleKey = member.role.key;
          session.user.roleName = member.role.name;
          session.user.isSystemAdmin = user.isSystemAdmin;
        }
      }
      return session;
    },
  },
});