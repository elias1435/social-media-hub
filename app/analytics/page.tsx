import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { decryptToken, graphGet } from "@/lib/meta-connection";
export const dynamic = "force-dynamic";
type Info = { followers_count?: number; fan_count?: number };
export default async function Analytics() {
 const session=await auth();
 const pages=session?.user?.organizationId?await prisma.socialAccount.findMany({where:{organizationId:session.user.organizationId,platform:"FACEBOOK",status:"CONNECTED"}}):[];
 const records: {id:string;name:string;followers:number|null;likes:number|null;error:boolean}[]=[];
 for(const page of pages){
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
 return <AppShell><PageHeader title="Analytics & Reports" description="Live Facebook Page follower and like counts. Other platform insights require their own integrations."/>
 <div className="grid gap-4 sm:grid-cols-3"><div className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Connected Facebook Pages</p><p className="mt-2 text-3xl font-bold">{pages.length}</p></div><div className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Known total followers</p><p className="mt-2 text-3xl font-bold">{totalFollowers.toLocaleString()}</p><p className="mt-1 text-xs text-slate-400">Excludes unavailable values</p></div><div className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">Data source</p><p className="mt-2 font-semibold">Meta Graph API</p><p className="mt-1 text-xs text-slate-400">Refreshed on page load</p></div></div>
 <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="px-5 py-3">Page</th><th className="px-5 py-3">Followers</th><th className="px-5 py-3">Likes</th><th className="px-5 py-3">Connection data</th></tr></thead><tbody className="divide-y divide-slate-100">{records.map(p=><tr key={p.id}><td className="px-5 py-4"><Link href={"/facebook/"+p.id} className="font-semibold text-blue-700">{p.name}</Link></td><td className="px-5 py-4">{p.followers?.toLocaleString()??"Unavailable"}</td><td className="px-5 py-4">{p.likes?.toLocaleString()??"Unavailable"}</td><td className="px-5 py-4 text-xs text-slate-500">{p.error?"Permission or token check required":"Retrieved from Meta"}</td></tr>)}</tbody></table>{records.length===0&&<p className="p-6 text-sm text-slate-500">Connect a Facebook Page to view real analytics.</p>}</div>
 </AppShell>;
}
