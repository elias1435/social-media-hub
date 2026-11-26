"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {Plus,Save} from "lucide-react";
type Role={id:string;key:string;name:string;description:string;permissions:string[]};
type Permission={id:string;key:string;name:string};
export default function RolesManager({roles,permissions}:{roles:Role[];permissions:Permission[]}){
 const [selected,setSelected]=useState(roles[0]?.id||"new");
 const initial=roles.find(r=>r.id===selected);
 const [name,setName]=useState(initial?.name||"");
 const [description,setDescription]=useState(initial?.description||"");
 const [checked,setChecked]=useState<string[]>(initial?.permissions||[]);
 const [busy,setBusy]=useState(false);
 const router=useRouter();
 function choose(id:string){setSelected(id);const role=roles.find(r=>r.id===id);setName(role?.name||"");setDescription(role?.description||"");setChecked(role?.permissions||[]);}
 const isNew=selected==="new";const protectedRole=initial?.key==="super_admin";
 function toggle(key:string){setChecked(old=>old.includes(key)?old.filter(x=>x!==key):[...old,key]);}
 async function save(){
  if(busy||!name.trim()||protectedRole)return;
  setBusy(true);
  try{
   const response=await fetch(isNew?"/api/roles":"/api/roles/"+encodeURIComponent(selected),{method:isNew?"POST":"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,description,permissions:checked})});
   const data=await response.json().catch(()=>({}));
   if(!response.ok)throw new Error(data.error||"Could not save role");
   toast.success(isNew?"Role created":"Role updated");
   if(isNew)choose("new");
   router.refresh();
  }catch(e){toast.error(e instanceof Error?e.message:"Could not save role");}finally{setBusy(false);}
 }
 return <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
  <aside className="rounded-xl border border-slate-200 bg-white p-3">
   <button type="button" onClick={()=>choose("new")} className={`flex w-full items-center gap-2 rounded-lg px-3 py-3 text-left text-sm font-semibold ${isNew?"bg-blue-50 text-blue-700":"hover:bg-slate-50"}`}><Plus size={18}/>New role</button>
   <hr className="my-2 border-slate-100"/>
   {roles.map(role=><button type="button" key={role.id} onClick={()=>choose(role.id)} className={`mb-1 block w-full rounded-lg px-3 py-3 text-left text-sm ${role.id===selected?"bg-blue-50 text-blue-700":"hover:bg-slate-50"}`}><span className="font-semibold">{role.name}</span><span className="mt-1 block text-xs text-slate-500">{role.permissions.length} permissions</span></button>)}
  </aside>
  <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7">
   <h2 className="text-lg font-bold">{isNew?"Create a role":"Edit role"}</h2>
   {protectedRole&&<p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">The Super Admin role is protected. Other organization roles can be customized.</p>}
   <div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Role name<input value={name} disabled={protectedRole} onChange={e=>setName(e.target.value)} maxLength={64} className="mt-2 block w-full rounded-lg border border-slate-200 p-3 font-normal"/></label><label className="text-sm font-semibold">Description<input value={description} disabled={protectedRole} onChange={e=>setDescription(e.target.value)} maxLength={400} className="mt-2 block w-full rounded-lg border border-slate-200 p-3 font-normal"/></label></div>
   <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><h3 className="font-semibold">Granted permissions</h3><span className="text-xs text-slate-500">Only checked features appear in the role's navigation. API authorization still applies.</span></div>
   <div className="mt-4 grid gap-2 sm:grid-cols-2">{permissions.map(p=><label key={p.key} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 text-sm hover:bg-slate-50"><input type="checkbox" disabled={protectedRole} checked={checked.includes(p.key)} onChange={()=>toggle(p.key)} className="mt-1"/><span><span className="block font-semibold text-slate-800">{p.name}</span><span className="mt-1 block break-words text-xs text-slate-500">{p.key}</span></span></label>)}</div>
   {!protectedRole&&<button type="button" disabled={busy||!name.trim()} onClick={save} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"><Save size={17}/>{busy?"Saving…":isNew?"Create role":"Save changes"}</button>}
  </section>
 </div>;
}
