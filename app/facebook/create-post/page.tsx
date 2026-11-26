import PageNavigation from "@/components/facebook/PageNavigation";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import PostTypeSwitcher from "@/components/facebook/PostTypeSwitcher";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
export const dynamic="force-dynamic";
export default async function CreatePost({searchParams}:{searchParams:Promise<{page?:string}>}) {
 const session=await auth();const {page}=await searchParams;
 const pages=session?.user?.organizationId?await prisma.socialAccount.findMany({where:{organizationId:session.user.organizationId,platform:"FACEBOOK",status:"CONNECTED"},select:{id:true,name:true},orderBy:{name:"asc"}}):[];
 return <AppShell><PageHeader title="Create Facebook Post" description="Publish text or image posts now, or schedule text posts or videos through Meta."/>{pages.length>0&&<PageNavigation accountId={pages.find(p=>p.id===page)?.id||pages[0].id} active="create-post"/>}<PostTypeSwitcher pages={pages} selected={page}/></AppShell>;
}
