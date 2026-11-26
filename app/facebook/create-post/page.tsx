import PageNavigation from "@/components/facebook/PageNavigation";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import PublishComposer from "@/components/facebook/PublishComposer";
import VideoUploader from "@/components/facebook/VideoUploader";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
export const dynamic="force-dynamic";
export default async function CreatePost({searchParams}:{searchParams:Promise<{page?:string}>}) {
 const session=await auth();const {page}=await searchParams;
 const pages=session?.user?.organizationId?await prisma.socialAccount.findMany({where:{organizationId:session.user.organizationId,platform:"FACEBOOK",status:"CONNECTED"},select:{id:true,name:true},orderBy:{name:"asc"}}):[];
 return <AppShell><PageHeader title="Create Facebook Post" description="Publish text or image posts now, or schedule text posts or videos through Meta."/>{pages.length>0&&<PageNavigation accountId={pages.find(p=>p.id===page)?.id||pages[0].id} active="create-post"/>}<PublishComposer pages={pages} selected={page}/><section className="mx-auto mt-8 max-w-5xl"><h2 className="mb-3 text-lg font-semibold text-slate-900">Video publishing and scheduling</h2><VideoUploader pages={pages} selected={page}/></section></AppShell>;
}
