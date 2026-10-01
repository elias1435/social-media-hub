import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import StatusBadge from "@/components/ui/StatusBadge";
import DemoAvatar from "@/components/ui/DemoAvatar";

const pages = [
  ["Ashik International", "125,430", "Connected"], ["Geo Market BD", "98,210", "Connected"], ["Manobik Ashik Foundation", "42,850", "Connected"], ["Ashik Tech World", "28,430", "Connected"], ["Ashik Hotel & Restaurant", "18,920", "Connected"], ["Geo Power Market", "15,760", "Connected"], ["Geo Mega Market", "12,430", "Connected"], ["Poultry Solution BD", "9,850", "Connected"],
];

export default function FacebookPages() {
  return <AppShell><PageHeader title="Facebook Pages" description="Connect and manage all Facebook Pages from one place." action={<button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">+ Add Page</button>} />
    <Panel><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="px-5 py-3">#</th><th className="px-5 py-3">Page Name</th><th className="px-5 py-3">Followers</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{pages.map((p, i)=><tr key={p[0]}><td className="px-5 py-4 text-slate-400">{i+1}</td><td className="px-5 py-4"><div className="flex items-center gap-3"><DemoAvatar name={p[0]} /><span className="font-medium text-slate-800">{p[0]}</span></div></td><td className="px-5 py-4 text-slate-600">{p[1]}</td><td className="px-5 py-4"><StatusBadge>{p[2]}</StatusBadge></td><td className="px-5 py-4 text-right"><Link href="/facebook/dashboard" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-blue-600">Manage</Link></td></tr>)}</tbody></table></div></Panel>
  </AppShell>;
}
