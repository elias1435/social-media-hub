"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle, Globe2, RefreshCcw, Unplug, ExternalLink } from "lucide-react";
import { toast } from "sonner";

type Page = { id: string; name: string; externalAccountId: string; avatarUrl: string | null; status: string; updatedAt: string; followersCount: number | null };
const messages: Record<string, string> = { success: "Facebook Pages connected successfully.", cancelled: "Facebook authorization was cancelled.", no_pages: "No Facebook Pages were returned. Check selected Pages and permissions in Meta.", invalid_state: "The connection request expired or was invalid. Please retry.", session_expired: "Your session expired. Log in and try again.", configuration: "Meta connection is not configured correctly.", token_error: "Meta could not issue an access token.", error: "Something went wrong while connecting Facebook.", missing_code: "Meta did not return an authorization code." };

export default function FacebookConnections({ initialPages, result }: { initialPages: Page[]; result: string }) {
  const router = useRouter();
  const [pages, setPages] = useState(initialPages);
  const [busy, setBusy] = useState<string | null>(null);
  async function disconnect(id: string, name: string) {
    if (!window.confirm("Disconnect " + name + "? Publishing and syncing will stop until you reconnect.")) return;
    setBusy(id);
    try {
      const response = await fetch("/api/meta/disconnect", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      if (!response.ok) throw new Error("Unable to disconnect this page.");
      setPages(old => old.map(page => page.id === id ? { ...page, status: "DISCONNECTED" } : page));
      toast.success("Page disconnected");
      router.refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Request failed"); }
    finally { setBusy(null); }
  }
  return <div>
    {result && messages[result] && <div role="status" className={`mx-5 mt-5 flex items-start gap-3 rounded-xl border p-4 text-sm ${result === "success" ? "border-green-200 bg-green-50 text-green-800" : "border-amber-200 bg-amber-50 text-amber-900"}`}>{result === "success" ? <CheckCircle2 size={19}/> : <AlertCircle size={19}/>}<span>{messages[result]}</span></div>}
    {pages.length === 0 ? <div className="flex flex-col items-center px-6 py-16 text-center"><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><Globe2 size={30}/></div><h3 className="mt-5 text-xl font-bold text-slate-900">Connect your first Facebook Page</h3><p className="mt-2 max-w-md text-sm text-slate-500">Authorize your business in Meta to bring your real Pages into Social Media Hub. No manual Page IDs or tokens needed.</p><Link href="/connected-accounts/meta" className="mt-6 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">Connect Facebook Page</Link></div> :
    <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="px-5 py-3">Page</th><th className="px-5 py-3">Followers</th><th className="px-5 py-3">Connection</th><th className="px-5 py-3">Last Connected</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{pages.map(p => <tr key={p.id}><td className="px-5 py-4"><div className="flex items-center gap-3">{p.avatarUrl ? <img src={p.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" /> : <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">{p.name.slice(0,2).toUpperCase()}</div>}<div><div className="font-semibold text-slate-800">{p.name}</div><div className="text-xs text-slate-400">ID: {p.externalAccountId}</div></div></div></td><td className="px-5 py-4">{p.followersCount?.toLocaleString() ?? "—"}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${p.status === "CONNECTED" ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"}`}>{p.status === "CONNECTED" ? "Connected" : "Disconnected"}</span></td><td className="px-5 py-4 text-slate-500">{new Date(p.updatedAt).toLocaleDateString()}</td><td className="px-5 py-4"><div className="flex flex-wrap justify-end gap-2"><a href={`https://www.facebook.com/${encodeURIComponent(p.externalAccountId)}`} target="_blank" rel="noopener noreferrer" title="View on Facebook" className="rounded-lg border border-slate-200 p-2 text-slate-600"><ExternalLink size={15}/></a>{p.status === "CONNECTED" ? <button disabled={busy===p.id} onClick={()=>disconnect(p.id,p.name)} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 disabled:opacity-50"><Unplug size={14}/>Disconnect</button> : <Link href="/connected-accounts/meta" className="inline-flex items-center gap-1 rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700"><RefreshCcw size={14}/>Reconnect</Link>}</div></td></tr>)}</tbody></table></div>}
  </div>;
}
