"use client";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarDays, ImagePlus, Save, Send, ShieldCheck, Trash2 } from "lucide-react";

type Page = { id: string; name: string };
type LocalDraft = { pageId: string; message: string; savedAt: string };
const DRAFT_KEY = "social-hub-facebook-draft-v1";
export default function PublishComposer({ pages, selected }: { pages: Page[]; selected?: string }) {
 const [pageId,setPageId]=useState(selected && pages.some(p=>p.id===selected)?selected:(pages[0]?.id||""));
 const [message,setMessage]=useState("");
 const [mode,setMode]=useState<"now"|"schedule">("now");
 const [scheduleAt,setScheduleAt]=useState("");
 const [image,setImage]=useState<File|null>(null);
 const [sending,setSending]=useState(false);
 const [draft,setDraft]=useState<LocalDraft|null>(null);
 const router=useRouter();
 useEffect(()=>{
   try { const raw=window.localStorage.getItem(DRAFT_KEY); if(raw){const value=JSON.parse(raw) as LocalDraft;if(value && typeof value.message==="string") setDraft(value);} } catch {}
 },[]);
 function saveDraft(){
  const value={pageId,message,savedAt:new Date().toISOString()};
  window.localStorage.setItem(DRAFT_KEY,JSON.stringify(value));setDraft(value);toast.success("Draft saved on this browser");
 }
 function loadDraft(){
  if(!draft)return;
  setMessage(draft.message);if(pages.some(p=>p.id===draft.pageId))setPageId(draft.pageId);
  toast.success("Draft loaded");
 }
 function discardDraft(){window.localStorage.removeItem(DRAFT_KEY);setDraft(null);toast.success("Draft removed");}
 function chooseImage(event:ChangeEvent<HTMLInputElement>){
  const file=event.target.files?.[0]||null;
  if(file && (!["image/jpeg","image/png"].includes(file.type)||file.size>8*1024*1024)){
    toast.error("Choose a JPG or PNG smaller than 8 MB");event.target.value="";setImage(null);return;
  }
  setImage(file);
 }
 async function publish(e:FormEvent<HTMLFormElement>){
  e.preventDefault();
  if(!pageId||(!message.trim()&&!image)||sending)return;
  if(!window.confirm(mode==="schedule"?"Schedule this text post on Facebook?":"Publish this post on Facebook now?"))return;
  setSending(true);
  try{
   const form=new FormData();
   form.set("pageId",pageId);form.set("message",message);form.set("mode",mode);
   if(mode==="schedule"){
    const parsed=new Date(scheduleAt);
    if(!Number.isFinite(parsed.getTime()))throw new Error("Choose a valid scheduling date");
    form.set("scheduleAt",parsed.toISOString());
   }
   if(image)form.set("image",image);
   const res=await fetch("/api/facebook/publish",{method:"POST",body:form});
   const data=await res.json();
   if(!res.ok)throw new Error(data.error||"Meta rejected the post");
   toast.success(data.scheduled?"Post scheduled on Facebook":"Post published on Facebook");
   setMessage("");setImage(null);
   router.push("/facebook/posts?page="+encodeURIComponent(pageId));router.refresh();
  }catch(error){toast.error(error instanceof Error?error.message:"Publishing failed");}
  finally{setSending(false);}
 }
 const disabled=!pageId||(!message.trim()&&!image)||(mode==="schedule"&&(!scheduleAt||Boolean(image)))||sending;
 return <div className="mx-auto max-w-5xl">
  {!pages.length?<div className="rounded-xl border border-slate-200 bg-white p-8 text-center"><h2 className="font-bold">Connect a Facebook Page first</h2><Link href="/connected-accounts/meta" className="mt-5 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Connect Page</Link></div>:
  <form onSubmit={publish} className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
   <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <h2 className="text-lg font-bold">Create Facebook Post</h2>
    <label className="mt-5 block text-sm font-semibold">Facebook Page<select value={pageId} onChange={e=>setPageId(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 p-3 font-normal">{pages.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select></label>
    <label className="mt-5 block text-sm font-semibold">Caption / message<textarea value={message} onChange={e=>setMessage(e.target.value)} rows={8} maxLength={10000} placeholder="Write something to share…" className="mt-2 w-full rounded-lg border border-slate-200 p-3 font-normal"/></label><div className="mt-1 text-right text-xs text-slate-400">{message.length}/10,000 characters</div>
    <label className="mt-5 flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-200 p-7 text-center hover:border-blue-300"><ImagePlus className="text-blue-600"/><span className="text-sm font-semibold">{image?image.name:"Attach an image (optional)"}</span><span className="text-xs text-slate-500">JPG, PNG · max 8 MB · publish now</span><input type="file" accept="image/jpeg,image/png" onChange={chooseImage} className="max-w-full text-xs"/></label>{image&&<button type="button" onClick={()=>setImage(null)} className="mt-3 text-sm font-semibold text-red-600">Remove image</button>}
   </div>
   <div className="space-y-4"><div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-bold">Publishing options</h2>
    <label className="mt-4 flex items-center gap-3 rounded-lg border border-slate-200 p-4 text-sm"><input type="radio" name="mode" checked={mode==="now"} onChange={()=>setMode("now")}/>Publish now</label>
    <label className="mt-2 flex items-center gap-3 rounded-lg border border-slate-200 p-4 text-sm"><input type="radio" name="mode" checked={mode==="schedule"} onChange={()=>setMode("schedule")}/>Schedule text post</label>
    {mode==="schedule"&&<label className="mt-4 block text-sm font-semibold"><span className="flex items-center gap-2"><CalendarDays size={16}/>Scheduled time (your local timezone)</span><input type="datetime-local" value={scheduleAt} onChange={e=>setScheduleAt(e.target.value)} required className="mt-2 w-full rounded-lg border border-slate-200 p-3 font-normal"/><span className="mt-2 block text-xs font-normal text-slate-500">Meta scheduling supports approximately 10 minutes to 30 days ahead. Image scheduling is not enabled.</span></label>}
    {image&&mode==="schedule"&&<div className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">Switch to Publish now to upload this image.</div>}
    <div className="mt-4 flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-xs text-blue-800"><ShieldCheck size={18} className="shrink-0"/>Posting requires Meta Page publishing permissions. The API will return the actual result.</div>
    <button disabled={disabled} className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"><Send size={16}/>{sending?"Sending to Meta…":mode==="schedule"?"Schedule post":"Publish post"}</button>
   </div>
   <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h3 className="font-bold">Drafts on this device</h3><p className="mt-2 text-xs leading-5 text-slate-500">Draft text is saved only in this browser. It is not synced to your team or uploaded to the server. Image files are not saved in drafts.</p><button type="button" onClick={saveDraft} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold"><Save size={16}/>Save draft</button>{draft&&<div className="mt-4 border-t border-slate-100 pt-4 text-sm"><p className="line-clamp-2 text-slate-700">{draft.message||"Empty draft"}</p><p className="mt-1 text-xs text-slate-400">{new Date(draft.savedAt).toLocaleString()}</p><div className="mt-3 flex gap-4"><button type="button" onClick={loadDraft} className="font-semibold text-blue-600">Load</button><button type="button" onClick={discardDraft} className="inline-flex items-center gap-1 font-semibold text-red-600"><Trash2 size={14}/>Delete</button></div></div>}</div>
   </div>
  </form>}
 </div>;
}
