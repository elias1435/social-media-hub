"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { RefreshCw } from "lucide-react";
export default function InboxRefresh() {
 const router=useRouter();
 const [busy,startTransition]=useTransition();
 return <button type="button" disabled={busy} onClick={()=>startTransition(()=>router.refresh())} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 disabled:opacity-50"><RefreshCw size={16} className={busy?"animate-spin":""}/>{busy?"Refreshing…":"Refresh inbox"}</button>;
}
