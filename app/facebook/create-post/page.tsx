import {preferredPage} from "@/lib/workspace-page";
import PageNavigation from "@/components/facebook/PageNavigation";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import PostTypeSwitcher from "@/components/facebook/PostTypeSwitcher";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hasOrgPermission } from "@/lib/permissions";
export const dynamic="force-dynamic";
export default async function CreatePost({searchParams}:{searchParams:Promise<{page?:string}>}) {
 const session=await auth();const {page:requested}=await searchParams; const page=requested||await preferredPage(session?.user?.id,session?.user?.organizationId);
 const canCreate=session?.user?.organizationId&&session.user.id?await hasOrgPermission(session.user.id,session.user.organizationId,"facebook.posts.create"):false;
 if(!canCreate)return <AppShell><PageHeader title="Create Facebook Post" description="Access restricted"/><p className="rounded-xl border border-amber-200 bg-white p-6 text-sm text-amber-900">Your role cannot create Facebook posts. Contact your workspace administrator.</p></AppShell>;
 const pages=session?.user?.organizationId?await prisma.socialAccount.findMany({where:{organizationId:session.user.organizationId,platform:"FACEBOOK",status:"CONNECTED"},select:{id:true,name:true},orderBy:{name:"asc"}}):[];
 return <AppShell><PageHeader title="Create Facebook Post" description="Publish text or image posts now, or schedule text posts or videos through Meta."/>{pages.length>0&&<PageNavigation accountId={pages.find(p=>p.id===page)?.id||pages[0].id} active="create-post"/>}<PostTypeSwitcher key={page} pages={pages} selected={page}/></AppShell>;
}
