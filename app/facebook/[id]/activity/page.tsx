import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import PageNavigation from "@/components/facebook/PageNavigation";
export const dynamic="force-dynamic";
type LogDetails={postId?:string; scheduledAt?:string|null;mediaType?:string;commentId?:string;replyId?:string};
export default async function PageActivity({params}:{params:Promise<{id:string}>}){
 const session=await auth();
 if(!session?.user?.organizationId)redirect("/login");
 const {id}=await params;
 const page=await prisma.socialAccount.findFirst({where:{id,organizationId:session.user.organizationId,platform:"FACEBOOK"},select:{id:true,name:true}});
 if(!page)notFound();
 const logs=await prisma.activityLog.findMany({where:{organizationId:session.user.organizationId,entityType:"SocialAccount",entityId:id},orderBy:{createdAt:"desc"},take:100,select:{id:true,action:true,createdAt:true,details:true}});
 return <AppShell><PageHeader title={page.name+" — Activity"} description="A history of actions recorded by Social Media Hub, not a full Meta audit log." action={<Link href={"/facebook/"+id} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold">Back to Overview</Link>}/>
 <PageNavigation accountId={id} active="activity"/><div className="rounded-xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 p-5"><h2 className="font-bold">Recent activity</h2></div>{logs.length===0?<p className="p-6 text-sm text-slate-500">No recorded actions for this Page yet.</p>:<div className="divide-y divide-slate-100">{logs.map(log=>{const details=log.details as LogDetails|null;return <div key={log.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"><div><p className="text-sm font-semibold text-slate-800">{log.action.replaceAll("_"," ")}</p>{details?.scheduledAt&&<p className="mt-1 text-xs text-blue-600">Scheduled for {new Date(details.scheduledAt).toLocaleString()}</p>}</div><span className="text-xs text-slate-400">{log.createdAt.toLocaleString()}</span></div>})}</div>}</div></AppShell>;
}
