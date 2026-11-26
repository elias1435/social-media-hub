"use client";
import {useEffect,useMemo,useRef,useState} from "react";
import Link from "next/link";
import {ChevronLeft,ChevronRight,Plus,X} from "lucide-react";
import DeleteScheduled from "@/components/planner/DeleteScheduled";
import ScheduledJobActions from "@/components/planner/ScheduledJobActions";
type Event={id:string;title:string;at:string;platform:"FACEBOOK"|"INSTAGRAM";status:string;jobId?:string;accountId?:string};
const pad=(n:number)=>String(n).padStart(2,"0");
function localDay(d:Date){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());}
export default function PublishingCalendar({events,pageId,canCreate,canPublish}:{events:Event[];pageId?:string;canCreate:boolean;canPublish:boolean}){
 const [mounted,setMounted]=useState(false);
 const [cursor,setCursor]=useState(()=>new Date());
 const [selected,setSelected]=useState<string|null>(null);
 const dialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{setCursor(new Date());setMounted(true)},[]);
 useEffect(()=>{const el=dialog.current;if(!el)return;if(selected&&!el.open)el.showModal();else if(!selected&&el.open)el.close();},[selected]);
 const start=new Date(cursor.getFullYear(),cursor.getMonth(),1);
 const daysInMonth=new Date(start.getFullYear(),start.getMonth()+1,0).getDate();
 const offset=start.getDay();
 const grouped=useMemo(()=>{
  const result=new Map<string,Event[]>();
  for(const e of events){const date=new Date(e.at);if(!Number.isFinite(date.getTime()))continue;const key=localDay(date);const list=result.get(key)||[];list.push(e);result.set(key,list);}
  for(const list of result.values())list.sort((a,b)=>Date.parse(a.at)-Date.parse(b.at));
  return result;
 },[events]);
 const chosen=selected?grouped.get(selected)||[]:[];
 const chosenDate=selected?new Date(selected+"T12:00:00"):null;
 const createParams=new URLSearchParams();
 if(pageId)createParams.set("page",pageId);
 if(selected)createParams.set("date",selected);
 const canSchedule=Boolean(selected&&new Date(selected+"T23:59:59").getTime()>Date.now()+11*60000&&new Date(selected+"T00:00:00").getTime()<Date.now()+29*86400000);
 const close=()=>setSelected(null);
 if(!mounted)return <div className="rounded-xl border border-slate-200 bg-white p-5"><p role="status" className="text-sm text-slate-500">Loading calendar…</p></div>;
 return <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
  <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold">Publishing calendar</h2><p className="mt-1 text-xs text-slate-500">Click any date to view or schedule content. Times shown in {Intl.DateTimeFormat().resolvedOptions().timeZone}.</p></div><div className="flex items-center gap-2"><button type="button" onClick={()=>setCursor(new Date())} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold">Today</button><button type="button" aria-label="Previous month" onClick={()=>setCursor(new Date(cursor.getFullYear(),cursor.getMonth()-1,1))} className="rounded-lg border border-slate-200 p-2"><ChevronLeft size={16}/></button><span className="min-w-28 text-center text-sm font-semibold">{cursor.toLocaleDateString(undefined,{month:"long",year:"numeric"})}</span><button type="button" aria-label="Next month" onClick={()=>setCursor(new Date(cursor.getFullYear(),cursor.getMonth()+1,1))} className="rounded-lg border border-slate-200 p-2"><ChevronRight size={16}/></button></div></div>
  <div className="mt-5 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500">{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=><div key={d}>{d}</div>)}</div>
  <div className="mt-2 grid grid-cols-7 gap-1">{Array.from({length:Math.ceil((offset+daysInMonth)/7)*7},(_,i)=>{const day=i-offset+1;if(day<1||day>daysInMonth)return <div key={i} className="min-h-24 rounded bg-slate-50"/>;const date=localDay(new Date(start.getFullYear(),start.getMonth(),day));const rows=grouped.get(date)||[];return <button key={date} type="button" aria-label={date+", "+rows.length+" scheduled items"} onClick={()=>setSelected(date)} className={`group flex min-h-24 min-w-0 flex-col rounded-lg border p-1 text-left text-xs transition hover:border-blue-400 hover:bg-blue-50 sm:p-2 ${date===localDay(new Date())?"border-blue-500 bg-blue-50":"border-slate-200"}`}><span className="flex w-full items-center justify-between gap-1"><span className="font-semibold">{day}</span>{rows.length>0?<span className="rounded-full bg-blue-100 px-1.5 text-[10px] text-blue-700">{rows.length}</span>:<Plus size={13} className="text-slate-400 opacity-0 group-hover:opacity-100"/>}</span>{rows.slice(0,2).map(e=><span key={e.id} className={`mt-1 block w-full truncate rounded px-1 py-1 text-[10px] ${e.platform==="FACEBOOK"?"bg-blue-100 text-blue-800":"bg-pink-100 text-pink-800"}`}>{new Date(e.at).toLocaleTimeString(undefined,{hour:"numeric",minute:"2-digit"})} · {e.title}</span>)}{rows.length>2&&<span className="mt-1 text-[10px] text-slate-500">+{rows.length-2} more</span>}</button>})}</div>
  <dialog ref={dialog} onClose={close} onCancel={close} onClick={e=>{if(e.target===e.currentTarget)close()}} aria-labelledby="planner-date-title" className="fixed inset-0 m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-900/50">
   <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-200 bg-white p-5"><div><h2 id="planner-date-title" className="text-lg font-bold">{chosenDate?.toLocaleDateString(undefined,{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</h2><p className="mt-1 text-sm text-slate-500">{chosen.length} scheduled item(s)</p></div><button type="button" aria-label="Close" onClick={close} className="rounded-lg p-2 hover:bg-slate-100"><X size={20}/></button></div>
   <div className="space-y-3 p-5">{chosen.length?chosen.map(e=><article key={e.id} className="rounded-xl border border-slate-200 p-4"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">{e.platform}</span><span className="text-xs text-slate-500">{e.status}</span></div><p className="mt-2 whitespace-pre-wrap break-words text-sm font-semibold">{e.title}</p><p className="mt-1 text-sm text-slate-500">{new Date(e.at).toLocaleTimeString(undefined,{hour:"numeric",minute:"2-digit"})}</p>{canPublish&&e.platform==="FACEBOOK"&&e.accountId&&<DeleteScheduled accountId={e.accountId} postId={e.id}/>}{canPublish&&e.jobId&&e.status==="PENDING"&&<ScheduledJobActions id={e.jobId}/>}</article>):<div className="rounded-xl border border-dashed border-slate-200 p-8 text-center"><p className="font-semibold">No scheduled content</p><p className="mt-1 text-sm text-slate-500">Choose a new post, video or Reel to schedule for this date.</p></div>}</div>
   <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white p-5"><button type="button" onClick={close} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold">Close</button>{canCreate&&canPublish&&canSchedule?<Link href={"/facebook/create-post?"+createParams.toString()} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"><Plus size={16}/>{chosen.length?"Add another post":"Create scheduled post"}</Link>:canCreate&&canPublish?<span className="text-xs text-slate-500">Choose a date within the supported scheduling window.</span>:null}</div>
  </dialog>
 </div>;
}
