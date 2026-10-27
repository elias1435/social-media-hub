import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import { CheckCircle2, Globe2, ShieldCheck, Building2, ArrowLeft, ArrowRight, LockKeyhole } from "lucide-react";

export default async function MetaConnectPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <AppShell><PageHeader title="Connect Facebook" description="Securely connect real Facebook Pages to your Social Media Hub."/>
    <div className="mx-auto max-w-3xl">
      <Link href="/facebook" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800"><ArrowLeft size={16}/>Back to Facebook Pages</Link>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-7 text-white sm:p-9"><div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15"><Globe2 size={28}/></div><h2 className="text-2xl font-bold">Bring your Facebook Pages together</h2><p className="mt-2 max-w-xl text-sm text-blue-100">Connect once using Meta’s secure Business Login. Choose the businesses and Pages you want to make available to your team.</p></div>
        {error && <div className="mx-7 mt-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Meta setup is incomplete. Ask your administrator to verify the Meta environment variables.</div>}
        <div className="grid gap-6 p-7 sm:grid-cols-3">
          <div><Building2 className="mb-3 text-blue-600" size={23}/><h3 className="font-semibold text-slate-900">1. Sign in to Meta</h3><p className="mt-1 text-sm text-slate-500">Use the Facebook profile that has access to your business assets.</p></div>
          <div><CheckCircle2 className="mb-3 text-blue-600" size={23}/><h3 className="font-semibold text-slate-900">2. Select Pages</h3><p className="mt-1 text-sm text-slate-500">Choose eligible Facebook Pages inside Meta’s authorization window.</p></div>
          <div><ShieldCheck className="mb-3 text-blue-600" size={23}/><h3 className="font-semibold text-slate-900">3. Finish connecting</h3><p className="mt-1 text-sm text-slate-500">Your authorized Pages will appear automatically in the dashboard.</p></div>
        </div>
        <div className="mx-7 rounded-xl border border-blue-100 bg-blue-50 p-4"><div className="flex gap-3"><LockKeyhole size={20} className="shrink-0 text-blue-700"/><div><p className="text-sm font-semibold text-slate-900">Secure and under your control</p><p className="mt-1 text-sm text-slate-600">Your Facebook password is never shared with this app. Access tokens are encrypted on our server, and you can disconnect a Page from the dashboard.</p></div></div></div>
        <div className="flex flex-wrap items-center justify-between gap-4 p-7"><Link href="/facebook" className="text-sm font-semibold text-slate-500">Cancel</Link><a href="/api/meta/connect" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"><Globe2 size={18}/>Continue with Facebook<ArrowRight size={17}/></a></div>
      </div>
    </div>
  </AppShell>;
}
