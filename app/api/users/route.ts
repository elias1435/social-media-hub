import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!session.user.isSystemAdmin) {
      return NextResponse.json(
        { message: "You do not have permission to create users." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string" ? body.password : "";

    const roleId =
      typeof body.roleId === "string" ? body.roleId : "";

    const organizationId =
      typeof body.organizationId === "string"
        ? body.organizationId
        : "";

    if (!name || !email || !password || !roleId || !organizationId) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    if (password.length < 12) {
      return NextResponse.json(
        {
          message: "Password must be at least 12 characters.",
        },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message: "A user with this email already exists.",
        },
        { status: 409 }
      );
    }

    const role = await prisma.role.findUnique({
      where: {
        id: roleId,
      },
    });

    if (!role) {
      return NextResponse.json(
        { message: "Invalid role." },
        { status: 400 }
      );
    }

    const organization = await prisma.organization.findUnique({
      where: {
        id: organizationId,
      },
    });

    if (!organization) {
      return NextResponse.json(
        { message: "Invalid organization." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        status: "ACTIVE",

        memberships: {
          create: {
            organizationId,
            roleId,
          },
        },
      },

      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "User created successfully.",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE USER ERROR:", error);

    return NextResponse.json(
      {
        message: "Unable to create user.",
      },
      { status: 500 }
    );
  }
}