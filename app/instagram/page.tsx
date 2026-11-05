import InstagramComposer from "@/components/instagram/InstagramComposer";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { graphGet,decryptToken } from "@/lib/meta-connection";
import { Instagram } from "lucide-react";
export const dynamic="force-dynamic";
type IG={id:string;username?:string;name?:string;followers_count?:number;media_count?:number;profile_picture_url?:string};
type Page={id:string;name:string;externalAccountId:string;accessTokenCiphertext:string|null};
export default async function InstagramAccounts(){
 const session=await auth();const organizationId=session?.user?.organizationId;
 const pages:Page[]=organizationId?await prisma.socialAccount.findMany({where:{organizationId,platform:"FACEBOOK",status:"CONNECTED"},select:{id:true,name:true,externalAccountId:true,accessTokenCiphertext:true}}):[];
 const accounts:Array<{page:Page;instagram:IG}>=[];const errors:string[]=[];
 for(const page of pages){
  if(!page.accessTokenCiphertext)continue;
  try{
   const token=decryptToken(page.accessTokenCiphertext);
   const result=await graphGet<{instagram_business_account?:{id:string}}>("/"+page.externalAccountId,token,{fields:"instagram_business_account"});
   if(!result.instagram_business_account?.id)continue;
   const ig=await graphGet<IG>("/"+result.instagram_business_account.id,token,{fields:"id,username,name,followers_count,media_count,profile_picture_url"});
   accounts.push({page,instagram:ig});
  }catch(e){errors.push(page.name+": "+(e instanceof Error?e.message:"Instagram permissions unavailable"));}
 }
 return <AppShell><PageHeader title="Instagram Accounts" description="Instagram professional accounts linked to your connected Facebook Pages." action={<Link href="/connected-accounts/meta" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Connect through Meta</Link>}/>
 {errors.length>0&&<div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{errors.join(" · ")}</div>}
 {accounts.length>0&&<div className="mb-6"><InstagramComposer accounts={accounts.map(({page,instagram})=>({id:instagram.id,name:instagram.username?"@"+instagram.username:instagram.name||instagram.id,pageId:page.id}))}/></div>}
 {accounts.length?<div className="grid gap-4 sm:grid-cols-2">{accounts.map(({page,instagram})=><div key={instagram.id} className="rounded-xl border border-slate-200 bg-white p-6"><div className="flex items-center gap-3"><Instagram size={24} className="text-pink-600"/><div><h2 className="font-bold">{instagram.username?"@"+instagram.username:instagram.name||instagram.id}</h2><p className="text-xs text-slate-500">Linked Page: {page.name}</p></div></div><div className="mt-5 grid grid-cols-2 gap-4 text-sm"><div><p className="text-slate-500">Followers</p><p className="mt-1 text-xl font-semibold">{instagram.followers_count?.toLocaleString()??"Unavailable"}</p></div><div><p className="text-slate-500">Media posts</p><p className="mt-1 text-xl font-semibold">{instagram.media_count?.toLocaleString()??"Unavailable"}</p></div></div><p className="mt-4 text-xs text-slate-400">Photo publishing uses the linked Page token and requires instagram_content_publish.</p></div>)}</div>:
 <div className="rounded-xl border border-slate-200 bg-white p-8"><Instagram size={28} className="text-pink-600"/><h2 className="mt-4 text-lg font-bold">No accessible Instagram professional accounts found</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">Link a Business or Creator Instagram account to a Facebook Page and grant instagram_basic in your Meta Business Login configuration. Reconnect that Page to apply any newly approved permissions.</p><Link href="/facebook" className="mt-4 inline-block text-sm font-semibold text-blue-600">Manage connected Pages</Link></div>}
 </AppShell>;
}
