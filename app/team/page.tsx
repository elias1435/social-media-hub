import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import CreateUserForm from "@/components/users/CreateUserForm";

export default async function TeamPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!session.user.isSystemAdmin) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
          You do not have permission to manage users.
        </div>
      </div>
    );
  }

  const [roles, organizations, users] =
    await Promise.all([
      prisma.role.findMany({
        orderBy: {
          name: "asc",
        },

        select: {
          id: true,
          name: true,
        },
      }),

      prisma.organization.findMany({
        orderBy: {
          name: "asc",
        },

        select: {
          id: true,
          name: true,
        },
      }),

      prisma.user.findMany({
        orderBy: {
          createdAt: "desc",
        },

        include: {
          memberships: {
            include: {
              role: true,
              organization: true,
            },
          },
        },
      }),
    ]);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Team / Users
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage users, client logins and access.
        </p>
      </div>

      <CreateUserForm
        roles={roles}
        organizations={organizations}
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="font-semibold text-slate-900">
            Users
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">
                  Organization
                </th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => {
                const membership =
                  user.memberships[0];

                return (
                  <tr
                    key={user.id}
                    className="border-t border-slate-100"
                  >
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {user.name || "—"}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {user.email}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {membership?.organization
                        ?.name || "—"}
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {membership?.role?.name || "—"}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                        {user.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}