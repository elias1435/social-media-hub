"use client";
import { FormEvent,useState } from "react";
import {CheckCircle2,ExternalLink,RefreshCw,Plus,CalendarDays} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import ThumbnailPicker from "@/components/facebook/ThumbnailPicker";
import { useRouter } from "next/navigation";

type Page={id:string;name:string};
type UploadResponse={ok?:boolean;error?:string;sessionToken?:string;start?:number;end?:number;chunkLimit?:number;videoId?:string;note?:string;thumbnailApplied?:boolean;thumbnailWarning?:string};
const MB=1024*1024;

export default function VideoUploader({pages,selected,scheduleDate}:{pages:Page[];selected?:string;scheduleDate?:string}){
 const [pageId,setPageId]=useState(selected&&pages.some(p=>p.id===selected)?selected:pages[0]?.id||"");
 const [description,setDescription]=useState("");
 const [mode,setMode]=useState<"now"|"schedule">(scheduleDate?"schedule":"now");
 const [scheduleAt,setScheduleAt]=useState(scheduleDate?scheduleDate+"T12:00":"");
 const [completed,setCompleted]=useState<{sessionToken:string;accountId:string;videoId?:string;scheduled:boolean;scheduledAt:string}|null>(null);
 const [coverAccepted,setCoverAccepted]=useState(false);
 const [coverBusy,setCoverBusy]=useState(false);
 const [thumbnail,setThumbnail]=useState<File|null>(null);
 const [file,setFile]=useState<File|null>(null);
 const [busy,setBusy]=useState(false);
 const [progress,setProgress]=useState(0);
 const [phase,setPhase]=useState("");
 const [error,setError]=useState("");
 const router=useRouter();

 async function postJson(payload:Record<string,unknown>):Promise<UploadResponse>{
   const res=await fetch("/api/facebook/video",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
   const data=await res.json().catch(()=>({error:"Invalid server response"})) as UploadResponse;
   if(!res.ok)throw new Error(data.error||"Video publishing failed");
   return data;
 }
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(!file||!pageId||busy||completed)return;
  if(mode==="schedule"){const when=new Date(scheduleAt).getTime();if(!Number.isFinite(when)||when<Date.now()+11*60000||when>Date.now()+29*86400000){setError("Choose a time between 11 minutes and 29 days from now.");return;}}
  if(!window.confirm(mode==="schedule"?"Upload and schedule this Facebook video?":"Upload and publish this Facebook video?"))return;
  setBusy(true);setError("");setProgress(0);
  try {
   setPhase("Preparing upload session…");
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
     let data:UploadResponse|undefined;
     for(let retry=0;retry<4;retry++){
      setPhase(retry?"Retrying transfer ("+retry+"/3)…":"Transferring video…");
      let response:Response;
      try{response=await fetch("/api/facebook/video",{method:"POST",body:form});}catch{if(retry===3)throw Error("Network transfer interrupted. Check your connection.");await new Promise(r=>setTimeout(r,1000*2**retry));continue;}
      const result=await response.json().catch(()=>({error:"Unexpected upload response"})) as UploadResponse;
      if(response.ok){data=result;break;}
      if(![429,500,502,503,504].includes(response.status)||retry===3)throw Error(result.error||"Chunk transfer failed (HTTP "+response.status+")");
      await new Promise(r=>setTimeout(r,1000*2**retry));
     }
     if(!data)throw Error("Transfer could not be confirmed.");
     if(typeof data.start!=="number"||typeof data.end!=="number")throw new Error("Meta did not return upload offsets.");
     if(data.start<=start){
       if(++attempts>=3)throw new Error("Meta is not advancing the upload. Please retry.");
     }else attempts=0;
     start=data.start;end=data.end;
     setProgress(Math.min(99,Math.floor((start/file.size)*100)));
   }
   setPhase("Finalizing video"+(thumbnail?" and thumbnail":"")+"…");
   const payload={action:"finish",accountId:pageId,sessionToken:init.sessionToken,description,mode,scheduleAt:mode==="schedule"?new Date(scheduleAt).toISOString():undefined};
   let finished:UploadResponse;
   if(thumbnail){const form=new FormData();for(const [key,value] of Object.entries(payload))if(value!==undefined)form.set(key,value);form.set("thumbnail",thumbnail);const res=await fetch("/api/facebook/video",{method:"POST",body:form});finished=await res.json();if(!res.ok)throw Error(finished.error||"Video publishing failed");}else finished=await postJson(payload);
   setProgress(100);
   toast.success(finished.note||"Video upload submitted to Meta");
   setCompleted({sessionToken:init.sessionToken,accountId:pageId,videoId:finished.videoId||init.videoId,scheduled:mode==="schedule",scheduledAt:scheduleAt});setCoverAccepted(false);
  }catch(e){
    const message=e instanceof Error?e.message:"Video upload failed";
    setError(message+(message.includes("finish")?" Check Facebook before trying again to avoid duplicate publication.":""));toast.error("Video upload did not complete");
  }finally{setBusy(false);}
 }
 async function applyCover(){
  if(!completed||!thumbnail||coverBusy)return;
  setCoverBusy(true);setCoverAccepted(false);
  try{const form=new FormData();form.set("action","thumbnail");form.set("accountId",completed.accountId);form.set("sessionToken",completed.sessionToken);form.set("thumbnail",thumbnail);
   const res=await fetch("/api/facebook/video",{method:"POST",body:form});const result=await res.json();
   if(!res.ok||!result.thumbnailApplied)throw Error(result.error||"Meta did not confirm the cover request.");
   setCoverAccepted(true);toast.success("Meta accepted the thumbnail update. Check the displayed cover on Facebook.");
  }catch(e){toast.warning(e instanceof Error?e.message:"Cover update could not be confirmed.");}finally{setCoverBusy(false);}
 }
 function resetUpload(){
  setCompleted(null);setThumbnail(null);setCoverAccepted(false);setFile(null);setDescription("");setProgress(0);setPhase("");setError("");
  setMode(scheduleDate?"schedule":"now");setScheduleAt(scheduleDate?scheduleDate+"T12:00":"");
 }
 if(completed)return <section className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
  <div className="flex flex-col items-center text-center">
   <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 size={34}/></div>
   <h2 className="text-xl font-bold tracking-tight text-slate-900">{completed.scheduled?"Video scheduling accepted":"Video successfully submitted"}</h2>
   <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">Meta accepted your video for processing. {completed.scheduled?"Publication is scheduled, subject to Meta processing.":"Publication and cover rendering may take additional time."}</p>
   <p className="mt-3 rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold text-slate-700">{pages.find(p=>p.id===completed.accountId)?.name||"Facebook Page"}</p>
   {completed.scheduled&&<p className="mt-3 flex items-center gap-2 text-sm text-slate-600"><CalendarDays size={16}/>{new Date(completed.scheduledAt).toLocaleString()}</p>}
  </div>
  <div className="mt-6 border-t border-slate-100 pt-5"><ThumbnailPicker file={thumbnail} onChange={next=>{setThumbnail(next);setCoverAccepted(false);}} disabled={coverBusy}/></div>
  <p role="status" className="mt-3 text-xs leading-5 text-slate-500">{coverAccepted?"Meta accepted the thumbnail update. Verify the displayed cover on Facebook.":"If you want to change the cover, select an image and update the thumbnail. This does not publish another video."}</p>
  <div className="mt-6 space-y-3">
   {completed.videoId&&<a target="_blank" rel="noopener noreferrer" href={"https://www.facebook.com/"+encodeURIComponent(completed.videoId)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50"><ExternalLink size={17}/>View video on Facebook</a>}
   <button type="button" disabled={!thumbnail||coverBusy} onClick={()=>void applyCover()} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"><RefreshCw size={17} className={coverBusy?"animate-spin":""}/>{coverBusy?"Updating thumbnail…":"Update thumbnail"}</button>
   <button type="button" disabled={coverBusy} onClick={resetUpload} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"><Plus size={18}/>Upload another video</button>
   {completed.scheduled&&<button type="button" disabled={coverBusy} onClick={()=>router.push("/content-planner?page="+encodeURIComponent(completed.accountId))} className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50">Return to Content Planner</button>}
  </div>
 </section>;
 return pages.length?<form onSubmit={submit} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6">
  <label className="block text-sm font-semibold">Page<select disabled={busy||Boolean(completed)} className="mt-2 w-full rounded-lg border border-slate-200 p-3" value={pageId} onChange={e=>setPageId(e.target.value)}>{pages.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
  <label className="block text-sm font-semibold">Description<textarea disabled={busy||Boolean(completed)} rows={4} maxLength={5000} value={description} onChange={e=>setDescription(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 p-3 font-normal"/></label>
  <label className="block text-sm font-semibold">Video (MP4/MOV, chunked upload)<input disabled={busy||Boolean(completed)} required type="file" accept="video/mp4,video/quicktime" className="mt-2 block w-full rounded-lg border border-slate-200 p-3 text-sm font-normal" onChange={e=>{setFile(e.target.files?.[0]||null);setProgress(0);setError("");}}/></label>
  <ThumbnailPicker file={thumbnail} onChange={next=>{setThumbnail(next);setCoverAccepted(false);}} disabled={busy||coverBusy}/>

  <fieldset disabled={busy||Boolean(completed)} className="space-y-2 rounded-lg border border-slate-200 p-4"><legend className="px-2 text-sm font-semibold">Publishing options</legend><label className="flex items-center gap-2 text-sm"><input type="radio" checked={mode==="now"} onChange={()=>setMode("now")}/>Publish video now</label><label className="flex items-center gap-2 text-sm"><input type="radio" checked={mode==="schedule"} onChange={()=>setMode("schedule")}/>Schedule video</label>{mode==="schedule"&&<label className="block text-sm font-medium">Scheduled time (local)<input type="datetime-local" value={scheduleAt} onChange={e=>setScheduleAt(e.target.value)} required className="mt-2 block w-full rounded-lg border border-slate-200 p-3"/><span className="mt-2 block text-xs text-slate-500">11 minutes to 29 days ahead. Video processing may take additional time.</span></label>}</fieldset>
  {file&&<p className="text-sm text-slate-600">Selected file: {(file.size/MB).toFixed(1)} MB</p>}
  {busy&&<div role="status"><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-blue-600 transition-all" style={{width:progress+"%"}}/></div><p className="mt-2 text-xs font-medium text-slate-600">{phase} {progress}% — Keep this page open.</p></div>}
  {error&&<div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"><p className="font-semibold">Video could not be published</p><p className="mt-2">{error}</p><Link href={"/facebook/"+pageId+"/diagnostics"} className="mt-3 inline-block font-semibold underline">Check Page permissions</Link></div>}
  <p className="rounded-lg bg-blue-50 p-3 text-xs text-blue-900">Large videos are transferred in smaller parts to Meta. There is no 20 MB portal cap; Meta's file size, duration, format and processing limits still apply. Standard Page videos are supported. Reels use a separate Meta publishing flow.</p>
  <button disabled={Boolean(completed)||!file||busy||(mode==="schedule"&&!scheduleAt)} className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-40">{busy?"Uploading…":mode==="schedule"?"Schedule video":"Upload video"}</button>
 </form>:<div className="rounded-xl border border-slate-200 bg-white p-6"><p className="text-sm">Connect a Facebook Page first.</p><Link href="/connected-accounts/meta" className="mt-3 inline-block text-sm font-semibold text-blue-600">Connect Page</Link></div>;
}
