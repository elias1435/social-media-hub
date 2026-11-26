"use client";
import {useEffect,useState} from "react";
type Job={id:string;kind:string;status:string;scheduledAt:string;lastError:string|null};
export default function JobList(){
 const [jobs,setJobs]=useState<Job[]>([]),[error,setError]=useState("");
 async function load(){try{const r=await fetch("/api/automation/jobs",{cache:"no-store"});const d=await r.json();if(!r.ok)throw new Error(d.error||"Failed to load jobs");setJobs(d.jobs||[]);}catch(e){setError(e instanceof Error?e.message:"Could not load jobs")}}
 useEffect(()=>{void load()},[]);
 return <div className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex justify-between gap-2"><h2 className="font-semibold">Scheduled automation jobs</h2><button type="button" onClick={()=>void load()} className="text-sm font-semibold text-blue-600">Refresh</button></div>{error&&<p className="mt-3 text-red-600">{error}</p>}
 {jobs.length?<div className="mt-4 divide-y divide-slate-100">{jobs.map(j=><div key={j.id} className="flex flex-wrap items-start justify-between gap-3 py-3 text-sm"><div><p className="font-medium">{j.kind.replaceAll("_"," ")}</p><p className="mt-1 text-xs text-slate-500">{new Date(j.scheduledAt).toLocaleString()}</p>{j.lastError&&<p className="mt-1 text-xs text-red-600">{j.lastError}</p>}</div><span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold">{j.status}</span></div>)}</div>:<p className="mt-3 text-sm text-slate-500">No scheduled jobs.</p>}</div>;
}
