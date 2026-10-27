import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Users, Link2, FileText, Activity, Plus, BarChart3 } from "lucide-react";
export const dynamic="force-dynamic";
export default async function Home(){
 const session=await auth();
 const organizationId=session?.user?.organizationId;
 const [pages,users,activities]=organizationId?await Promise.all([
  prisma.socialAccount.findMany({where:{organizationId,platform:"FACEBOOK"},select:{id:true,name:true,status:true,metadata:true},orderBy:{updatedAt:"desc"}}),
  prisma.membership.count({where:{organizationId}}),
  prisma.activityLog.findMany({where:{organizationId},orderBy:{createdAt:"desc"},take:8,select:{id:true,action:true,createdAt:true}})
 ]):[[],0,[]];
 const connected=pages.filter(p=>p.status==="CONNECTED");
 const cards=[{label:"Connected Facebook Pages",value:connected.length,icon:Link2},{label:"Team members",value:users,icon:Users},{label:"Recent activities",value:activities.length,icon:Activity}];
 return <AppShell><div className="space-y-6"><div><h2 className="text-2xl font-bold">Welcome back!</h2><p className="mt-1 text-sm text-slate-500">Live workspace overview for {session?.user?.organizationName||"your organization"}.</p></div>
 <div className="grid gap-4 md:grid-cols-3">{cards.map(({label,value,icon:Icon})=><div key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><Icon size={20} className="text-blue-600"/><p className="mt-3 text-xs font-semibold text-slate-500">{label}</p><p className="mt-1 text-3xl font-bold">{value}</p></div>)}</div>
 <div className="grid gap-6 lg:grid-cols-2"><div className="rounded-xl border border-slate-200 bg-white p-6"><div className="flex justify-between gap-3"><h3 className="font-bold">Your Facebook Pages</h3><Link href="/facebook" className="text-xs font-semibold text-blue-600">View all</Link></div>{pages.length?<div className="mt-4 divide-y divide-slate-100">{pages.map(p=><Link href={"/facebook/"+p.id} key={p.id} className="flex justify-between gap-2 py-3 text-sm"><span className="font-medium">{p.name}</span><span className={p.status==="CONNECTED"?"text-green-700":"text-slate-500"}>{p.status}</span></Link>)}</div>:<p className="mt-4 text-sm text-slate-500">No Facebook Pages connected yet.</p>}<Link href="/connected-accounts/meta" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"><Plus size={16}/>Connect Page</Link></div>
 <div className="rounded-xl border border-slate-200 bg-white p-6"><h3 className="font-bold">Quick actions</h3><div className="mt-4 grid gap-3">{[{text:"Create Facebook Post",href:"/facebook/create-post",icon:FileText},{text:"View Facebook Posts",href:"/facebook/posts",icon:FileText},{text:"View Live Analytics",href:"/analytics",icon:BarChart3},{text:"Connected Accounts",href:"/connected-accounts",icon:Link2}].map(a=><Link href={a.href} key={a.href} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><a.icon size={18} className="text-blue-600"/>{a.text}</Link>)}</div></div></div>
 <div className="rounded-xl border border-slate-200 bg-white p-6"><h3 className="font-bold">Recent activity</h3>{activities.length?<div className="mt-4 divide-y divide-slate-100">{activities.map(a=><div key={a.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><span>{a.action.replaceAll("_"," ")}</span><span className="text-xs text-slate-400">{a.createdAt.toLocaleString()}</span></div>)}</div>:<p className="mt-3 text-sm text-slate-500">No activity recorded yet.</p>}</div></div></AppShell>;
}
