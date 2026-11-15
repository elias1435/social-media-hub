"use client";
import { useState,FormEvent } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

type ReplyError={error?:string;code?:string;metaCode?:number};
export default function MessengerReply({accountId,conversationId,recipientId}:{accountId:string;conversationId:string;recipientId:string}){
 const [message,setMessage]=useState("");const [busy,setBusy]=useState(false);
 const [failure,setFailure]=useState<ReplyError|null>(null);
 const router=useRouter();
 async function send(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(busy||!message.trim())return;
  if(!window.confirm("Send this Messenger reply?"))return;
  setFailure(null);setBusy(true);
  try{
   const response=await fetch("/api/facebook/messages/reply",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({accountId,conversationId,recipientId,message})});
   const data=await response.json() as ReplyError;
   if(!response.ok){setFailure(data);toast.error("Messenger did not send the reply");return;}
   toast.success("Messenger reply sent");setMessage("");router.refresh();
  }catch(e){setFailure({error:e instanceof Error?e.message:"Network error. Reply was not confirmed."});toast.error("Could not verify Messenger reply");}
  finally{setBusy(false);}
 }
 return <form onSubmit={send} className="mt-5 min-w-0 space-y-3 border-t border-slate-100 pt-4">
  <label className="block min-w-0 text-xs font-semibold text-slate-600">Reply to conversation
   <textarea rows={3} maxLength={2000} value={message} onChange={e=>setMessage(e.target.value)} placeholder="Write a Messenger reply…" className="mt-2 block w-full min-w-0 resize-y rounded-lg border border-slate-200 p-3 text-sm font-normal text-slate-800"/>
  </label>
  {failure&&<div role="alert" className="min-w-0 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
   <p className="font-semibold">Reply was not sent</p>
   <p className="mt-1 break-words">{failure.error||"Meta rejected the message."}</p>
   {failure.code==="META_APP_REVIEW_REQUIRED"&&<div className="mt-3 space-y-1 text-xs leading-5"><p>Being granted pages_messaging on your token is not the same as Advanced Access approval for public recipients. In Meta Developer Dashboard, check Use Cases → Manage Pages → pages_messaging → Access level/App Review, and confirm the app is Live. Once approved, reauthorize the Page if Meta requires it.</p>
    <Link className="inline-block font-semibold underline" href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer">Open Meta app settings</Link>
   </div>}
  </div>}
  <button type="submit" disabled={!message.trim()||busy} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy?"Sending…":"Send reply"}</button>
  <p className="text-xs leading-5 text-slate-500">Meta limits messaging to approved recipients and permitted reply windows. The confirmation dialog appears before submitting.</p>
 </form>;
}
