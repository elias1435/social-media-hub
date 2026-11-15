"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
type Page={id:string;name:string};
export default function MessengerPagePicker({pages,selectedId}:{pages:Page[];selectedId:string}){
 const router=useRouter();const [pending,startTransition]=useTransition();
 return <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-sm font-semibold text-slate-700 sm:max-w-sm">
  Facebook Page
  <select disabled={pending} value={selectedId} onChange={e=>startTransition(()=>router.push("/facebook/messages?page="+encodeURIComponent(e.target.value)))} className="w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-900 disabled:opacity-50">
   {pages.map(page=><option key={page.id} value={page.id}>{page.name}</option>)}
  </select>
 </label>;
}
