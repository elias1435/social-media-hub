"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Unplug } from "lucide-react";
export default function PageConnectionActions({accountId,name}:{accountId:string;name:string}) {
 const [busy,setBusy]=useState(false);
 const router=useRouter();
 async function disconnect() {
  if(!window.confirm("Disconnect "+name+"? This removes its saved access token and stops publishing until you reconnect."))return;
  setBusy(true);
  try {
   const res=await fetch("/api/meta/disconnect",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:accountId})});
   const data=await res.json();
   if(!res.ok)throw new Error(data.error||"Could not disconnect");
   toast.success("Facebook Page disconnected");
   router.push("/facebook");router.refresh();
  }catch(e){toast.error(e instanceof Error?e.message:"Could not disconnect");}finally{setBusy(false);}
 }
 return <button type="button" disabled={busy} onClick={disconnect} className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"><Unplug size={16}/>{busy?"Disconnecting…":"Disconnect Page"}</button>;
}
