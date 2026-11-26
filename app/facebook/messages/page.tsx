import MessengerInbox from "@/components/facebook/MessengerInbox";
import MessengerPagePicker from "@/components/facebook/MessengerPagePicker";

import PageNavigation from "@/components/facebook/PageNavigation";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import { hasOrgPermission } from "@/lib/permissions";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { graphGet, decryptToken } from "@/lib/meta-connection";

export const dynamic="force-dynamic";
type Participant={name?:string;id?:string};
type Conversation={id:string;updated_time?:string;participants?:{data?:Participant[]};messages?:{data?:Array<{id?:string;message?:string;created_time?:string;from?:Participant}>}};
export default async function Messages({searchParams}:{searchParams:Promise<{page?:string}>}){
 const {page}=await searchParams;
 const session=await auth();
 const org=session?.user?.organizationId;
 const userId=session?.user?.id;
 const allowed=org&&userId?await hasOrgPermission(userId,org,"facebook.messages.view"):false;
 if(!allowed)return <AppShell><PageHeader title="Facebook Messenger" description="Access permissions"/><div className="rounded-xl border border-amber-200 bg-white p-6 text-sm">Your workspace role does not include View Facebook Messages. Ask an administrator to grant facebook.messages.view under Team / Roles.</div></AppShell>;
 const canReply=await hasOrgPermission(userId!,org!,"facebook.messages.reply");
 const pages=await prisma.socialAccount.findMany({where:{organizationId:org!,platform:"FACEBOOK",status:"CONNECTED"},select:{id:true,name:true,externalAccountId:true,accessTokenCiphertext:true},orderBy:{name:"asc"}});
 const selected=pages.find(p=>p.id===page)||pages[0];
 let conversations:Conversation[]=[];let error="";
 if(selected?.accessTokenCiphertext){
   try{
    const token=decryptToken(selected.accessTokenCiphertext);
    const result=await graphGet<{data?:Conversation[]}>("/"+selected.externalAccountId+"/conversations",token,{platform:"messenger",fields:"id,updated_time,participants,messages.limit(25){id,message,created_time,from}",limit:"30"});
    conversations=result.data||[];
   }catch(e){error=e instanceof Error?e.message:"Could not retrieve Messenger conversations";}
 }
 return <AppShell>
  <PageHeader title="Facebook Messenger" description="Conversations for the selected Facebook Page. Replies depend on workspace access and Meta messaging approval."/>
  {selected&&<PageNavigation accountId={selected.id} active="inbox"/>}
  <div className="mb-5 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
   {pages.length>0?<MessengerPagePicker pages={pages.map(p=>({id:p.id,name:p.name}))} selectedId={selected!.id}/>:<p className="text-sm text-slate-500">No Facebook Pages connected.</p>}

   {selected&&<span className="pb-2 text-xs text-slate-500">{conversations.length} recent conversations</span>}
  </div>
  {!canReply&&<div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">Read-only access: your role can view conversations but cannot reply. Ask an administrator to grant facebook.messages.reply.</div>}
  {error&&<div role="alert" className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 break-words">{error}. Confirm pages_messaging, Page tasks and Meta app access.</div>}
  {!selected?<div className="rounded-xl border border-slate-200 bg-white p-6 text-sm">Connect a Facebook Page first.</div>:conversations.length===0?<div className="rounded-xl border border-slate-200 bg-white p-7"><h2 className="font-bold">No conversations returned</h2><p className="mt-2 text-sm text-slate-600">Try another connected Page or refresh. App Review and messaging windows may restrict access to some conversations.</p></div>:<MessengerInbox conversations={conversations} pageId={selected.id} externalPageId={selected.externalAccountId} canReply={canReply}/>}
 </AppShell>;
}
