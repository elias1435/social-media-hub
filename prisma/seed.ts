import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const permissions = [
  ["dashboard.view", "View Dashboard"],

  ["users.view", "View Users"],
  ["users.manage", "Manage Users"],

  ["roles.view", "View Roles"],
  ["roles.manage", "Manage Roles"],

  ["facebook.pages.view", "View Facebook Pages"],
  ["facebook.posts.view", "View Facebook Posts"],
  ["facebook.posts.create", "Create Facebook Posts"],
  ["facebook.posts.publish", "Publish Facebook Posts"],
  ["facebook.comments.view", "View Facebook Comments"],
  ["facebook.comments.reply", "Reply to Facebook Comments"],
  ["facebook.messages.view", "View Facebook Messages"],
  ["facebook.messages.reply", "Reply to Facebook Messages"],

  ["ads.view", "View Ads"],
  ["ads.manage", "Manage Ads"],

  ["analytics.view", "View Analytics"],

  ["social_accounts.view", "View Connected Accounts"],
  ["social_accounts.manage", "Manage Connected Accounts"],

  ["activity_logs.view", "View Activity Logs"],

  ["settings.view", "View Settings"],
  ["settings.manage", "Manage Settings"],
] as const;

const roleDefinitions = [
  {
    key: "super_admin",
    name: "Super Admin",
    description: "Full access to the organization.",
    permissions: permissions.map(([key]) => key),
  },

  {
    key: "admin",
    name: "Admin",
    description: "Administrative access excluding some system-level controls.",
    permissions: permissions
      .map(([key]) => key)
      .filter((key) => key !== "settings.manage"),
  },

  {
    key: "manager",
    name: "Manager",
    description: "Manage social activity and team operations.",
    permissions: [
      "dashboard.view",
      "users.view",
      "facebook.pages.view",
      "facebook.posts.view",
      "facebook.posts.create",
      "facebook.posts.publish",
      "facebook.comments.view",
      "facebook.comments.reply",
      "facebook.messages.view",
      "facebook.messages.reply",
      "ads.view",
      "analytics.view",
      "social_accounts.view",
      "activity_logs.view",
    ],
  },

  {
    key: "customer_care",
    name: "Customer Care",
    description: "Handle customer messages and comments.",
    permissions: [
      "dashboard.view",
      "facebook.pages.view",
      "facebook.comments.view",
      "facebook.comments.reply",
      "facebook.messages.view",
      "facebook.messages.reply",
    ],
  },

  {
    key: "content_manager",
    name: "Content Manager",
    description: "Create and publish social content.",
    permissions: [
      "dashboard.view",
      "facebook.pages.view",
      "facebook.posts.view",
      "facebook.posts.create",
      "facebook.posts.publish",
      "facebook.comments.view",
      "analytics.view",
    ],
  },

  {
    key: "viewer",
    name: "Viewer",
    description: "Read-only access.",
    permissions: [
      "dashboard.view",
      "facebook.pages.view",
      "facebook.posts.view",
      "facebook.comments.view",
      "facebook.messages.view",
      "ads.view",
      "analytics.view",
      "social_accounts.view",
    ],
  },
];

async function main() {
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;

  if (!adminEmail) {
    throw new Error("INITIAL_ADMIN_EMAIL is missing from .env");
  }

  if (!adminPassword) {
    throw new Error("INITIAL_ADMIN_PASSWORD is missing from .env");
  }

  if (adminPassword.length < 12) {
    throw new Error("INITIAL_ADMIN_PASSWORD must be at least 12 characters.");
  }

  console.log("Starting seed...");

  // --------------------------------------------------
  // Organization
  // --------------------------------------------------

  const organization = await prisma.organization.upsert({
    where: {
      slug: "ashik-international",
    },
    update: {
      name: "Ashik International",
    },
    create: {
      name: "Ashik International",
      slug: "ashik-international",
      status: "ACTIVE",
    },
  });

  console.log(`Organization ready: ${organization.name}`);

  // --------------------------------------------------
  // Permissions
  // --------------------------------------------------

  const permissionRecords = new Map<string, string>();

  for (const [key, name] of permissions) {
    const permission = await prisma.permission.upsert({
      where: {
        key,
      },
      update: {
        name,
      },
      create: {
        key,
        name,
      },
    });

    permissionRecords.set(key, permission.id);
  }

  console.log(`${permissionRecords.size} permissions ready.`);

  // --------------------------------------------------
  // Roles + role permissions
  // --------------------------------------------------

  const roleRecords = new Map<string, string>();

  for (const roleDefinition of roleDefinitions) {
    const role = await prisma.role.upsert({
      where: {
        organizationId_key: {
          organizationId: organization.id,
          key: roleDefinition.key,
        },
      },
      update: {
        name: roleDefinition.name,
        description: roleDefinition.description,
      },
      create: {
        organizationId: organization.id,
        key: roleDefinition.key,
        name: roleDefinition.name,
        description: roleDefinition.description,
      },
    });

    roleRecords.set(roleDefinition.key, role.id);

    // Make the seed repeatable.
    await prisma.rolePermission.deleteMany({
      where: {
        roleId: role.id,
      },
    });

    const rolePermissions = roleDefinition.permissions.map((permissionKey) => {
      const permissionId = permissionRecords.get(permissionKey);

      if (!permissionId) {
        throw new Error(`Unknown permission: ${permissionKey}`);
      }

      return {
        roleId: role.id,
        permissionId,
      };
    });

    if (rolePermissions.length > 0) {
      await prisma.rolePermission.createMany({
        data: rolePermissions,
        skipDuplicates: true,
      });
    }
  }

  console.log(`${roleRecords.size} roles ready.`);

  // --------------------------------------------------
  // Initial Super Admin user
  // --------------------------------------------------

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const adminUser = await prisma.user.upsert({
    where: {
      email: adminEmail.toLowerCase(),
    },
    update: {
      name: "Admin",
      passwordHash,
      status: "ACTIVE",
      isSystemAdmin: true,
    },
    create: {
      name: "Admin",
      email: adminEmail.toLowerCase(),
      passwordHash,
      status: "ACTIVE",
      isSystemAdmin: true,
    },
  });

  console.log(`Admin user ready: ${adminUser.email}`);

  const superAdminRoleId = roleRecords.get("super_admin");

  if (!superAdminRoleId) {
    throw new Error("Super Admin role was not created.");
  }

  // --------------------------------------------------
  // Membership
  // --------------------------------------------------

  await prisma.membership.upsert({
    where: {
      organizationId_userId: {
        organizationId: organization.id,
        userId: adminUser.id,
      },
    },
    update: {
      roleId: superAdminRoleId,
    },
    create: {
      organizationId: organization.id,
      userId: adminUser.id,
      roleId: superAdminRoleId,
    },
  });

  // --------------------------------------------------
  // Initial activity log
  // --------------------------------------------------

  const existingSeedLog = await prisma.activityLog.findFirst({
    where: {
      organizationId: organization.id,
      actorUserId: adminUser.id,
      action: "system.initialized",
    },
  });

  if (!existingSeedLog) {
    await prisma.activityLog.create({
      data: {
        organizationId: organization.id,
        actorUserId: adminUser.id,
        action: "system.initialized",
        entityType: "Organization",
        entityId: organization.id,
        details: {
          message: "Initial Social Media Hub setup completed.",
        },
      },
    });
  }

  console.log("");
  console.log("Seed completed successfully.");
  console.log(`Organization: ${organization.name}`);
  console.log(`Super Admin: ${adminUser.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });