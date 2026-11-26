"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
export default function CampaignActions({accountId,campaignId,currency}:{accountId:string;campaignId:string;currency:string}){
 const [mode,setMode]=useState<"PAUSE"|"ACTIVATE"|"DAILY_BUDGET"|null>(null);
 const [confirmation,setConfirmation]=useState("");
 const [budget,setBudget]=useState("");
 const [busy,setBusy]=useState(false);
 const router=useRouter();
 async function execute(){
  if(!mode||confirmation!=="CONFIRM LIVE AD CHANGE"||busy)return;
  setBusy(true);
  try{
   const id=crypto.randomUUID();
   const response=await fetch("/api/ads/actions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({requestId:id,accountId,campaignId,action:mode,confirmation,dailyBudgetMinor:mode==="DAILY_BUDGET"?Number(budget):undefined})});
   const data=await response.json();
   if(!response.ok)throw new Error(data.error||"Meta did not confirm the change");
   toast.success(data.message||"Meta confirmed the change");setMode(null);setBudget("");setConfirmation("");router.refresh();
  }catch(e){toast.error(e instanceof Error?e.message:"Live Ads change failed");}finally{setBusy(false);}
 }
 return <div className="min-w-[190px] space-y-2">
  <select aria-label="Live campaign action" value={mode||""} onChange={e=>{setMode(e.target.value as typeof mode);setConfirmation("")}} className="w-full rounded-lg border border-slate-200 p-2 text-xs"><option value="">Choose live action…</option><option value="PAUSE">Pause campaign</option><option value="ACTIVATE">Activate campaign</option><option value="DAILY_BUDGET">Change daily budget</option></select>
  {mode&&<div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
   <p className="text-xs font-semibold text-amber-900">This action changes a real Meta campaign and can affect advertising spend.</p>
   {mode==="DAILY_BUDGET"&&<label className="mt-2 block text-xs">Daily budget in minor currency units ({currency}).<input type="number" min={100} max={10000000} step={1} value={budget} onChange={e=>setBudget(e.target.value)} className="mt-1 w-full rounded border p-2"/></label>}
   <label className="mt-2 block text-xs">Type CONFIRM LIVE AD CHANGE<input value={confirmation} onChange={e=>setConfirmation(e.target.value)} className="mt-1 w-full rounded border p-2"/></label>
   <button type="button" disabled={busy||confirmation!=="CONFIRM LIVE AD CHANGE"||(mode==="DAILY_BUDGET"&&!budget)} onClick={execute} className="mt-3 w-full rounded bg-amber-700 p-2 text-xs font-semibold text-white disabled:opacity-40">{busy?"Sending to Meta…":"Confirm live action"}</button>
  </div>}
 </div>;
}
