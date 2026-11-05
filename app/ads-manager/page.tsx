import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import { graphGet } from "@/lib/meta-connection";
export const dynamic = "force-dynamic";
type Account={id:string;name?:string;account_id?:string;currency?:string};
type Campaign={id:string;name?:string;objective?:string;effective_status?:string};
export default async function Ads({searchParams}:{searchParams:Promise<{account?:string}>}){
 const {account}=await searchParams;
 const token=process.env.META_ADS_ACCESS_TOKEN;
 let accounts:Account[]=[];let campaigns:Campaign[]=[];let error="";
 if(token){
  try{
   const data=await graphGet<{data?:Account[]}>("/me/adaccounts",token,{fields:"id,name,account_id,currency",limit:"100"});accounts=data.data||[];
  }catch(e){error=e instanceof Error?e.message:"Could not retrieve ad accounts";}
 }
 const chosen=accounts.find(a=>a.id===account)||accounts[0];
 if(token&&chosen){
  try{
   const data=await graphGet<{data?:Campaign[]}>("/"+chosen.id+"/campaigns",token,{fields:"id,name,objective,effective_status",limit:"100"});campaigns=data.data||[];
  }catch(e){error=e instanceof Error?e.message:"Could not retrieve campaigns";}
 }
 return <AppShell><PageHeader title="Meta Ads Manager" description="Live, read-only Meta Marketing API campaign listing."/>
 {!token?<div className="rounded-xl border border-amber-200 bg-white p-6"><h2 className="font-bold">Ads Manager authorization required</h2><p className="mt-3 text-sm leading-6 text-slate-600">Configure the META_ADS_ACCESS_TOKEN server environment variable using a token granted ads_read for the authorized ad accounts. The existing Page connection alone does not necessarily grant ad account access.</p><Link className="mt-4 inline-block text-sm font-semibold text-blue-600" href="/facebook">Manage Pages</Link></div>:
 <div className="space-y-5">{error&&<p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error}</p>}
 <div className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-bold">Ad Accounts</h2>{accounts.length?<div className="mt-3 flex flex-wrap gap-2">{accounts.map(a=><Link key={a.id} href={"/ads-manager?account="+encodeURIComponent(a.id)} className={chosen?.id===a.id?"rounded-lg bg-blue-600 px-3 py-2 text-sm text-white":"rounded-lg border border-slate-200 px-3 py-2 text-sm"}>{a.name||a.id}</Link>)}</div>:<p className="mt-3 text-sm text-slate-500">No ad accounts returned.</p>}</div>
 {chosen&&<div className="overflow-x-auto rounded-xl border border-slate-200 bg-white"><div className="border-b border-slate-100 p-5"><h2 className="font-semibold">Campaigns: {chosen.name||chosen.id}</h2></div><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="px-5 py-3">Campaign</th><th className="px-5 py-3">Objective</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{campaigns.map(c=><tr key={c.id}><td className="px-5 py-4">{c.name||c.id}</td><td className="px-5 py-4">{c.objective||"Unknown"}</td><td className="px-5 py-4">{c.effective_status||"Unknown"}</td><td className="px-5 py-4"><a className="text-blue-600" target="_blank" rel="noopener noreferrer" href={"https://adsmanager.facebook.com/adsmanager/manage/campaigns?act="+encodeURIComponent(chosen.account_id||"")}>Open in Meta</a></td></tr>)}</tbody></table>{!campaigns.length&&<p className="p-5 text-sm text-slate-500">No campaigns returned.</p>}</div>}</div>}
 </AppShell>;
}
