"use client";
import { useMemo,useState } from "react";
import { Search, MessageCircle, UserRound } from "lucide-react";
import MessengerReply from "@/components/facebook/MessengerReply";
import InboxRefresh from "@/components/facebook/InboxRefresh";

export type Participant={name?:string;id?:string};
export type Conversation={id:string;updated_time?:string;participants?:{data?:Participant[]};messages?:{data?:Array<{id?:string;message?:string;created_time?:string;from?:Participant}>}};
type Thread={raw:Conversation;participant:Participant|null;latest:string;lastAt:number};
function prettyDate(value?:string){if(!value)return "";const date=new Date(value);return Number.isNaN(date.getTime())?"":date.toLocaleString();}
export default function MessengerInbox({conversations,pageId,externalPageId,canReply}:{conversations:Conversation[];pageId:string;externalPageId:string;canReply:boolean}){
 const [search,setSearch]=useState("");
 const [filter,setFilter]=useState<"all"|"recent">("all");
 const threads=useMemo<Thread[]>(()=>conversations.map(raw=>{
  const participant=raw.participants?.data?.find(p=>p.id&&p.id!==externalPageId)||null;
  const sorted=[...(raw.messages?.data||[])].sort((a,b)=>(new Date(a.created_time||0).getTime()||0)-(new Date(b.created_time||0).getTime()||0));
  return {raw,participant,latest:sorted[sorted.length-1]?.message||"Attachment or other message",lastAt:raw.updated_time?new Date(raw.updated_time).getTime():0};
 }).sort((a,b)=>b.lastAt-a.lastAt),[conversations,externalPageId]);
 const [selectedId,setSelectedId]=useState(threads[0]?.raw.id||"");
 const filtered=threads.filter(t=>(t.participant?.name||"Messenger conversation").toLowerCase().includes(search.toLowerCase())||t.latest.toLowerCase().includes(search.toLowerCase())).filter(t=>filter==="all"||t.lastAt>Date.now()-7*86400000);
 const active=threads.find(t=>t.raw.id===selectedId)||threads[0];
 const messages=[...(active?.raw.messages?.data||[])].sort((a,b)=>(new Date(a.created_time||0).getTime()||0)-(new Date(b.created_time||0).getTime()||0));
 return <section aria-label="Messenger inbox" className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
  <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-3"><MessageCircle size={19} className="text-blue-600"/><h2 className="font-semibold">Inbox</h2><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Messenger</span><span className="ml-auto text-xs text-slate-500">{threads.length} recent conversations from Meta</span><InboxRefresh/></div>
  <div className="grid min-h-[580px] min-w-0 lg:grid-cols-[290px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)_220px]">
   <div className="min-w-0 border-b border-slate-200 lg:border-b-0 lg:border-r">
    <div className="space-y-3 border-b border-slate-100 p-4"><label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"><Search size={17} className="text-slate-400"/><input aria-label="Search conversations" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search conversations" className="min-w-0 w-full bg-transparent text-sm outline-none"/></label><div className="flex gap-2">{(["all","recent"] as const).map(f=><button key={f} type="button" onClick={()=>setFilter(f)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${filter===f?"bg-blue-100 text-blue-700":"bg-slate-100 text-slate-600"}`}>{f==="all"?"All messages":"Last 7 days"}</button>)}</div></div>
    <div className="max-h-[560px] overflow-y-auto">{filtered.map(t=><button key={t.raw.id} type="button" onClick={()=>setSelectedId(t.raw.id)} aria-current={active?.raw.id===t.raw.id?"true":undefined} className={`flex w-full items-start gap-3 border-b border-slate-100 p-4 text-left hover:bg-blue-50 ${active?.raw.id===t.raw.id?"border-l-4 border-l-blue-600 bg-blue-50":"border-l-4 border-l-transparent"}`}><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-700">{(t.participant?.name||"M").charAt(0).toUpperCase()}</div><div className="min-w-0 flex-1"><div className="flex items-baseline justify-between gap-2"><p className="truncate text-sm font-semibold text-slate-900">{t.participant?.name||"Messenger conversation"}</p><span className="shrink-0 text-[10px] text-slate-400">{t.raw.updated_time?new Date(t.raw.updated_time).toLocaleDateString():""}</span></div><p className="mt-1 line-clamp-2 break-words text-xs text-slate-500" style={{overflowWrap:"anywhere"}}>{t.latest}</p></div></button>)}{filtered.length===0&&<p className="p-5 text-sm text-slate-500">No conversations match this filter.</p>}</div>
   </div>
   <div className="flex min-w-0 flex-col">
    {!active?<div className="flex flex-1 items-center justify-center p-10 text-sm text-slate-500">Select a Messenger conversation.</div>:<>
     <div className="flex items-center gap-3 border-b border-slate-200 p-4"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">{(active.participant?.name||"M").charAt(0).toUpperCase()}</div><div className="min-w-0"><h3 className="truncate font-semibold">{active.participant?.name||"Messenger conversation"}</h3><p className="text-xs text-slate-500">Facebook Messenger · {prettyDate(active.raw.updated_time)}</p></div></div>
     <div className="max-h-[430px] min-h-[300px] flex-1 space-y-3 overflow-y-auto bg-slate-50/70 p-4 sm:p-6">{messages.map((message,index)=>{const outgoing=message.from?.id===externalPageId;return <div key={message.id||index} className={`flex ${outgoing?"justify-end":"justify-start"}`}><div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm sm:max-w-[75%] ${outgoing?"bg-blue-600 text-white":"border border-slate-200 bg-white text-slate-800"}`}><p className="whitespace-pre-wrap break-words leading-6" style={{overflowWrap:"anywhere"}}>{message.message||"Attachment or non-text message"}</p><p className={`mt-2 text-[10px] ${outgoing?"text-blue-100":"text-slate-400"}`}>{prettyDate(message.created_time)}</p></div></div>})}{!messages.length&&<p className="text-center text-sm text-slate-500">No messages returned for this thread.</p>}</div>
     <div className="border-t border-slate-200 bg-white px-4 pb-4">{active.participant?.id&&canReply?<MessengerReply key={active.raw.id} accountId={pageId} conversationId={active.raw.id} recipientId={active.participant.id}/>:<p className="p-4 text-sm text-slate-500">{!canReply?"Your role can view conversations, but cannot reply.":"A reply recipient was not returned by Meta."}</p>}</div>
    </>}
   </div>
   <aside className="hidden border-l border-slate-200 xl:block"><div className="border-b border-slate-200 p-5"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-600"><UserRound size={30}/></div><h3 className="mt-3 break-words text-center font-semibold">{active?.participant?.name||"Messenger contact"}</h3><p className="mt-1 text-center text-xs text-slate-500">Conversation information</p></div><div className="space-y-4 p-5 text-xs"><p className="font-semibold text-slate-800">Facebook Messenger</p><p className="text-slate-500">Last updated</p><p className="font-medium text-slate-800">{prettyDate(active?.raw.updated_time)||"Unavailable"}</p><p className="text-slate-500">Only profile information returned by the authorized Meta API is displayed. Customer profiles and order data are not stored here.</p></div></aside>
  </div>
 </section>
}
