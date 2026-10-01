import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    organizationId: string;
    organizationName: string;

    roleId: string;
    roleKey: string;
    roleName: string;

    isSystemAdmin: boolean;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;

      organizationId: string;
      organizationName: string;

      roleId: string;
      roleKey: string;
      roleName: string;

      isSystemAdmin: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;

    organizationId: string;
    organizationName: string;

    roleId: string;
    roleKey: string;
    roleName: string;

    isSystemAdmin: boolean;
  }
}