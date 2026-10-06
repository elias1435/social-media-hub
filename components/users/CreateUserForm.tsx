"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

type Role = {
  id: string;
  name: string;
};

type Organization = {
  id: string;
  name: string;
};

type Props = {
  roles: Role[];
  organizations: Organization[];
};

export default function CreateUserForm({
  roles,
  organizations,
}: Props) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    roleId: "",
    organizationId: "",
  });

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);

    try {
      const response = await fetch("/api/users", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Unable to create user.");
        return;
      }

      toast.success("User created successfully.");

      setForm({
        name: "",
        email: "",
        password: "",
        roleId: "",
        organizationId: "",
      });
    } catch (error) {
      console.error(error);

      toast.error(
        "Something went wrong while creating the user."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <UserPlus size={20} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Add New User
          </h2>

          <p className="text-sm text-slate-500">
            Create a login and assign a role.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-5 md:grid-cols-2"
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Full Name
          </label>

          <input
            required
            value={form.name}
            onChange={(event) =>
              updateField("name", event.target.value)
            }
            className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            placeholder="Client Name"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Email
          </label>

          <input
            required
            type="email"
            value={form.email}
            onChange={(event) =>
              updateField("email", event.target.value)
            }
            className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            placeholder="client@example.com"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Password
          </label>

          <input
            required
            type="password"
            minLength={12}
            value={form.password}
            onChange={(event) =>
              updateField("password", event.target.value)
            }
            className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
            placeholder="Minimum 12 characters"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Role
          </label>

          <select
            required
            value={form.roleId}
            onChange={(event) =>
              updateField("roleId", event.target.value)
            }
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
          >
            <option value="">Select Role</option>

            {roles.map((role) => (
              <option
                key={role.id}
                value={role.id}
              >
                {role.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Organization
          </label>

          <select
            required
            value={form.organizationId}
            onChange={(event) =>
              updateField(
                "organizationId",
                event.target.value
              )
            }
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
          >
            <option value="">
              Select Organization
            </option>

            {organizations.map((organization) => (
              <option
                key={organization.id}
                value={organization.id}
              >
                {organization.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <UserPlus size={17} />

            {loading
              ? "Creating User..."
              : "Create User"}
          </button>
        </div>
      </form>
    </div>
  );
}