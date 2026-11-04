"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
export default function PageSyncButton({ accountId }: { accountId: string }) {
 const [busy, setBusy] = useState(false);
 const router = useRouter();
 async function refresh() {
  if (busy) return;
  setBusy(true);
  try {
   const response = await fetch("/api/facebook/refresh", {
    method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ accountId }),
   });
   const data = await response.json();
   if(!response.ok) throw new Error(data.error || "Unable to refresh Page");
   toast.success("Page information updated");
   router.refresh();
  } catch(error) {toast.error(error instanceof Error ? error.message : "Refresh failed");}
  finally{setBusy(false);}
 }
 return <button type="button" disabled={busy} onClick={refresh} className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50"><RefreshCw size={16} className={busy?"animate-spin":""}/>{busy?"Refreshing…":"Refresh Page"}</button>;
}
