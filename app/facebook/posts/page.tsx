import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { decryptToken,graphGet } from "@/lib/meta-connection";
export const dynamic="force-dynamic";
type Post={id:string;message?:string;created_time?:string;permalink_url?:string};
export default async function Posts({searchParams}:{searchParams:Promise<{page?:string}>}){
 const session=await auth();const params=await searchParams;
 const pages=session?.user?.organizationId?await prisma.socialAccount.findMany({where:{organizationId:session.user.organizationId,platform:"FACEBOOK",status:"CONNECTED"},select:{id:true,name:true,externalAccountId:true,accessTokenCiphertext:true}}):[];
 const selected=pages.find(p=>p.id===params.page)||pages[0];
 let posts:Post[]=[];let error="";
 if(selected?.accessTokenCiphertext){try{const token=decryptToken(selected.accessTokenCiphertext);const data=await graphGet<{data?:Post[]}>("/"+selected.externalAccountId+"/posts",token,{fields:"id,message,created_time,permalink_url",limit:"40"});posts=data.data||[];}catch(e){error=e instanceof Error?e.message:"Could not load Page posts";}}
 return <AppShell><PageHeader title="Facebook Posts" description="Actual published content from your connected Pages." action={<Link href="/facebook/create-post" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">+ Create Post</Link>}/>
 <div className="rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-5"><span className="text-sm font-semibold">Facebook Page:</span>{pages.map(p=><Link key={p.id} href={"/facebook/posts?page="+p.id} className={`rounded-lg border px-3 py-2 text-sm ${selected?.id===p.id?"border-blue-600 bg-blue-50 text-blue-700":"border-slate-200 text-slate-600"}`}>{p.name}</Link>)}{pages.length===0&&<Link className="text-sm text-blue-600" href="/connected-accounts/meta">Connect Facebook first</Link>}</div>
 {error?<p className="m-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">Meta returned an error: {error}</p>:posts.length===0?<p className="p-8 text-sm text-slate-500">No published posts returned for this Page.</p>:<div className="divide-y divide-slate-100">{posts.map(p=><div key={p.id} className="flex items-start justify-between gap-4 p-5"><div><p className="whitespace-pre-wrap text-sm text-slate-800">{p.message||"Facebook post (no text)"}</p><p className="mt-2 text-xs text-slate-400">{p.created_time?new Date(p.created_time).toLocaleString():""}</p></div>{p.permalink_url&&<a href={p.permalink_url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-sm font-semibold text-blue-600">View post</a>}</div>)}</div>}</div></AppShell>;
}
