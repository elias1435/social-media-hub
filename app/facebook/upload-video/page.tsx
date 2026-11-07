import VideoUploader from "@/components/facebook/VideoUploader";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import PageNavigation from "@/components/facebook/PageNavigation";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
export default async function UploadVideo({searchParams}:{searchParams:Promise<{page?:string}>}){const {page}=await searchParams; const session=await auth();const pages=session?.user?.organizationId?await prisma.socialAccount.findMany({where:{organizationId:session.user.organizationId,platform:"FACEBOOK",status:"CONNECTED"},select:{id:true,name:true}}):[]; const selected=pages.find(p=>p.id===page)||pages[0];return <AppShell><PageHeader title="Facebook Video Upload" description="Standard Facebook video uploads; Reels require a separate Meta workflow"/>{selected&&<PageNavigation accountId={selected.id} active="video-/-reels"/>}<VideoUploader pages={pages} selected={selected?.id}/></AppShell>}
