"use client";
import {useCallback,useEffect,useState} from "react";
import {toast} from "sonner";
type Note={id:string;text:string;createdAt:string;author:string};
type Thread={assignedToId:string|null;leadStatus:string;state:string;labels:unknown;notes:Note[]};
type User={id:string;name:string|null;email:string};
export default function MessengerThreadPanel({accountId,conversationId,canEdit}:{accountId:string;conversationId:string;canEdit:boolean}){
 const [thread,setThread]=useState<Thread|null>(null),[users,setUsers]=useState<User[]>([]),[loading,setLoading]=useState(true);
 const [note,setNote]=useState(""),[labels,setLabels]=useState(""),[busy,setBusy]=useState(false);
 const load=useCallback(async()=>{setLoading(true);try{const response=await fetch("/api/messenger/thread?accountId="+encodeURIComponent(accountId)+"&conversationId="+encodeURIComponent(conversationId),{cache:"no-store"});const data=await response.json();if(!response.ok)throw new Error(data.error||"Thread unavailable");setThread(data.thread);setUsers(data.assignees||[]);setLabels(Array.isArray(data.thread?.labels)?data.thread.labels.join(", "):"");}catch(e){toast.error(e instanceof Error?e.message:"Could not load thread");}finally{setLoading(false)}},[accountId,conversationId]);
 useEffect(()=>{void load()},[load]);
 async function save(fields:Record<string,unknown>){if(!canEdit||busy)return;setBusy(true);try{const response=await fetch("/api/messenger/thread",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({accountId,conversationId,...fields})});const data=await response.json();if(!response.ok)throw new Error(data.error||"Update failed");if(fields.note)setNote("");toast.success("Conversation updated");await load();}catch(e){toast.error(e instanceof Error?e.message:"Could not update thread")}finally{setBusy(false)}}
 if(loading)return <p className="p-4 text-sm text-slate-500">Loading team details…</p>;
 return <div className="space-y-4 text-xs">
  <h4 className="font-bold text-slate-900">Team workspace</h4>
  <label className="block font-medium">Assigned to<select disabled={!canEdit||busy} value={thread?.assignedToId||""} onChange={e=>save({assignedToId:e.target.value||null})} className="mt-1 block w-full rounded-lg border border-slate-200 p-2 text-xs"><option value="">Unassigned</option>{users.map(u=><option key={u.id} value={u.id}>{u.name||u.email}</option>)}</select></label>
  <label className="block font-medium">Lead stage<select disabled={!canEdit||busy} value={thread?.leadStatus||"NEW"} onChange={e=>save({leadStatus:e.target.value})} className="mt-1 block w-full rounded-lg border border-slate-200 p-2 text-xs">{["NEW","QUALIFIED","FOLLOWUP","WON","LOST"].map(v=><option key={v} value={v}>{v.replaceAll("_"," ")}</option>)}</select></label>
  <label className="block font-medium">Conversation status<select disabled={!canEdit||busy} value={thread?.state||"OPEN"} onChange={e=>save({state:e.target.value})} className="mt-1 block w-full rounded-lg border border-slate-200 p-2 text-xs"><option value="OPEN">Open</option><option value="DONE">Done</option></select></label>
  <label className="block font-medium">Labels (comma separated)<input disabled={!canEdit||busy} value={labels} onChange={e=>setLabels(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs" maxLength={250}/></label>
  {canEdit&&<button type="button" disabled={busy} onClick={()=>save({labels:labels.split(",").map(s=>s.trim()).filter(Boolean).slice(0,10)})} className="rounded-lg border border-blue-200 px-3 py-2 font-semibold text-blue-700">Save labels</button>}
  <div className="border-t border-slate-100 pt-3"><h4 className="font-bold">Internal notes</h4><p className="mt-1 text-slate-500">Team-only notes, not sent to the customer.</p>
  {canEdit&&<><textarea value={note} maxLength={4000} onChange={e=>setNote(e.target.value)} rows={3} placeholder="Add a note…" className="mt-2 w-full rounded-lg border border-slate-200 p-2"/><button disabled={busy||!note.trim()} onClick={()=>save({note})} type="button" className="rounded-lg bg-blue-600 px-3 py-2 font-semibold text-white disabled:opacity-50">Add note</button></>}
  <div className="mt-3 space-y-2">{thread?.notes?.map(n=><div key={n.id} className="rounded-lg bg-slate-50 p-2"><p className="whitespace-pre-wrap break-words text-slate-700">{n.text}</p><p className="mt-1 text-[10px] text-slate-400">{n.author} · {new Date(n.createdAt).toLocaleString()}</p></div>)}{!thread?.notes?.length&&<p className="text-slate-500">No notes yet.</p>}</div>
  </div>
 </div>;
}
