"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Send, ShieldCheck, AlertTriangle } from "lucide-react";
type Page = { id: string; name: string };
export default function PublishComposer({ pages, selected }: { pages: Page[]; selected?: string }) {
 const [pageId,setPageId]=useState(selected && pages.some(p=>p.id===selected)?selected:(pages[0]?.id||""));
 const [message,setMessage]=useState("");
 const [sending,setSending]=useState(false);
 const router=useRouter();
 async function publish(e: React.FormEvent) {
   e.preventDefault();
   if (!pageId || !message.trim() || sending) return;
   if (!window.confirm("Publish this post to Facebook now?")) return;
   setSending(true);
   try {
    const res=await fetch("/api/facebook/publish",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({pageId,message})});
    const data=await res.json();
    if (!res.ok) throw new Error(data.error||"Publishing failed");
    toast.success("Facebook post published");
    setMessage("");
    router.push("/facebook/posts?page="+encodeURIComponent(pageId));
    router.refresh();
   } catch(e) {toast.error(e instanceof Error?e.message:"Publishing failed");}
   finally {setSending(false);}
 }
 return <div className="mx-auto max-w-4xl">
  {pages.length===0 ? <div className="rounded-xl border border-slate-200 bg-white p-8 text-center"><h2 className="font-bold">Connect a Page first</h2><p className="mt-2 text-sm text-slate-500">You need a connected Facebook Page before publishing.</p><Link href="/connected-accounts/meta" className="mt-5 inline-block rounded-lg bg-blue-600 px-4 py-2 text-white">Connect Facebook</Link></div> :
  <form onSubmit={publish} className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-bold text-slate-900">Post details</h2>
   <label className="mt-5 block text-sm font-semibold">Publish to Page<select value={pageId} onChange={e=>setPageId(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 p-3 font-normal">{pages.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select></label>
   <label className="mt-5 block text-sm font-semibold">Post text<textarea rows={10} maxLength={10000} value={message} onChange={e=>setMessage(e.target.value)} placeholder="What would you like to share?" className="mt-2 w-full rounded-lg border border-slate-200 p-3 font-normal"/></label><p className="mt-1 text-right text-xs text-slate-400">{message.length}/10,000</p>
  </div>
  <div className="space-y-4"><div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-bold">Publishing</h2><div className="mt-4 flex gap-3 rounded-lg bg-blue-50 p-4 text-sm text-blue-800"><ShieldCheck className="shrink-0" size={19}/><span>Publish now to your connected Facebook Page. This sends a real post to Meta.</span></div><button disabled={!message.trim()||!pageId||sending} className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"><Send size={16}/>{sending?"Publishing…":"Publish Post"}</button></div><div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><AlertTriangle size={18} className="shrink-0"/><span>Text posts are enabled. Images, scheduling and video publishing require additional upload flows and Meta permissions.</span></div></div>
  </form>}
 </div>;
}
