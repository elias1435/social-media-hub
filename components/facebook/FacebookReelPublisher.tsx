"use client";
import {FormEvent,useState} from "react";
import {toast} from "sonner";
type Page={id:string;name:string};
export default function FacebookReelPublisher({pages,selected}:{pages:Page[];selected?:string}){
 const [accountId,setAccountId]=useState(selected&&pages.some(p=>p.id===selected)?selected:pages[0]?.id||"");
 const [videoUrl,setVideoUrl]=useState(""),[description,setDescription]=useState("");
 const [mode,setMode]=useState<"now"|"schedule">("now"),[scheduleAt,setScheduleAt]=useState(""),[busy,setBusy]=useState(false);
 async function submit(e:FormEvent){e.preventDefault();if(!accountId||!videoUrl||busy)return;
  if(!window.confirm(mode==="schedule"?"Schedule this Facebook Reel with Meta?":"Publish this Facebook Reel now?"))return;
  setBusy(true);try{
   const response=await fetch("/api/facebook/reels",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({accountId,videoUrl,description,mode,scheduleAt:mode==="schedule"?new Date(scheduleAt).toISOString():undefined})});
   const data=await response.json();if(!response.ok)throw new Error(data.error||"Reel publishing failed");toast.success(data.note||"Reel submitted to Meta");setVideoUrl("");setDescription("");
  }catch(e){toast.error(e instanceof Error?e.message:"Meta did not confirm the Reel");}finally{setBusy(false);}
 }
 return <form onSubmit={submit} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6">
 <h2 className="font-semibold">Facebook Reel (hosted video)</h2>
 <p className="text-xs text-slate-500">Use a public HTTPS MP4/MOV video URL. Meta downloads the file directly from your CDN. Standard local-file uploads remain available under Video.</p>
 <label className="block text-sm font-semibold">Facebook Page<select value={accountId} onChange={e=>setAccountId(e.target.value)} className="mt-2 w-full rounded-lg border p-3 font-normal">{pages.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
 <label className="block text-sm font-semibold">Public video URL<input required type="url" placeholder="https://cdn.example.com/my-reel.mp4" value={videoUrl} onChange={e=>setVideoUrl(e.target.value)} className="mt-2 w-full rounded-lg border p-3 font-normal"/></label>
 <label className="block text-sm font-semibold">Description<textarea value={description} maxLength={5000} rows={4} onChange={e=>setDescription(e.target.value)} className="mt-2 w-full rounded-lg border p-3 font-normal"/></label>
 <fieldset className="space-y-3 rounded-lg border border-slate-200 p-4"><legend className="px-2 text-sm font-semibold">Publishing options</legend><label className="flex items-center gap-2 text-sm"><input type="radio" checked={mode==="now"} onChange={()=>setMode("now")}/>Publish now</label><label className="flex items-center gap-2 text-sm"><input type="radio" checked={mode==="schedule"} onChange={()=>setMode("schedule")}/>Schedule Reel</label>{mode==="schedule"&&<label className="block text-sm">Schedule (local)<input required type="datetime-local" value={scheduleAt} onChange={e=>setScheduleAt(e.target.value)} className="mt-2 w-full rounded-lg border p-3"/></label>}</fieldset>
 <button disabled={busy||!videoUrl||!accountId||(mode==="schedule"&&!scheduleAt)} className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy?"Submitting…":mode==="schedule"?"Schedule Reel":"Publish Reel"}</button>
 </form>;
}
