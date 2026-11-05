import MessengerReply from "@/components/facebook/MessengerReply";
import PageNavigation from "@/components/facebook/PageNavigation";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { graphGet, decryptToken } from "@/lib/meta-connection";
export const dynamic="force-dynamic";
type Conversation={id:string;updated_time?:string;participants?:{data?:Array<{name?:string;id?:string}>};messages?:{data?:Array<{message?:string;created_time?:string;from?:{name?:string}}>}};
export default async function Messages({searchParams}:{searchParams:Promise<{page?:string}>}){
 const {page}=await searchParams;
 const session=await auth();
 const pages=session?.user?.organizationId?await prisma.socialAccount.findMany({where:{organizationId:session.user.organizationId,platform:"FACEBOOK",status:"CONNECTED"},select:{id:true,name:true,externalAccountId:true,accessTokenCiphertext:true}}):[];
 const selected=pages.find(p=>p.id===page)||pages[0];
 let conversations:Conversation[]=[];let error="";
 if(selected?.accessTokenCiphertext){
  try {
   const token=decryptToken(selected.accessTokenCiphertext);
   const result=await graphGet<{data?:Conversation[]}>("/"+selected.externalAccountId+"/conversations",token,{platform:"messenger",fields:"id,updated_time,participants,messages.limit(5){message,created_time,from}",limit:"25"});
   conversations=result.data||[];
  }catch(e){error=e instanceof Error?e.message:"Could not retrieve Messenger conversations";}
 }
 return <AppShell><PageHeader title="Facebook Messenger" description="Read recent real conversations for your connected Page (read-only)."/>
 {selected&&<PageNavigation accountId={selected.id} active="inbox"/>}
 <div className="mb-5 flex flex-wrap gap-2">{pages.map(p=><Link key={p.id} href={"/facebook/messages?page="+p.id} className={selected?.id===p.id?"rounded-lg bg-blue-600 px-3 py-2 text-sm text-white":"rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"}>{p.name}</Link>)}</div>
 {error&&<div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error}. Check pages_messaging and Page conversation permissions.</div>}
 {!selected?<p className="rounded-xl bg-white p-6 text-sm">Connect a Facebook Page first.</p>:conversations.length?<div className="grid gap-4 lg:grid-cols-2">{conversations.map(c=><div key={c.id} className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-semibold">{c.participants?.data?.map(p=>p.name).filter(Boolean).join(" / ")||"Messenger conversation"}</h2><p className="mt-1 text-xs text-slate-400">Updated: {c.updated_time?new Date(c.updated_time).toLocaleString():"Unknown"}</p><div className="mt-4 space-y-3">{(c.messages?.data||[]).map((m,i)=><div key={i} className="rounded-lg bg-slate-50 p-3"><p className="text-xs font-semibold">{m.from?.name||"Participant"}</p><p className="mt-1 whitespace-pre-wrap text-sm">{m.message||"Attachment or non-text message"}</p><p className="mt-1 text-xs text-slate-400">{m.created_time?new Date(m.created_time).toLocaleString():""}</p></div>)}</div>{selected&&c.participants?.data?.find(p=>p.id!==selected.externalAccountId)?.id&&<MessengerReply accountId={selected.id} conversationId={c.id} recipientId={c.participants.data.find(p=>p.id!==selected.externalAccountId)!.id!}/>}</div>)}</div>:<div className="rounded-xl border border-slate-200 bg-white p-7"><h2 className="font-bold">No Messenger conversations returned</h2><p className="mt-2 text-sm text-slate-600">Messenger may require additional Page messaging permissions, Messenger product setup and app review. Real-time webhook synchronization is not enabled.</p></div>}
 </AppShell>;
}
