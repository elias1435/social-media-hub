"use client";
import {FormEvent,useState} from "react";
import {toast} from "sonner";
type Settings={timezone:string;notifyInApp:boolean;notifyEmail:boolean;autoAssignInbox:boolean;enableAutomation:boolean;defaultPublishMode:string};
export default function SettingsForm({initial,canEdit}:{initial:Settings;canEdit:boolean}){
 const [form,setForm]=useState(initial),[busy,setBusy]=useState(false);
 const set=(key:keyof Settings,value:string|boolean)=>setForm(old=>({...old,[key]:value}));
 async function submit(e:FormEvent){e.preventDefault();if(!canEdit)return;setBusy(true);
 try{const res=await fetch("/api/settings",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});const data=await res.json();
 if(!res.ok)throw new Error(data.error||"Save failed");toast.success("Preferences saved");}catch(e){toast.error(e instanceof Error?e.message:"Save failed")}finally{setBusy(false)}}
 return <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-6">
  <h2 className="text-lg font-bold">Workspace preferences</h2><p className="mt-2 text-xs text-slate-500">These preferences are stored in your organization. External mail and job processing still require their production integrations.</p>
  <div className="mt-5 grid gap-5 sm:grid-cols-2">
  <label className="text-sm font-semibold">Time zone<select disabled={!canEdit} value={form.timezone} onChange={e=>set("timezone",e.target.value)} className="mt-2 block w-full rounded-lg border p-3 font-normal">
    {["Asia/Dhaka","America/New_York","Asia/Jerusalem","Europe/London","UTC"].map(z=><option key={z} value={z}>{z}</option>)}
   </select></label>
  <label className="text-sm font-semibold">Default publishing<select disabled={!canEdit} value={form.defaultPublishMode} onChange={e=>set("defaultPublishMode",e.target.value)} className="mt-2 block w-full rounded-lg border p-3 font-normal"><option value="now">Publish now</option><option value="schedule">Schedule</option></select></label>
  </div>
  <div className="mt-6 space-y-4">{([
   ["notifyInApp","In-app notifications","Store relevant workspace alerts"],
   ["notifyEmail","Email notifications","Send alerts once the email provider and worker are configured"],
   ["autoAssignInbox","Automatic inbox assignment","Enable assignment rules when a worker is configured"],
   ["enableAutomation","Automation engine","Allow scheduled workflows after activation"]
  ] as const).map(([key,label,description])=><label key={key} className="flex items-start gap-3 rounded-lg border border-slate-200 p-4"><input type="checkbox" disabled={!canEdit} checked={form[key]} onChange={e=>set(key,e.target.checked)} className="mt-1"/><span><span className="block text-sm font-semibold">{label}</span><span className="mt-1 block text-xs text-slate-500">{description}</span></span></label>)}</div>
  {canEdit?<button disabled={busy} className="mt-5 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy?"Saving…":"Save settings"}</button>:<p className="mt-5 text-sm text-amber-700">Only a system administrator can change these settings.</p>}
 </form>;
}
