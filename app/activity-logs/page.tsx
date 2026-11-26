import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hasOrgPermission } from "@/lib/permissions";

export const dynamic="force-dynamic";
export default async function Logs({searchParams}:{searchParams:Promise<{from?:string;to?:string}>}){
 const {from,to}=await searchParams;
 const session=await auth();
 const org=session?.user?.organizationId;
 const allowed=org&&session?.user?.id?await hasOrgPermission(session.user.id,org,"activity_logs.view"):false;
 if(!allowed)return <AppShell><PageHeader title="Activity Logs" description="Workspace activity"/><div className="rounded-xl bg-white p-6">You do not have permission to view activity logs.</div></AppShell>;
 const start=from&&/^\d{4}-\d{2}-\d{2}$/.test(from)?new Date(from+"T00:00:00.000Z"):null;
 const end=to&&/^\d{4}-\d{2}-\d{2}$/.test(to)?new Date(to+"T23:59:59.999Z"):null;
 const dates=(start&&!Number.isNaN(start.getTime())||end&&!Number.isNaN(end.getTime()))?{createdAt:{...(start&&!Number.isNaN(start.getTime())?{gte:start}:{}),...(end&&!Number.isNaN(end.getTime())?{lte:end}:{})}}:{};
 const rows=await prisma.activityLog.findMany({where:{organizationId:org!,...dates},orderBy:{createdAt:"desc"},take:150,include:{actor:{select:{name:true,email:true}}}});
 return <AppShell><PageHeader title="Activity Logs" description="Recorded workspace actions. Date range uses UTC calendar dates."/>{from&&to&&<p className="mb-4 text-sm text-slate-600">Showing activity from {from} to {to}. <a className="font-semibold text-blue-600" href="/activity-logs">Clear dates</a></p>}
 <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="px-5 py-3">Time (local)</th><th className="px-5 py-3">User</th><th className="px-5 py-3">Action</th><th className="px-5 py-3">Item</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map(a=><tr key={a.id}><td className="whitespace-nowrap px-5 py-3">{a.createdAt.toLocaleString()}</td><td className="px-5 py-3">{a.actor?.name||a.actor?.email||"System"}</td><td className="px-5 py-3">{a.action.replaceAll("_"," ")}</td><td className="break-all px-5 py-3 text-xs text-slate-500">{a.entityType||"—"}</td></tr>)}</tbody></table>{rows.length===0&&<p className="p-6 text-sm text-slate-500">No activity found for this date range.</p>}</div>
 </AppShell>;
}
