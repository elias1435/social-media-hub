import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import SettingsForm from "@/components/settings/SettingsForm";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
export const dynamic="force-dynamic";
export default async function Settings(){
 const session=await auth(),org=session?.user?.organizationId;
 const [setting,accounts]=org?await Promise.all([
  prisma.organizationSetting.findUnique({where:{organizationId:org}}),
  prisma.socialAccount.findMany({where:{organizationId:org},select:{id:true,name:true,platform:true,status:true,tokenExpiresAt:true},orderBy:{name:"asc"}})
 ]):[null,[]];
 const initial={timezone:setting?.timezone||"Asia/Dhaka",notifyInApp:setting?.notifyInApp??true,notifyEmail:setting?.notifyEmail??false,autoAssignInbox:setting?.autoAssignInbox??false,enableAutomation:setting?.enableAutomation??false,defaultPublishMode:setting?.defaultPublishMode||"now"};
 return <AppShell><PageHeader title="Settings & API Status" description="Saved organization preferences and real connected accounts."/>
 <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]"><SettingsForm initial={initial} canEdit={Boolean(session?.user?.isSystemAdmin)}/>
 <section className="rounded-xl border border-slate-200 bg-white p-6"><h2 className="text-lg font-bold">Connected accounts</h2><p className="mt-2 text-xs text-slate-500">Live connection records. A CONNECTED record does not guarantee Meta permission approval or token validity.</p>
 <div className="mt-5 divide-y divide-slate-100">{accounts.length?accounts.map(a=><div key={a.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><div><p className="font-semibold">{a.name}</p><p className="mt-1 text-xs text-slate-500">{a.platform} {a.tokenExpiresAt?"· Token expiry: "+a.tokenExpiresAt.toLocaleDateString():"· Expiry not provided"}</p></div><span className={a.status==="CONNECTED"?"text-green-700":"text-amber-700"}>{a.status}</span></div>):<p className="py-4 text-sm text-slate-500">No connected social accounts.</p>}</div>
 <p className="mt-4 text-xs text-slate-500">Ads authorization also requires its separate Marketing API credentials.</p>
 </section></div></AppShell>;
}
