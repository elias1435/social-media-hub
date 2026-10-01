const users = [
  {
    name: "Rahim Uddin",
    role: "Video Uploader",
    platform: "Facebook",
    accounts: "3 Pages",
    status: "Active",
  },
  {
    name: "Sadia Akter",
    role: "Customer Care",
    platform: "Facebook",
    accounts: "2 Pages",
    status: "Active",
  },
  {
    name: "Karim Hossain",
    role: "Customer Care",
    platform: "WhatsApp",
    accounts: "3 Numbers",
    status: "Active",
  },
  {
    name: "Nabila Islam",
    role: "Content Team",
    platform: "YouTube",
    accounts: "2 Channels",
    status: "Active",
  },
];

export default function TeamAccess() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h3 className="font-semibold text-slate-900">
            Team Access & Roles
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            User permissions and platform access
          </p>
        </div>

        <button className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white">
          Manage Users
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-5 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Platform</th>
              <th className="px-4 py-3">Access</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.name}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-slate-200" />

                    <div>
                      <p className="font-medium text-slate-800">
                        {user.name}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4 text-slate-600">
                  {user.role}
                </td>

                <td className="px-4 py-4 text-slate-600">
                  {user.platform}
                </td>

                <td className="px-4 py-4 text-slate-600">
                  {user.accounts}
                </td>

                <td className="px-4 py-4">
                  <span className="rounded-full bg-green-50 px-2 py-1 text-[11px] font-medium text-green-600">
                    {user.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}