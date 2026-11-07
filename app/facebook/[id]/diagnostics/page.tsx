import Link from "next/link";
import { notFound,redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { inspectFacebookPageToken } from "@/lib/meta-capabilities";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import PageNavigation from "@/components/facebook/PageNavigation";

export const dynamic="force-dynamic";

const FEATURE_SCOPES=[
 ["Page discovery","pages_show_list"],
 ["Page content reading","pages_read_engagement"],
 ["Posts and video publishing","pages_manage_posts"],
 ["Comment management","pages_manage_engagement"],
 ["Customer comments","pages_read_user_content"],
 ["Messenger","pages_messaging"],
 ["Instagram discovery","instagram_basic"],
 ["Instagram publishing","instagram_content_publish"]
] as const;

export default async function Diagnostics({params}:{params:Promise<{id:string}>}){
 const session=await auth();
 if(!session?.user?.organizationId)redirect("/login");
 const {id}=await params;
 const page=await prisma.socialAccount.findFirst({where:{id,organizationId:session.user.organizationId,platform:"FACEBOOK"},select:{id:true,name:true,status:true,externalAccountId:true,accessTokenCiphertext:true}});
 if(!page)notFound();
 const report=page.accessTokenCiphertext?await inspectFacebookPageToken(page.accessTokenCiphertext,page.externalAccountId):null;
 return <AppShell><PageHeader title={page.name+" — Connection Diagnostics"} description="Live permission and token checks against Meta. No secret tokens are displayed." action={<Link href={"/facebook/"+id+"/settings"} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold">Connection Settings</Link>}/>
 <PageNavigation accountId={id} active="diagnostics"/>
 <div className="space-y-5">
 <section className="rounded-xl border border-slate-200 bg-white p-6"><h2 className="font-bold">Access token diagnostics</h2>{report?<div className="mt-4 grid gap-3 sm:grid-cols-3">{[["Token valid",report.valid===null?"Unable to verify":report.valid?"Yes":"No"],["Token type",report.tokenType],["Page identity",report.pageMatches?"Matches Page":"Not confirmed"]].map(([label,value])=><div key={label} className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-semibold">{value}</p></div>)}</div>:<p className="mt-3 text-sm text-slate-500">No access token saved for this connection.</p>}
 {report?.warnings.length?<div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{report.warnings.map((warning,i)=><p key={i} className="mt-1">{warning}</p>)}</div>:null}
 </section>
 <section className="rounded-xl border border-slate-200 bg-white p-6"><h2 className="font-bold">Permissions reported by Meta</h2><p className="mt-2 text-xs text-slate-500">This only checks granted OAuth scopes. Page tasks, app review and feature-specific Meta authorization also apply.</p><div className="mt-4 divide-y divide-slate-100">{FEATURE_SCOPES.map(([label,scope])=><div key={scope} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"><div><p className="font-medium">{label}</p><p className="font-mono text-xs text-slate-500">{scope}</p></div><span className={report?.granted[scope]?"font-semibold text-green-700":"text-amber-700"}>{report?report.granted[scope]?"Granted":"Not reported":"Unavailable"}</span></div>)}</div></section>
 <section className="rounded-xl border border-blue-100 bg-white p-6"><h2 className="font-bold">How to resolve missing access</h2><p className="mt-2 text-sm leading-6 text-slate-600">In your Meta Developer app, update your Business Login configuration and request the required Page permissions. Ensure your Facebook profile has the necessary Page content tasks. Reauthorize using Connect Facebook afterward; you do not need to disconnect the existing Page first.</p><Link href="/connected-accounts/meta" className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Reauthorize Facebook</Link></section>
 </div></AppShell>;
}
