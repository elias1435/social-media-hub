"use client";
import { FormEvent,useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Page={id:string;name:string};
type UploadResponse={ok?:boolean;error?:string;sessionToken?:string;start?:number;end?:number;chunkLimit?:number;videoId?:string;note?:string};
const MB=1024*1024;

export default function VideoUploader({pages,selected}:{pages:Page[];selected?:string}){
 const [pageId,setPageId]=useState(selected&&pages.some(p=>p.id===selected)?selected:pages[0]?.id||"");
 const [description,setDescription]=useState("");
 const [mode,setMode]=useState<"now"|"schedule">("now");
 const [scheduleAt,setScheduleAt]=useState("");
 const [file,setFile]=useState<File|null>(null);
 const [busy,setBusy]=useState(false);
 const [progress,setProgress]=useState(0);
 const [error,setError]=useState("");
 const router=useRouter();

 async function postJson(payload:Record<string,unknown>):Promise<UploadResponse>{
   const res=await fetch("/api/facebook/video",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
   const data=await res.json().catch(()=>({error:"Invalid server response"})) as UploadResponse;
   if(!res.ok)throw new Error(data.error||"Video publishing failed");
   return data;
 }
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(!file||!pageId||busy)return;
  if(mode==="schedule"){const when=new Date(scheduleAt).getTime();if(!Number.isFinite(when)||when<Date.now()+11*60000||when>Date.now()+29*86400000){setError("Choose a time between 11 minutes and 29 days from now.");return;}}
  if(!window.confirm(mode==="schedule"?"Upload and schedule this Facebook video?":"Upload and publish this Facebook video?"))return;
  setBusy(true);setError("");setProgress(0);
  try {
   const init=await postJson({action:"start",accountId:pageId,fileSize:file.size});
   if(!init.sessionToken||init.start===undefined||init.end===undefined)throw new Error("Meta did not provide a usable upload session.");
   let start=init.start;
   let end=init.end;
   let attempts=0;
   while(start<file.size){
     const windowSize=Math.min(end-start,init.chunkLimit||16*MB,16*MB,file.size-start);
     if(windowSize<=0)throw new Error("Meta returned an invalid upload range.");
     const form=new FormData();
     form.set("action","transfer");form.set("accountId",pageId);form.set("sessionToken",init.sessionToken);
     form.set("startOffset",String(start));form.set("chunk",file.slice(start,start+windowSize),"video-part.bin");
     const response=await fetch("/api/facebook/video",{method:"POST",body:form});
     const data=await response.json().catch(()=>({error:"Unexpected upload response"})) as UploadResponse;
     if(!response.ok)throw new Error(data.error||"Chunk transfer failed");
     if(typeof data.start!=="number"||typeof data.end!=="number")throw new Error("Meta did not return upload offsets.");
     if(data.start<=start){
       if(++attempts>=3)throw new Error("Meta is not advancing the upload. Please retry.");
     }else attempts=0;
     start=data.start;end=data.end;
     setProgress(Math.min(99,Math.floor((start/file.size)*100)));
   }
   const finished=await postJson({action:"finish",accountId:pageId,sessionToken:init.sessionToken,description,mode,scheduleAt:mode==="schedule"?new Date(scheduleAt).toISOString():undefined});
   setProgress(100);
   toast.success(finished.note||"Video upload submitted to Meta");
   setDescription("");setFile(null);router.refresh();
  }catch(e){
    const message=e instanceof Error?e.message:"Video upload failed";
    setError(message);toast.error("Video upload did not complete");
  }finally{setBusy(false);}
 }
 return pages.length?<form onSubmit={submit} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6">
  <label className="block text-sm font-semibold">Page<select disabled={busy} className="mt-2 w-full rounded-lg border border-slate-200 p-3" value={pageId} onChange={e=>setPageId(e.target.value)}>{pages.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
  <label className="block text-sm font-semibold">Description<textarea disabled={busy} rows={4} maxLength={5000} value={description} onChange={e=>setDescription(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 p-3 font-normal"/></label>
  <label className="block text-sm font-semibold">Video (MP4/MOV, chunked upload)<input disabled={busy} required type="file" accept="video/mp4,video/quicktime" className="mt-2 block w-full rounded-lg border border-slate-200 p-3 text-sm font-normal" onChange={e=>{setFile(e.target.files?.[0]||null);setProgress(0);setError("");}}/></label>
  <fieldset disabled={busy} className="space-y-2 rounded-lg border border-slate-200 p-4"><legend className="px-2 text-sm font-semibold">Publishing options</legend><label className="flex items-center gap-2 text-sm"><input type="radio" checked={mode==="now"} onChange={()=>setMode("now")}/>Publish video now</label><label className="flex items-center gap-2 text-sm"><input type="radio" checked={mode==="schedule"} onChange={()=>setMode("schedule")}/>Schedule video</label>{mode==="schedule"&&<label className="block text-sm font-medium">Scheduled time (local)<input type="datetime-local" value={scheduleAt} onChange={e=>setScheduleAt(e.target.value)} required className="mt-2 block w-full rounded-lg border border-slate-200 p-3"/><span className="mt-2 block text-xs text-slate-500">11 minutes to 29 days ahead. Video processing may take additional time.</span></label>}</fieldset>
  {file&&<p className="text-sm text-slate-600">Selected file: {(file.size/MB).toFixed(1)} MB</p>}
  {busy&&<div role="status"><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-blue-600 transition-all" style={{width:progress+"%"}}/></div><p className="mt-2 text-xs font-medium text-slate-600">Uploading: {progress}% — Keep this page open.</p></div>}
  {error&&<div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"><p className="font-semibold">Video could not be published</p><p className="mt-2">{error}</p><Link href={"/facebook/"+pageId+"/diagnostics"} className="mt-3 inline-block font-semibold underline">Check Page permissions</Link></div>}
  <p className="rounded-lg bg-blue-50 p-3 text-xs text-blue-900">Large videos are transferred in smaller parts to Meta. There is no 20 MB portal cap; Meta's file size, duration, format and processing limits still apply. Standard Page videos are supported. Reels use a separate Meta publishing flow.</p>
  <button disabled={!file||busy||(mode==="schedule"&&!scheduleAt)} className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-40">{busy?"Uploading…":mode==="schedule"?"Schedule video":"Upload video"}</button>
 </form>:<div className="rounded-xl border border-slate-200 bg-white p-6"><p className="text-sm">Connect a Facebook Page first.</p><Link href="/connected-accounts/meta" className="mt-3 inline-block text-sm font-semibold text-blue-600">Connect Page</Link></div>;
}
