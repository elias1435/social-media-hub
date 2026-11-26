"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
type Role={id:string;name:string};
export default function UserAccessControls({id,roleId,status,roles,isSelf}:{id:string;roleId:string;status:string;roles:Role[];isSelf:boolean}){
 const [selected,setSelected]=useState(roleId),[busy,setBusy]=useState(false);
 const router=useRouter();
 async function change(payload:{roleId?:string;status?:string}){if(busy)return;setBusy(true);try{
  const response=await fetch("/api/users/"+encodeURIComponent(id),{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
  const data=await response.json();
  if(!response.ok)throw new Error(data.error||"Could not change user");
  toast.success("User access updated");router.refresh();
 }catch(e){toast.error(e instanceof Error?e.message:"Update failed");setSelected(roleId);}finally{setBusy(false)}}
 return <div className="flex min-w-[200px] flex-col gap-2">
 <select aria-label="User role" disabled={busy} value={selected} onChange={e=>{setSelected(e.target.value);void change({roleId:e.target.value});}} className="rounded-lg border border-slate-200 p-2 text-xs">{roles.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select>
 {!isSelf&&<button type="button" disabled={busy} onClick={()=>{const next=status==="ACTIVE"?"SUSPENDED":"ACTIVE";if(window.confirm(next==="SUSPENDED"?"Suspend this team member?":"Restore this team member?"))void change({status:next});}} className={`rounded-lg border px-2 py-2 text-xs font-semibold ${status==="ACTIVE"?"border-red-200 text-red-700":"border-green-200 text-green-700"}`}>{status==="ACTIVE"?"Suspend user":"Reactivate user"}</button>}
 </div>;
}
