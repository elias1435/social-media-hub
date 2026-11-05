"use client";
import { useState,FormEvent } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
export default function MessengerReply({accountId,conversationId,recipientId}:{accountId:string;conversationId:string;recipientId:string}){
 const [message,setMessage]=useState("");const [busy,setBusy]=useState(false);const router=useRouter();
 async function send(e:FormEvent){
  e.preventDefault();if(busy||!message.trim())return;
  if(!window.confirm("Send this Messenger reply?"))return;
  setBusy(true);
  try{
   const response=await fetch("/api/facebook/messages/reply",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({accountId,conversationId,recipientId,message})});
   const data=await response.json();if(!response.ok)throw new Error(data.error||"Reply failed");
   toast.success("Messenger reply sent");setMessage("");router.refresh();
  }catch(e){toast.error(e instanceof Error?e.message:"Reply failed");}finally{setBusy(false);}
 }
 return <form onSubmit={send} className="mt-5 flex flex-col gap-2"><label className="text-xs font-semibold text-slate-600">Reply to conversation<textarea rows={2} maxLength={2000} value={message} onChange={e=>setMessage(e.target.value)} placeholder="Write a Messenger reply…" className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-sm font-normal"/></label><button type="submit" disabled={!message.trim()||busy} className="self-start rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy?"Sending…":"Send reply"}</button><p className="text-xs text-slate-400">Meta enforces messaging windows and permissions. The API may reject replies outside an allowed window.</p></form>;
}
