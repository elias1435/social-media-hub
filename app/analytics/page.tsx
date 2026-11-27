import {Suspense} from "react";
import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";
import {hasOrgPermission} from "@/lib/permissions";
import {preferredPage} from "@/lib/workspace-page";
import {decryptToken,graphGet} from "@/lib/meta-connection";
import AppShell from "@/components/layout/AppShell";
import Dashboard from "@/components/analytics/AnalyticsDashboard";
export const dynamic="force-dynamic";
type Info={followers_count?:number;fan_count?:number};
type AdAccount={id:string;name?:string;currency?:string};
type AdRow={date_start?:string;spend?:string;impressions?:string;clicks?:string};
function num(value:unknown){if(value===null||value===undefined||value==="")return null;const n=Number(value);return Number.isFinite(n)&&n>=0?n:null;}
async function loadAds(days:number){
 const token=process.env.META_ADS_ACCESS_TOKEN;
 if(!token)return {accounts:[],status:"not-configured" as const};
 try{
  const list=await graphGet<{data?:AdAccount[]}>("/me/adaccounts",token,{fields:"id,name,currency",limit:"20"});
  const accounts=await Promise.all((list.data||[]).map(async a=>{
   try{
    const until=new Date(),since=new Date(Date.now()-(days-1)*86400000);
    const report=await graphGet<{data?:AdRow[]}>("/"+a.id+"/insights",token,{fields:"date_start,spend,impressions,clicks",time_increment:"1",time_range:JSON.stringify({since:since.toISOString().slice(0,10),until:until.toISOString().slice(0,10)}),limit:"100"});
    const rows=(report.data||[]).filter(r=>r.date_start).map(r=>({date:r.date_start!,spend:num(r.spend),impressions:num(r.impressions),clicks:num(r.clicks)}));
    return {id:a.id,name:a.name||a.id,currency:a.currency||"",rows,error:false};
   }catch{return {id:a.id,name:a.name||a.id,currency:a.currency||"",rows:[],error:true};}
  }));
  return {accounts,status:"ready" as const};
 }catch{return {accounts:[],status:"unavailable" as const};}
}
async function AnalyticsData({org,page,days,admin}:{org:string;page?:string;days:number;admin:boolean}){
 const all=await prisma.socialAccount.findMany({where:{organizationId:org,platform:"FACEBOOK",status:"CONNECTED"},select:{id:true,name:true,externalAccountId:true,accessTokenCiphertext:true},orderBy:{name:"asc"}});
 const selected=page&&page!=="all"&&all.some(a=>a.id===page)?page:"all";
 const pages=all.filter(a=>selected==="all"||a.id===selected);
 const ids=pages.map(a=>a.externalAccountId),internalIds=pages.map(a=>a.id);
 const since=new Date();since.setUTCHours(0,0,0,0);since.setUTCDate(since.getUTCDate()-days+1);
 const scope={organizationId:org,entityType:"SocialAccount",entityId:{in:internalIds},createdAt:{gte:since}};
 const [records,history,activity,ads]=await Promise.all([
  Promise.all(pages.map(async a=>{try{if(!a.accessTokenCiphertext)throw Error();const info=await graphGet<Info>("/"+encodeURIComponent(a.externalAccountId),decryptToken(a.accessTokenCiphertext),{fields:"followers_count,fan_count"});return {id:a.id,name:a.name,externalId:a.externalAccountId,followers:num(info.followers_count),likes:num(info.fan_count),error:false};}catch{return {id:a.id,name:a.name,externalId:a.externalAccountId,followers:null,likes:null,error:true};}})),
  prisma.analyticsSnapshot.findMany({where:{organizationId:org,platform:"FACEBOOK",externalId:{in:ids},metric:{in:["followers","likes"]},date:{gte:since}},select:{externalId:true,metric:true,value:true,date:true},orderBy:{date:"asc"}}),
  prisma.activityLog.groupBy({by:["action"],where:{...scope,action:{in:["FACEBOOK_MESSENGER_REPLIED","FACEBOOK_POST_PUBLISHED","FACEBOOK_VIDEO_UPLOADED","FACEBOOK_REEL_PUBLISHED","FACEBOOK_POST_SCHEDULED"]}},_count:{_all:true}}),
  admin?loadAds(days):Promise.resolve(null)
 ]);
 const counts=Object.fromEntries(activity.map(a=>[a.action,a._count._all]));
 return <Dashboard pages={all.map(a=>({id:a.id,name:a.name}))} selected={selected} days={days} records={records} snapshots={history.map(h=>({...h,date:h.date.toISOString().slice(0,10)}))} replies={counts.FACEBOOK_MESSENGER_REPLIED||0} published={(counts.FACEBOOK_POST_PUBLISHED||0)+(counts.FACEBOOK_VIDEO_UPLOADED||0)+(counts.FACEBOOK_REEL_PUBLISHED||0)} scheduled={counts.FACEBOOK_POST_SCHEDULED||0} ads={ads}/>;
}
export default async function Analytics({searchParams}:{searchParams:Promise<{page?:string;days?:string}>}){
 const session=await auth(),org=session?.user?.organizationId,user=session?.user?.id;
 if(!org||!user||!await hasOrgPermission(user,org,"analytics.view"))return <AppShell><div className="rounded-xl bg-white p-6"><h1 className="text-xl font-bold">Analytics &amp; Reports</h1><p className="mt-2 text-sm text-slate-500">Your role cannot view analytics.</p></div></AppShell>;
 const params=await searchParams;const page=params.page||await preferredPage(user,org);const days=params.days==="7"?7:params.days==="90"?90:30;
 return <AppShell><Suspense key={(page||"all")+":"+days} fallback={<div role="status" className="space-y-5"><div className="h-12 w-72 animate-pulse rounded-xl bg-slate-200"/><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1,2,3,4].map(n=><div key={n} className="h-32 animate-pulse rounded-2xl bg-white"/>)}</div><div className="h-80 animate-pulse rounded-2xl bg-white"/><p className="text-sm text-slate-500">Loading analytics…</p></div>}><AnalyticsData org={org} page={page} days={days} admin={Boolean(session?.user?.isSystemAdmin)}/></Suspense></AppShell>;
}
