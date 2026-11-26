"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
export default function DeleteScheduled({accountId,postId}:{accountId:string;postId:string}){
 const [busy,setBusy]=useState(false),router=useRouter();
 async function remove(){
  if(busy||!window.confirm("Delete this scheduled Facebook item from Meta? It will not be published."))return;
  setBusy(true);
  try{
   const res=await fetch("/api/facebook/scheduled",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({accountId,postId})});
   const data=await res.json();if(!res.ok||!data.ok)throw Error(data.error||"Deletion was not confirmed.");
   toast.success("Scheduled item deleted");router.refresh();
  }catch(e){toast.error(e instanceof Error?e.message:"Deletion failed");}finally{setBusy(false);}
 }
 return <button type="button" disabled={busy} onClick={()=>void remove()} className="mt-3 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-50">{busy?"Deleting…":"Delete scheduled item"}</button>;
}
