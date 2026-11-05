"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
export default function CommentModerate({accountId,commentId,hidden}:{accountId:string;commentId:string;hidden:boolean}){
 const [busy,setBusy]=useState(false);const router=useRouter();
 async function toggle(){
  if(busy||!window.confirm((hidden?"Unhide":"Hide")+" this Facebook comment?"))return;
  setBusy(true);
  try{const res=await fetch("/api/facebook/comments/moderate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({accountId,commentId,hide:!hidden})});const value=await res.json();if(!res.ok)throw new Error(value.error||"Moderation failed");toast.success(hidden?"Comment unhidden":"Comment hidden");router.refresh();}
  catch(e){toast.error(e instanceof Error?e.message:"Request failed");}finally{setBusy(false);}
 }
 return <button disabled={busy} type="button" onClick={toggle} className="mt-2 text-xs font-semibold text-amber-700 disabled:opacity-40">{busy?"Updating…":hidden?"Unhide comment":"Hide comment"}</button>;
}
