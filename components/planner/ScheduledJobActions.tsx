"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
export default function ScheduledJobActions({id}:{id:string}){
 const [date,setDate]=useState(""),[busy,setBusy]=useState(false),router=useRouter();
 async function action(type:"CANCEL"|"RESCHEDULE"){
  if(busy)return;
  if(type==="CANCEL"&&!window.confirm("Cancel this scheduled Instagram photo?"))return;
  if(type==="RESCHEDULE"&&!date){toast.error("Choose a new date and time.");return;}
  setBusy(true);try{const r=await fetch("/api/automation/jobs/"+encodeURIComponent(id),{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:type,scheduleAt:type==="RESCHEDULE"?new Date(date).toISOString():undefined})});
  const d=await r.json();if(!r.ok)throw new Error(d.error||"Update failed");toast.success(type==="CANCEL"?"Job cancelled":"Job rescheduled");router.refresh();}catch(e){toast.error(e instanceof Error?e.message:"Update failed");}finally{setBusy(false)}
 }
 return <div className="mt-2 flex flex-wrap gap-2"><label className="text-xs">New time <input type="datetime-local" value={date} onChange={e=>setDate(e.target.value)} className="mt-1 block rounded border p-2"/></label><button disabled={busy||!date} type="button" onClick={()=>void action("RESCHEDULE")} className="self-end rounded border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 disabled:opacity-50">Reschedule</button><button disabled={busy} type="button" onClick={()=>void action("CANCEL")} className="self-end rounded border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-50">Cancel</button></div>;
}
