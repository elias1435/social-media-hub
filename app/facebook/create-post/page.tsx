import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import PublishComposer from "@/components/facebook/PublishComposer";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
export const dynamic="force-dynamic";
export default async function CreatePost({searchParams}:{searchParams:Promise<{page?:string}>}) {
 const session=await auth();
 const {page}=await searchParams;
 const pages=session?.user?.organizationId?await prisma.socialAccount.findMany({where:{organizationId:session.user.organizationId,platform:"FACEBOOK",status:"CONNECTED"},select:{id:true,name:true},orderBy:{name:"asc"}}):[];
 return <AppShell><PageHeader title="Create Facebook Post" description="Create and publish a real text post to your connected Facebook Page."/><PublishComposer pages={pages} selected={page}/></AppShell>;
}
