"use client";
import { useState } from "react";
import { toast } from "sonner";
export default function CommentReply({ accountId, commentId }: { accountId: string; commentId: string }) {
 const [open,setOpen]=useState(false), [message,setMessage]=useState(""), [sending,setSending]=useState(false);
 async function send(e: React.FormEvent) {
  e.preventDefault(); if (!message.trim() || sending) return;
  setSending(true);
  try {
   const response=await fetch("/api/facebook/comments/reply",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({accountId,commentId,message})});
   const data=await response.json(); if(!response.ok) throw new Error(data.error||"Reply failed");
   toast.success("Reply published"); setMessage("");setOpen(false);
  } catch(e) { toast.error(e instanceof Error?e.message:"Reply failed"); } finally{setSending(false);}
 }
 return <div className="mt-3">{!open?<button type="button" onClick={()=>setOpen(true)} className="text-xs font-semibold text-blue-600">Reply to comment</button>:<form onSubmit={send} className="flex flex-col gap-2 sm:flex-row"><input value={message} maxLength={8000} onChange={e=>setMessage(e.target.value)} placeholder="Write a public reply…" className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"/><button disabled={!message.trim()||sending} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{sending?"Sending…":"Send reply"}</button><button type="button" onClick={()=>setOpen(false)} className="px-3 py-2 text-xs text-slate-500">Cancel</button></form>}</div>;
}
