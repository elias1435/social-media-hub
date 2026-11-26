import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import PageNavigation from "@/components/facebook/PageNavigation";
import PublishingCalendar from "@/components/planner/PublishingCalendar";
import JobList from "@/components/automation/JobList";
import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";
import {hasOrgPermission} from "@/lib/permissions";
import {decryptToken,graphGet} from "@/lib/meta-connection";
export const dynamic="force-dynamic";
type MetaScheduled={id:string;message?:string;scheduled_publish_time?:string|number};
type LogDetails={postId?:string;mediaType?:string;scheduledAt?:string};
export default async function Planner({searchParams}:{searchParams:Promise<{page?:string}>}){
 const {page}=await searchParams;
 const session=await auth(),org=session?.user?.organizationId,user=session?.user?.id;
 const allowed=org&&user?await hasOrgPermission(user,org,"facebook.posts.view"):false;
 if(!allowed)return <AppShell><PageHeader title="Content Planner" description="Access restricted"/><p className="rounded-xl bg-white p-6 text-sm">Your role cannot view the publishing planner.</p></AppShell>;
 const pages=await prisma.socialAccount.findMany({where:{organizationId:org!,platform:"FACEBOOK",status:"CONNECTED"},select:{id:true,name:true,externalAccountId:true,accessTokenCiphertext:true},orderBy:{name:"asc"}});
 const selected=page&&pages.some(p=>p.id===page)?page:null;
 const history=await prisma.activityLog.findMany({where:{organizationId:org!,action:{in:["FACEBOOK_POST_SCHEDULED","FACEBOOK_POST_PUBLISHED","FACEBOOK_REEL_PUBLISHED","FACEBOOK_VIDEO_UPLOADED","INSTAGRAM_IMAGE_PUBLISHED","INSTAGRAM_PHOTO_SCHEDULED"]}},orderBy:{createdAt:"desc"},take:100,select:{id:true,action:true,entityId:true,details:true,createdAt:true}});
 const queued=await prisma.automationJob.findMany({where:{organizationId:org!,kind:"INSTAGRAM_PHOTO"},orderBy:{scheduledAt:"desc"},take:100,select:{id:true,status:true,scheduledAt:true,payload:true}});
 const events:Array<{id:string;title:string;at:string;platform:"FACEBOOK"|"INSTAGRAM";status:string;jobId?:string}>=[];
 const apiWarnings:string[]=[];
 for(const account of pages.filter(p=>!selected||p.id===selected).slice(0,12)){
  if(!account.accessTokenCiphertext)continue;
  try{
   const data=await graphGet<{data?:MetaScheduled[]}>("/"+account.externalAccountId+"/scheduled_posts",decryptToken(account.accessTokenCiphertext),{fields:"id,message,scheduled_publish_time",limit:"50"});
   for(const post of data.data||[]){
    const raw=post.scheduled_publish_time;
    const at=typeof raw==="number"||/^\d+$/.test(String(raw||""))?new Date(Number(raw)*1000):new Date(raw||"");
    if(Number.isNaN(at.getTime()))continue;
    events.push({id:post.id,title:account.name+": "+(post.message?.slice(0,50)||"Scheduled Facebook post"),at:at.toISOString(),platform:"FACEBOOK",status:"Scheduled on Meta"});
   }
  }catch{apiWarnings.push("Unable to load scheduled posts from "+account.name);}
 }
 for(const job of queued){
  const payload=job.payload as {pageId?:string;caption?:string}|null;
  if(selected&&payload?.pageId!==selected)continue;
  events.push({id:job.id,title:"Instagram: "+(payload?.caption?.slice(0,50)||"Scheduled photo"),at:job.scheduledAt.toISOString(),platform:"INSTAGRAM",status:job.status,jobId:job.id});
 }
 const nameById=new Map(pages.map(p=>[p.id,p.name]));
 return <AppShell>
  <PageHeader title="Content Planner" description="Live Facebook Page scheduled posts, locally queued Instagram publishing, and activity history." action={<Link href={selected?"/facebook/create-post?page="+encodeURIComponent(selected):"/facebook/create-post"} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">+ Create post or Reel</Link>}/>
  {selected&&<PageNavigation accountId={selected} active="planner"/>}
  <div className="mb-5 flex flex-wrap items-center gap-3"><Link href="/content-planner" className={!selected?"rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white":"rounded-lg border bg-white px-4 py-2 text-sm"}>All Pages</Link>{pages.map(p=><Link key={p.id} href={"/content-planner?page="+encodeURIComponent(p.id)} className={selected===p.id?"rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white":"rounded-lg border bg-white px-4 py-2 text-sm"}>{p.name}</Link>)}</div>
  {apiWarnings.length>0&&<p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{apiWarnings.join(" · ")}</p>}
  <PublishingCalendar events={events}/>
  <div className="mt-6"><JobList/></div>
  <section className="mt-6 rounded-xl border border-slate-200 bg-white"><div className="border-b border-slate-100 p-5"><h2 className="font-semibold">Publishing history</h2><p className="mt-1 text-xs text-slate-500">Recorded actions from this portal. Historical entries are audit records, not guaranteed current Meta post statuses. Meta-managed scheduled posts can be changed in Meta Business Suite.</p></div>
  {history.length?<div className="divide-y divide-slate-100">{history.filter(h=>!selected||h.entityId===selected).map(h=>{const d=h.details as LogDetails|null;return <div key={h.id} className="flex flex-wrap justify-between gap-3 p-4 text-sm"><div><p className="font-semibold">{nameById.get(h.entityId||"")||h.action.replaceAll("_"," ")}</p><p className="mt-1 text-xs text-slate-500">{d?.mediaType||"Post"} · {h.action.replaceAll("_"," ")} · {h.createdAt.toLocaleString()}</p>{d?.scheduledAt&&<p className="mt-1 text-xs text-blue-700">Scheduled for {new Date(d.scheduledAt).toLocaleString()}</p>}</div><span className="text-xs text-slate-500">Audit log</span></div>})}</div>:<p className="p-6 text-sm text-slate-500">No recorded publishing activity.</p>}</section>
 </AppShell>;
}
