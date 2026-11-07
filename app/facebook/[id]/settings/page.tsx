import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import PageNavigation from "@/components/facebook/PageNavigation";
import PageSyncButton from "@/components/facebook/PageSyncButton";
import PageConnectionActions from "@/components/facebook/PageConnectionActions";
import { ShieldCheck } from "lucide-react";
export const dynamic="force-dynamic";
export default async function PageSettings({params}:{params:Promise<{id:string}>}){
 const session=await auth();
 if(!session?.user?.organizationId)redirect("/login");
 const {id}=await params;
 const account=await prisma.socialAccount.findFirst({where:{id,organizationId:session.user.organizationId,platform:"FACEBOOK"},select:{id:true,name:true,externalAccountId:true,status:true,createdAt:true,updatedAt:true,tokenExpiresAt:true}});
 if(!account)notFound();
 return <AppShell><PageHeader title={account.name+" — Connection Settings"} description="Manage this Facebook Page connection and access." action={<Link href={"/facebook/"+account.id} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold">Page Overview</Link>}/>
 <PageNavigation accountId={account.id} active="settings"/>
 <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]"><section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-bold">Connection details</h2><dl className="mt-5 space-y-4 text-sm"><div><dt className="text-slate-500">Page name</dt><dd className="mt-1 font-semibold">{account.name}</dd></div><div><dt className="text-slate-500">Facebook Page ID</dt><dd className="mt-1 font-mono">{account.externalAccountId}</dd></div><div><dt className="text-slate-500">Status</dt><dd className={account.status==="CONNECTED"?"mt-1 font-semibold text-green-700":"mt-1 font-semibold text-amber-700"}>{account.status}</dd></div><div><dt className="text-slate-500">First added</dt><dd className="mt-1">{account.createdAt.toLocaleString()}</dd></div><div><dt className="text-slate-500">Last updated</dt><dd className="mt-1">{account.updatedAt.toLocaleString()}</dd></div><div><dt className="text-slate-500">Token expiry</dt><dd className="mt-1">{account.tokenExpiresAt?account.tokenExpiresAt.toLocaleString():"Not provided by Meta"}</dd></div></dl></section>
 <section className="space-y-4"><div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><ShieldCheck size={24} className="text-blue-600"/><h2 className="mt-3 font-bold">Secure Page access</h2><p className="mt-2 text-sm leading-6 text-slate-600">Saved Meta access tokens are encrypted in the database and never exposed on this screen. A Page can be disconnected at any time.</p><div className="mt-5 flex flex-wrap gap-3">{account.status==="CONNECTED"?<PageSyncButton accountId={account.id}/>:<Link href="/connected-accounts/meta" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Reconnect with Meta</Link>}</div></div>
 {account.status==="CONNECTED"&&<div className="rounded-xl border border-red-100 bg-white p-6 shadow-sm"><h2 className="font-bold text-red-700">Disconnect Page</h2><p className="my-3 text-sm leading-6 text-slate-600">Removes the saved access token for this Page. This does not delete the Page on Facebook.</p><PageConnectionActions accountId={account.id} name={account.name}/></div>}</section></div>
 </AppShell>;
}
