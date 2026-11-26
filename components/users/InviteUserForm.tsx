"use client";
import {FormEvent,useState} from "react";
import {toast} from "sonner";
type Role={id:string;name:string};
export default function InviteUserForm({roles}:{roles:Role[]}){
 const [name,setName]=useState(""),[email,setEmail]=useState(""),[roleId,setRoleId]=useState(""),[busy,setBusy]=useState(false);
 async function submit(e:FormEvent){e.preventDefault();setBusy(true);try{
  const response=await fetch("/api/invitations",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,email,roleId})});
  const data=await response.json();if(!response.ok)throw new Error(data.error||"Invitation failed");
  toast.success("Invitation email sent");setName("");setEmail("");setRoleId("");
 }catch(e){toast.error(e instanceof Error?e.message:"Invitation failed");}finally{setBusy(false);}}
 return <form onSubmit={submit} className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2">
 <div className="sm:col-span-2"><h2 className="font-semibold">Invite a team member</h2><p className="mt-1 text-sm text-slate-500">An expiring link lets the invitee set a private password. No password is shared with administrators.</p></div>
 <label className="text-sm font-medium">Full name<input required value={name} onChange={e=>setName(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 p-3"/></label>
 <label className="text-sm font-medium">Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 p-3"/></label>
 <label className="text-sm font-medium">Role<select required value={roleId} onChange={e=>setRoleId(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 p-3"><option value="">Choose role</option>{roles.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></label>
 <div className="flex items-end"><button disabled={busy} className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy?"Sending invitation…":"Send invitation"}</button></div>
 </form>;
}
