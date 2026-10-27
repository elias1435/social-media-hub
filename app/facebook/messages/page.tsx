import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MessageSquare } from "lucide-react";
export const dynamic="force-dynamic";
export default async function Messages(){
 const session=await auth();
 const pages=session?.user?.organizationId?await prisma.socialAccount.findMany({where:{organizationId:session.user.organizationId,platform:"FACEBOOK",status:"CONNECTED"},select:{id:true,name:true,externalAccountId:true}}):[];
 return <AppShell><PageHeader title="Facebook Messenger Inbox" description="Manage Messenger conversations from your connected Pages."/>
 <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm"><MessageSquare size={28} className="text-blue-600"/><h2 className="mt-4 text-xl font-bold">Messenger integration requires additional setup</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">The previous inbox was demonstration content. Real Messenger conversations require Page messaging permissions, the Messenger product setup, and webhook subscriptions. No messages are fabricated or displayed here.</p><h3 className="mt-6 font-semibold">Connected Facebook Pages</h3>{pages.length?<div className="mt-2 space-y-2">{pages.map(p=><a key={p.id} href={"https://www.facebook.com/messages/t/"+encodeURIComponent(p.externalAccountId)} target="_blank" rel="noopener noreferrer" className="block rounded-lg border border-slate-200 p-3 text-sm text-blue-700 hover:bg-slate-50">{p.name} — Open Messenger on Facebook</a>)}</div>:<Link href="/connected-accounts/meta" className="mt-4 inline-block text-sm font-semibold text-blue-600">Connect a Facebook Page</Link>}</div></AppShell>;
}
