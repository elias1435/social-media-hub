import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
export const dynamic="force-dynamic";
export default async function Connected(){
 const session=await auth();
 const accounts=session?.user?.organizationId?await prisma.socialAccount.findMany({where:{organizationId:session.user.organizationId},select:{id:true,name:true,platform:true,status:true,updatedAt:true},orderBy:{updatedAt:"desc"}}):[];
 const platforms=["FACEBOOK","INSTAGRAM","WHATSAPP","YOUTUBE","TIKTOK","TELEGRAM"];
 return <AppShell><PageHeader title="Connected Accounts" description="Real connected assets in your workspace, not demonstration accounts." action={<Link href="/connected-accounts/meta" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">+ Connect Meta</Link>}/>
 <div className="grid gap-4 md:grid-cols-2">{platforms.map(platform=>{const list=accounts.filter(a=>a.platform===platform);const active=list.filter(a=>a.status==="CONNECTED");return <div key={platform} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-bold capitalize">{platform.toLowerCase()}</h2><p className="mt-2 text-sm text-slate-500">{active.length} connected {active.length===1?"account":"accounts"}</p>{list.length?<div className="mt-4 space-y-2">{list.map(a=><div key={a.id} className="flex items-center justify-between gap-2 border-t border-slate-100 py-2 text-sm"><span>{a.name}</span><span className={a.status==="CONNECTED"?"font-semibold text-green-700":"text-slate-500"}>{a.status}</span></div>)}</div>:<p className="mt-4 text-sm text-slate-400">No accounts connected yet.</p>}{platform==="FACEBOOK"&&<Link className="mt-4 inline-block text-sm font-semibold text-blue-600" href="/facebook">Manage Facebook Pages</Link>}</div>})}</div></AppShell>;
}
