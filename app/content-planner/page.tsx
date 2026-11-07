import PageNavigation from "@/components/facebook/PageNavigation";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";

type LogDetails = { postId?: string; mode?: string; mediaType?: string; scheduledAt?: string|null };
export default async function Planner({searchParams}:{searchParams:Promise<{page?:string}>}){
 const {page}=await searchParams;
 const session=await auth();
 const entries=session?.user?.organizationId?await prisma.activityLog.findMany({
  where:{organizationId:session.user.organizationId,action:{in:["FACEBOOK_POST_SCHEDULED","FACEBOOK_POST_PUBLISHED"]}},
  orderBy:{createdAt:"desc"},take:100,
  select:{id:true,action:true,createdAt:true,entityId:true,details:true},
 }):[];
 const filtered=page?entries.filter(e=>e.entityId===page):entries;
 const ids=[...new Set(entries.map(e=>e.entityId).filter((id):id is string=>Boolean(id)))];
 const pages=session?.user?.organizationId?await prisma.socialAccount.findMany({
  where:{organizationId:session.user.organizationId,id:{in:ids}},select:{id:true,name:true},
 }):[];
 const nameById=new Map(pages.map(p=>[p.id,p.name]));
 const selectedAccount=page&&session?.user?.organizationId?await prisma.socialAccount.findFirst({where:{id:page,organizationId:session.user.organizationId,platform:"FACEBOOK"},select:{id:true}}):null;
 const selected=selectedAccount?.id||null;
 return <AppShell>
  <PageHeader title="Content Planner" description="Publishing activity recorded by Social Media Hub. Scheduled posts are handled by Meta." action={<Link href={selected?"/facebook/create-post?page="+selected:"/facebook/create-post"} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">+ Create Facebook Post</Link>}/>
  {selected&&<PageNavigation accountId={selected} active="planner"/>}
  <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
   <div className="border-b border-slate-100 p-5"><h2 className="font-bold">Publishing activity</h2><p className="mt-1 text-xs text-slate-500">Shows posts created from this app. Publishing status can change on Facebook; this is an activity log, not a live scheduled-post synchronization.</p></div>
   {filtered.length===0?<div className="p-8 text-sm text-slate-500">No posts have been published or scheduled through Social Media Hub yet.</div>:<div className="divide-y divide-slate-100">{filtered.map(entry=>{
    const details=entry.details as LogDetails|null;
    const scheduled=entry.action==="FACEBOOK_POST_SCHEDULED";
    return <div key={entry.id} className="flex flex-wrap items-start justify-between gap-4 p-5"><div><p className="font-semibold text-slate-800">{nameById.get(entry.entityId||"")||"Facebook Page"}</p><p className="mt-1 text-xs text-slate-500">{details?.mediaType==="image"?"Image":"Text"} post · {scheduled?"Scheduled on Meta":"Published through Meta"}</p><p className="mt-2 text-xs text-slate-400">Created {entry.createdAt.toLocaleString()}</p>{scheduled&&details?.scheduledAt&&<p className="mt-1 text-xs font-semibold text-blue-700">Scheduled for {new Date(details.scheduledAt).toLocaleString()}</p>}</div><span className={scheduled?"rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700":"rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700"}>{scheduled?"Scheduled":"Submitted"}</span></div>;
   })}</div>}
  </div>
  <p className="mt-4 text-xs text-slate-500">Browser-only drafts are stored on the device where they were created. Open Create Facebook Post on that device to load them.</p>
 </AppShell>;
}
