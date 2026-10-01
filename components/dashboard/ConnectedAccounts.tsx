import { MoreVertical } from "lucide-react";

const accounts = [
  {
    name: "Ashik International Limited",
    followers: "125,430 followers",
  },
  {
    name: "Geo Market BD",
    followers: "98,210 followers",
  },
  {
    name: "Manobik Ashik Foundation",
    followers: "42,850 followers",
  },
  {
    name: "Ashik Tech World",
    followers: "28,430 followers",
  },
  {
    name: "Ashik Hotel & Restaurant",
    followers: "18,920 followers",
  },
];

export default function ConnectedAccounts() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h3 className="font-semibold text-slate-900">Connected Accounts</h3>

        <button className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700">
          + Add Account
        </button>
      </div>

      <div className="flex gap-2 border-b border-slate-200 px-5 py-3 text-xs">
        <button className="rounded-lg bg-blue-50 px-3 py-2 font-medium text-blue-600">
          Facebook Pages (8)
        </button>

        <button className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-50">
          YouTube Channels (8)
        </button>

        <button className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-50">
          WhatsApp Numbers (8)
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {accounts.map((account) => (
          <div
            key={account.name}
            className="flex items-center gap-3 px-5 py-3"
          >
            <div className="h-10 w-10 rounded-full bg-slate-200" />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800">
                {account.name}
              </p>

              <p className="text-xs text-slate-400">
                {account.followers}
              </p>
            </div>

            <span className="flex items-center gap-1 text-xs font-medium text-green-600">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Connected
            </span>

            <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-blue-600">
              Manage
            </button>

            <MoreVertical size={17} className="text-slate-400" />
          </div>
        ))}
      </div>
    </section>
  );
}