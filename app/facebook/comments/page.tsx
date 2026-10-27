import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { graphGet, decryptToken } from "@/lib/meta-connection";
export const dynamic="force-dynamic";
type Comment={id:string;message?:string;created_time?:string;from?:{name?:string};permalink_url?:string};
type Post={id:string;message?:string};
export default async function Comments(){
 const session=await auth();
 const accounts=session?.user?.organizationId?await prisma.socialAccount.findMany({where:{organizationId:session.user.organizationId,platform:"FACEBOOK",status:"CONNECTED"},select:{id:true,name:true,externalAccountId:true,accessTokenCiphertext:true}}):[];
 const sections:{page:string;comments:Comment[]}[]=[];const errors:string[]=[];
 for(const account of accounts){
  if(!account.accessTokenCiphertext)continue;
  try{
   const token=decryptToken(account.accessTokenCiphertext);
   const feed=await graphGet<{data?:Post[]}>("/"+account.externalAccountId+"/posts",token,{fields:"id,message",limit:"10"});
   const all:Comment[]=[];
   for(const post of feed.data||[]){
    try{const c=await graphGet<{data?:Comment[]}>("/"+post.id+"/comments",token,{fields:"id,message,created_time,from,permalink_url",limit:"20"});all.push(...(c.data||[]));}
    catch{errors.push("Some comments for "+account.name+" could not be retrieved.");}
   }
   sections.push({page:account.name,comments:all});
  }catch{errors.push("Meta could not load comments for "+account.name+". Check pages_read_user_content permissions.");}
 }
 return <AppShell><PageHeader title="Facebook Comments" description="Recent real comments on your connected Pages (read-only)." action={<Link href="/facebook" className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold">All Pages</Link>}/>
 {accounts.length===0?<div className="rounded-xl bg-white p-8 text-sm">Connect a Facebook Page first.</div>:<div className="space-y-5">{errors.length>0&&<div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{errors.join(" ")}</div>}{sections.map(section=><div key={section.page} className="rounded-xl border border-slate-200 bg-white shadow-sm"><h2 className="border-b border-slate-100 px-5 py-4 font-semibold">{section.page}</h2>{section.comments.length===0?<p className="p-5 text-sm text-slate-500">No comments returned.</p>:<div className="divide-y divide-slate-100">{section.comments.map(comment=><div key={comment.id} className="p-5"><p className="text-sm font-semibold">{comment.from?.name||"Facebook user"}</p><p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{comment.message||"Comment without text"}</p><p className="mt-2 text-xs text-slate-400">{comment.created_time?new Date(comment.created_time).toLocaleString():""}</p>{comment.permalink_url&&<a href={comment.permalink_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs font-semibold text-blue-600">View on Facebook</a>}</div>)}</div>}</div>)}</div>}
 <p className="mt-5 text-xs text-slate-500">Replying and moderation will be enabled after the required Meta permissions and review are configured.</p>
 </AppShell>;
}
