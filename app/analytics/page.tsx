import PageNavigation from "@/components/facebook/PageNavigation";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { decryptToken, graphGet } from "@/lib/meta-connection";
import { hasOrgPermission } from "@/lib/permissions";
export const dynamic = "force-dynamic";
type Info = { followers_count?: number; fan_count?: number };
export default async function Analytics({searchParams}:{searchParams:Promise<{page?:string}>}) {
 const {page}=await searchParams;
 const session=await auth();
 const allowed=session?.user?.organizationId&&session.user.id?await hasOrgPermission(session.user.id,session.user.organizationId,"analytics.view"):false;
 if(!allowed)return <AppShell><PageHeader title="Analytics & Reports" description="Access restricted"/><p className="rounded-xl bg-white p-6">Your role cannot view analytics.</p></AppShell>;
 const pages=session?.user?.organizationId?await prisma.socialAccount.findMany({where:{organizationId:session.user.organizationId,platform:"FACEBOOK",status:"CONNECTED"}}):[];
 const records: {id:string;name:string;followers:number|null;likes:number|null;error:boolean}[]=[];
 for(const account of (page?pages.filter(p=>p.id===page):pages)){
  const page=account;
  let followers:number|null=null, likes:number|null=null, error=false;
  try {
   if(!page.accessTokenCiphertext) throw new Error("No token");
   const info=await graphGet<Info>("/"+encodeURIComponent(page.externalAccountId),decryptToken(page.accessTokenCiphertext),{fields:"followers_count,fan_count"});
   followers=typeof info.followers_count==="number"?info.followers_count:null;
   likes=typeof info.fan_count==="number"?info.fan_count:null;
  }catch{error=true;}
  records.push({id:page.id,name:page.name,followers,likes,error});
 }
 const totalFollowers=records.reduce((sum,row)=>sum+(row.followers||0),0);
 const start=new Date(Date.now()-30*86400000);
 const [history,replies]=await Promise.all([
  prisma.analyticsSnapshot.findMany({where:{organizationId:session!.user.organizationId,platform:"FACEBOOK",metric:"followers",date:{gte:start}},orderBy:{date:"desc"},take:90}),
  prisma.activityLog.count({where:{organizationId:session!.user.organizationId,action:"FACEBOOK_MESSENGER_REPLIED",createdAt:{gte:start}}})
 ]);
 let adReports:Array<{id:string;name:string;currency:string;spend:string;impressions:string;clicks:string}>=[];
 if(session!.user.isSystemAdmin&&process.env.META_ADS_ACCESS_TOKEN){
  try{
   const token=process.env.META_ADS_ACCESS_TOKEN;
   const accounts=await graphGet<{data?:Array<{id:string;name?:string;currency?:string}>}>("/me/adaccounts",token,{fields:"id,name,currency",limit:"20"});
   for(const a of accounts.data||[]){
    try{const report=await graphGet<{data?:Array<{spend?:string;impressions?:string;clicks?:string}>}>("/"+a.id+"/insights",token,{fields:"spend,impressions,clicks",date_preset:"last_30d"});
     const row=report.data?.[0];if(row)adReports.push({id:a.id,name:a.name||a.id,currency:a.currency||"",spend:row.spend||"0",impressions:row.impressions||"0",clicks:row.clicks||"0"});
    }catch{}
   }
  }catch{}
 }
 
 return <AppShell><PageHeader title="Analytics & Reports" description="Live Facebook Page follower and like counts. Other platform insights require their own integrations."/>
 {page&&pages.some(p=>p.id===page)&&<PageNavigation accountId={page} active="analytics"/>}
 <div className="grid gap-4 sm:grid-cols-3"><div className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Pages in view</p><p className="mt-2 text-3xl font-bold">{records.length}</p></div><div className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Known total followers</p><p className="mt-2 text-3xl font-bold">{totalFollowers.toLocaleString()}</p><p className="mt-1 text-xs text-slate-400">Excludes unavailable values</p></div><div className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Data source</p><p className="mt-2 font-semibold">Meta Graph API</p><p className="mt-1 text-xs text-slate-400">Refreshed on page load</p></div></div>
 <div className="mt-5 grid gap-4 sm:grid-cols-2"><div className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Messenger replies sent through this portal (30 days)</p><p className="mt-2 text-3xl font-bold">{replies.toLocaleString()}</p><p className="mt-1 text-xs text-slate-400">Activity-log count, not incoming message volume</p></div><div className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Daily follower snapshots recorded (30 days)</p><p className="mt-2 text-3xl font-bold">{history.length}</p><p className="mt-1 text-xs text-slate-400">Configure the daily metrics cron to build history</p></div></div>
 {history.length>0&&<div className="mt-5 rounded-xl border border-slate-200 bg-white p-5"><h3 className="font-semibold">Recent follower snapshots</h3><div className="mt-4 max-h-64 overflow-auto"><table className="w-full text-left text-sm"><thead><tr><th className="py-2">Date (UTC)</th><th>Page ID</th><th>Followers</th></tr></thead><tbody>{history.map(h=><tr key={h.id} className="border-t border-slate-100"><td className="py-2">{h.date.toISOString().slice(0,10)}</td><td>{h.externalId}</td><td>{h.value.toLocaleString()}</td></tr>)}</tbody></table></div></div>}
 {session!.user.isSystemAdmin&&<div className="mt-5 rounded-xl border border-slate-200 bg-white p-5"><h3 className="font-semibold">Meta Ads reporting (last 30 days)</h3><p className="mt-2 text-xs text-slate-500">System-admin view only. Ad accounts have not been assigned to organizations; currencies are not combined.</p>{adReports.length?<div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th className="py-2">Ad account</th><th>Spend</th><th>Impressions</th><th>Clicks</th></tr></thead><tbody>{adReports.map(a=><tr key={a.id} className="border-t border-slate-100"><td className="py-3">{a.name}</td><td>{a.spend} {a.currency}</td><td>{a.impressions}</td><td>{a.clicks}</td></tr>)}</tbody></table></div>:<p className="mt-4 text-sm text-slate-500">Ads insights unavailable or not configured.</p>}</div>}
 <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="px-5 py-3">Page</th><th className="px-5 py-3">Followers</th><th className="px-5 py-3">Likes</th><th className="px-5 py-3">Connection data</th></tr></thead><tbody className="divide-y divide-slate-100">{records.map(p=><tr key={p.id}><td className="px-5 py-4"><Link href={"/facebook/"+p.id} className="font-semibold text-blue-700">{p.name}</Link></td><td className="px-5 py-4">{p.followers?.toLocaleString()??"Unavailable"}</td><td className="px-5 py-4">{p.likes?.toLocaleString()??"Unavailable"}</td><td className="px-5 py-4 text-xs text-slate-500">{p.error?"Permission or token check required":"Retrieved from Meta"}</td></tr>)}</tbody></table>{records.length===0&&<p className="p-6 text-sm text-slate-500">Connect a Facebook Page to view real analytics.</p>}</div>
 </AppShell>;
}
