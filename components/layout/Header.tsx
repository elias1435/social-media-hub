"use client";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Bell, CircleHelp, ChevronDown, CalendarDays, LogOut, ArrowLeft, X, Menu } from "lucide-react";
import { signOut } from "next-auth/react";
import { menuItems, permissionByRoute } from "@/components/layout/Sidebar";

type Activity = {id:string;action:string;createdAt:string};
type Props = {permissions:string[];userName:string;roleName:string;activity:Activity[]};

const extraRoutes=[
 {label:"Create Facebook Post",href:"/facebook/create-post",permission:"facebook.posts.create"},
 {label:"Upload Facebook Video",href:"/facebook/upload-video",permission:"facebook.posts.publish"},
 {label:"Team / Users",href:"/team",permission:"users.manage"},
 {label:"Roles & Permissions",href:"/roles-permissions",permission:"roles.manage"},
 {label:"Activity Logs",href:"/activity-logs",permission:"activity_logs.view"},
 {label:"Connected Accounts",href:"/connected-accounts",permission:"social_accounts.view"},
 {label:"Settings",href:"/settings",permission:"settings.view"},
];

export default function Header({permissions,userName,roleName,activity}:Props){
 const router=useRouter(); const pathname=usePathname();
 const [search,setSearch]=useState("");
 const [open,setOpen]=useState<"search"|"notifications"|"help"|"profile"|"date"|null>(null);
 const [start,setStart]=useState("");
 const [end,setEnd]=useState("");
 const [seen,setSeen]=useState(false);
 const routes=useMemo(()=>[...menuItems.map(item=>({label:item.label,href:item.href,permission:permissionByRoute[item.href]})),...extraRoutes].filter(item=>permissions.includes(item.permission||"__not_allowed__")), [permissions]);
 const matching=useMemo(()=>routes.filter(item=>item.label.toLowerCase().includes(search.trim().toLowerCase())).slice(0,8),[routes,search]);
 useEffect(()=>{setOpen(null)},[pathname]);
 async function logout(){await signOut({redirect:false});window.location.href="/login";}
 const popClass="absolute right-0 top-full z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-xl";
 return <header className="sticky top-0 z-30 flex min-h-[72px] flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
  <button type="button" aria-label="Go back" title="Go back" onClick={()=>window.history.length>1?router.back():router.push("/")} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"><ArrowLeft size={19}/></button>
  <form onSubmit={e=>{e.preventDefault();if(matching[0]){router.push(matching[0].href);setSearch("");setOpen(null)}}} className="relative min-w-[140px] flex-1 lg:max-w-[470px]">
   <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5"><Search size={18} className="shrink-0 text-slate-400"/><input aria-label="Search workspace pages" value={search} onFocus={()=>setOpen("search")} onChange={e=>{setSearch(e.target.value);setOpen("search")}} placeholder="Search features and pages…" className="min-w-0 w-full bg-transparent text-sm outline-none"/></label>
   {open==="search"&&search.trim()&&<div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-72 overflow-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl">{matching.length?matching.map(item=><button key={item.href} type="button" onClick={()=>{router.push(item.href);setSearch("");setOpen(null)}} className="block w-full rounded-lg p-3 text-left text-sm hover:bg-slate-50">{item.label}</button>):<p className="p-3 text-sm text-slate-500">No permitted features found.</p>}</div>}
  </form>
  <div className="ml-auto flex items-center gap-1 sm:gap-2">
   <div className="relative">
    <button type="button" aria-label="Notifications" aria-expanded={open==="notifications"} onClick={()=>{setOpen(open==="notifications"?null:"notifications");setSeen(true)}} className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"><Bell size={20}/>{!seen&&activity.length>0&&<span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"/>}</button>
    {open==="notifications"&&<div className={popClass}><h2 className="mb-3 font-semibold">Recent workspace activity</h2>{activity.length?<div className="max-h-72 space-y-3 overflow-auto">{activity.map(a=><div key={a.id} className="border-b border-slate-100 pb-2"><p className="text-xs font-medium text-slate-700">{a.action.replaceAll("_"," ")}</p><p className="mt-1 text-xs text-slate-400">{new Date(a.createdAt).toLocaleString()}</p></div>)}</div>:<p className="text-slate-500">No recent activity.</p>}{permissions.includes("activity_logs.view")&&<Link className="mt-3 block font-semibold text-blue-600" href="/activity-logs">View activity log</Link>}</div>}
   </div>
   <div className="relative">
    <button type="button" aria-label="Help and information" aria-expanded={open==="help"} onClick={()=>setOpen(open==="help"?null:"help")} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"><CircleHelp size={20}/></button>
    {open==="help"&&<div className={popClass}><h2 className="font-semibold">Help & information</h2><p className="mt-2 text-slate-500">Use Search to find features you have permission to access. Facebook actions require a connected Page and Meta approval.</p><Link href="/data-deletion" className="mt-3 block font-medium text-blue-600">Data deletion information</Link><Link href="/privacy-policy" className="mt-2 block font-medium text-blue-600">Privacy policy</Link></div>}
   </div>
   <div className="relative">
    <button type="button" aria-label="Date range filter" aria-expanded={open==="date"} onClick={()=>setOpen(open==="date"?null:"date")} className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 text-xs text-slate-600 hover:bg-slate-50"><CalendarDays size={18}/><span className="hidden xl:inline">Date range</span></button>
    {open==="date"&&<form onSubmit={e=>{e.preventDefault();if(start&&end&&start>end)return;router.push("/activity-logs?from="+encodeURIComponent(start)+"&to="+encodeURIComponent(end));setOpen(null)}} className={popClass}><h2 className="mb-3 font-semibold">Filter activity logs</h2><label className="block">From<input type="date" required value={start} onChange={e=>setStart(e.target.value)} className="mt-1 w-full rounded border border-slate-200 p-2"/></label><label className="mt-3 block">To<input type="date" required value={end} onChange={e=>setEnd(e.target.value)} className="mt-1 w-full rounded border border-slate-200 p-2"/></label>{start&&end&&start>end&&<p role="alert" className="mt-2 text-red-600">End must be after start.</p>}<button disabled={!start||!end||start>end} className="mt-4 w-full rounded-lg bg-blue-600 px-3 py-2 text-white disabled:opacity-50">Apply to activity logs</button></form>}
   </div>
   <div className="relative">
    <button type="button" aria-label="User menu" aria-expanded={open==="profile"} onClick={()=>setOpen(open==="profile"?null:"profile")} className="flex items-center gap-2 rounded-lg p-1.5 text-left hover:bg-slate-100"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">{userName.trim().charAt(0).toUpperCase()||"U"}</span><span className="hidden max-w-32 sm:block"><span className="block truncate text-xs font-semibold text-slate-900">{userName}</span><span className="block truncate text-[11px] text-slate-500">{roleName}</span></span><ChevronDown size={15}/></button>
    {open==="profile"&&<div className={popClass}><p className="font-semibold">{userName}</p><p className="text-xs text-slate-500">{roleName}</p>{permissions.includes("settings.view")&&<Link href="/settings" className="mt-3 block rounded-lg p-2 hover:bg-slate-50">Settings</Link>}<button type="button" onClick={logout} className="mt-2 flex w-full items-center gap-2 rounded-lg p-2 text-left text-red-600 hover:bg-red-50"><LogOut size={16}/>Log out</button></div>}
   </div>
  </div>
 </header>;
}
