import {preferredPage} from "@/lib/workspace-page";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import PageNavigation from "@/components/facebook/PageNavigation";
import PublishingCalendar from "@/components/planner/PublishingCalendar";
import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";
import {hasOrgPermission} from "@/lib/permissions";
import {decryptToken,graphGet} from "@/lib/meta-connection";
export const dynamic="force-dynamic";
type MetaScheduled={id:string;message?:string;scheduled_publish_time?:string|number};
export default async function Planner({searchParams}:{searchParams:Promise<{page?:string}>}){
 const {page}=await searchParams;
 const session=await auth(),org=session?.user?.organizationId,user=session?.user?.id;
 const allowed=org&&user?await hasOrgPermission(user,org,"facebook.posts.view"):false;
 if(!allowed)return <AppShell><PageHeader title="Content Planner" description="Access restricted"/><p className="rounded-xl bg-white p-6 text-sm">Your role cannot view the publishing planner.</p></AppShell>;
 const pages=await prisma.socialAccount.findMany({where:{organizationId:org!,platform:"FACEBOOK",status:"CONNECTED"},select:{id:true,name:true,externalAccountId:true,accessTokenCiphertext:true},orderBy:{name:"asc"}});
 const preferred=await preferredPage(user,org);
 const requested=page==="all"?null:page||preferred;
 const selected=requested&&pages.some(p=>p.id===requested)?requested:null;
 const queued=await prisma.automationJob.findMany({where:{organizationId:org!,kind:"INSTAGRAM_PHOTO",status:{in:["PENDING","PROCESSING","NEEDS_REVIEW"]}},orderBy:{scheduledAt:"desc"},take:100,select:{id:true,status:true,scheduledAt:true,payload:true}});
 const events:Array<{id:string;title:string;at:string;platform:"FACEBOOK"|"INSTAGRAM";status:string;jobId?:string;accountId?:string}>=[];
 const apiWarnings:string[]=[];
 await Promise.all(pages.filter(p=>!selected||p.id===selected).slice(0,12).map(async account=>{
  if(!account.accessTokenCiphertext)return;
  try{
   const data=await graphGet<{data?:MetaScheduled[]}>("/"+account.externalAccountId+"/scheduled_posts",decryptToken(account.accessTokenCiphertext),{fields:"id,message,scheduled_publish_time",limit:"50"});
   for(const post of data.data||[]){
    const raw=post.scheduled_publish_time;
    const at=typeof raw==="number"||/^\d+$/.test(String(raw||""))?new Date(Number(raw)*1000):new Date(raw||"");
    if(Number.isNaN(at.getTime()))continue;
    events.push({id:post.id,title:account.name+": "+(post.message||"Scheduled Facebook post"),at:at.toISOString(),platform:"FACEBOOK",status:"Scheduled on Meta",accountId:account.id});
   }
  }catch{apiWarnings.push("Unable to load scheduled posts from "+account.name);}
 }));
 for(const job of queued){
  const payload=job.payload as {pageId?:string;caption?:string}|null;
  if(selected&&payload?.pageId!==selected)continue;
  events.push({id:job.id,title:"Instagram: "+(payload?.caption||"Scheduled photo"),at:job.scheduledAt.toISOString(),platform:"INSTAGRAM",status:job.status,jobId:job.id});
 }
 const [canCreate,canPublish]=await Promise.all([hasOrgPermission(user!,org!,"facebook.posts.create"),hasOrgPermission(user!,org!,"facebook.posts.publish")]);
 return <AppShell>
  <PageHeader title="Content Planner" description="View and manage scheduled Facebook and Instagram content." action={<Link href={selected?"/facebook/create-post?page="+encodeURIComponent(selected):"/facebook/create-post"} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">+ Create post or Reel</Link>}/>
  {selected&&<PageNavigation accountId={selected} active="planner"/>}
  <div className="mb-5 flex flex-wrap items-center gap-3"><Link href="/content-planner?page=all" className={!selected?"rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white":"rounded-lg border bg-white px-4 py-2 text-sm"}>All Pages</Link>{pages.map(p=><Link key={p.id} href={"/content-planner?page="+encodeURIComponent(p.id)} className={selected===p.id?"rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white":"rounded-lg border bg-white px-4 py-2 text-sm"}>{p.name}</Link>)}</div>
  {apiWarnings.length>0&&<p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{apiWarnings.join(" · ")}</p>}
  <PublishingCalendar key={selected||"all"} events={events} pageId={selected||undefined} canCreate={canCreate} canPublish={canPublish}/>
 </AppShell>;
}
