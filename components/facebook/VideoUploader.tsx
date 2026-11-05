"use client";
import { useState,FormEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
type Page={id:string;name:string};
export default function VideoUploader({pages,selected}:{pages:Page[];selected?:string}){
 const [pageId,setPageId]=useState(selected&&pages.some(p=>p.id===selected)?selected:pages[0]?.id||"");
 const [description,setDescription]=useState("");
 const [file,setFile]=useState<File|null>(null);
 const [busy,setBusy]=useState(false);
 const router=useRouter();
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(!file||!pageId||busy)return;
  if(!window.confirm("Upload this video to Facebook now?"))return;
  setBusy(true);
  try{
   const data=new FormData();data.set("pageId",pageId);data.set("description",description);data.set("video",file);
   const response=await fetch("/api/facebook/video",{method:"POST",body:data});
   const result=await response.json();
   if(!response.ok)throw new Error(result.error||"Upload failed");
   toast.success(result.note||"Video upload accepted by Meta");setFile(null);setDescription("");router.refresh();
  }catch(e){toast.error(e instanceof Error?e.message:"Upload failed");}finally{setBusy(false);}
 }
 return pages.length?<form onSubmit={submit} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6">
 <label className="block text-sm font-semibold">Page<select className="mt-2 w-full rounded-lg border border-slate-200 p-3" value={pageId} onChange={e=>setPageId(e.target.value)}>{pages.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
 <label className="block text-sm font-semibold">Description<textarea rows={4} maxLength={5000} value={description} onChange={e=>setDescription(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 p-3 font-normal"/></label>
 <label className="block text-sm font-semibold">Video (MP4/MOV, maximum 20 MB)<input required type="file" accept="video/mp4,video/quicktime" className="mt-2 block w-full rounded-lg border border-slate-200 p-3 text-sm font-normal" onChange={e=>{const selected=e.target.files?.[0]||null;if(selected&&selected.size>20*1024*1024){toast.error("Maximum 20 MB");e.target.value="";setFile(null);}else setFile(selected);}}/></label>
 <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">Small standard Facebook videos only. Reels, large-video resumable uploads, thumbnails and scheduling require separate Meta workflows. Meta may process videos after accepting them. Hostinger must support the upload request size.</p>
 <button disabled={!file||busy} className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-40">{busy?"Uploading…":"Upload video"}</button>
 </form>:<div className="rounded-xl border border-slate-200 bg-white p-6"><p className="text-sm">Connect a Facebook Page first.</p><Link href="/connected-accounts/meta" className="mt-3 inline-block text-sm font-semibold text-blue-600">Connect Page</Link></div>;
}
