"use client";
import {useMemo,useState} from "react";
import ScheduledJobActions from "@/components/planner/ScheduledJobActions";
type Event={id:string;title:string;at:string;platform:"FACEBOOK"|"INSTAGRAM";status:string;jobId?:string};
export default function PublishingCalendar({events}:{events:Event[]}){
 const [cursor,setCursor]=useState(()=>{const d=new Date();return new Date(d.getFullYear(),d.getMonth(),1)});
 const [selected,setSelected]=useState(()=>new Date().toISOString().slice(0,10));
 const start=useMemo(()=>new Date(cursor.getFullYear(),cursor.getMonth(),1),[cursor]);
 const daysInMonth=new Date(start.getFullYear(),start.getMonth()+1,0).getDate();
 const offset=start.getDay();
 const byDay=(date:string)=>events.filter(e=>new Date(e.at).toLocaleDateString("en-CA")===date||new Date(e.at).toISOString().slice(0,10)===date);
 const chosen=events.filter(e=>new Date(e.at).toISOString().slice(0,10)===selected);
 return <div className="rounded-xl border border-slate-200 bg-white p-5">
  <div className="flex items-center justify-between gap-2"><h2 className="font-bold">Publishing calendar</h2><div className="flex items-center gap-3"><button type="button" aria-label="Previous month" onClick={()=>setCursor(new Date(cursor.getFullYear(),cursor.getMonth()-1,1))} className="rounded border px-3 py-1">‹</button><span className="min-w-28 text-center text-sm font-semibold">{cursor.toLocaleDateString(undefined,{month:"long",year:"numeric"})}</span><button type="button" aria-label="Next month" onClick={()=>setCursor(new Date(cursor.getFullYear(),cursor.getMonth()+1,1))} className="rounded border px-3 py-1">›</button></div></div>
  <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500">{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=><div key={d}>{d}</div>)}</div>
  <div className="mt-2 grid grid-cols-7 gap-1">{Array.from({length:Math.ceil((offset+daysInMonth)/7)*7},(_,i)=>{const day=i-offset+1;if(day<1||day>daysInMonth)return <div key={i} className="min-h-20 rounded bg-slate-50"/>;const date=new Date(start.getFullYear(),start.getMonth(),day).toISOString().slice(0,10);const rows=byDay(date);return <button key={date} type="button" onClick={()=>setSelected(date)} className={`min-h-20 rounded-lg border p-1 text-left text-xs hover:border-blue-400 sm:p-2 ${selected===date?"border-blue-600 bg-blue-50":"border-slate-100"}`}><span className="font-semibold">{day}</span>{rows.slice(0,2).map(e=><span key={e.id} className={`mt-1 block truncate rounded px-1 py-0.5 text-[10px] ${e.platform==="FACEBOOK"?"bg-blue-100 text-blue-800":"bg-pink-100 text-pink-800"}`}>{e.title}</span>)}{rows.length>2&&<span className="mt-1 block text-[10px] text-slate-500">+{rows.length-2} more</span>}</button>})}</div>
  <div className="mt-5 border-t border-slate-100 pt-4"><h3 className="font-semibold">{selected} · {chosen.length} item(s)</h3>{chosen.length?<div className="mt-3 space-y-3">{chosen.map(e=><div key={e.id} className="rounded-lg border border-slate-200 p-3"><div className="flex flex-wrap justify-between gap-3"><p className="text-sm font-semibold">{e.title}</p><span className="text-xs text-slate-500">{e.platform} · {e.status}</span></div><p className="mt-1 text-xs text-slate-500">{new Date(e.at).toLocaleString()}</p>{e.jobId&&e.status==="PENDING"&&<ScheduledJobActions id={e.jobId}/>}</div>)}</div>:<p className="mt-2 text-sm text-slate-500">No publishing events on this date.</p>}</div>
 </div>;
}
