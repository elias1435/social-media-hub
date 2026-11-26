import {preferredPage} from "@/lib/workspace-page";
import VideoUploader from "@/components/facebook/VideoUploader";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import PageNavigation from "@/components/facebook/PageNavigation";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
export default async function UploadVideo({searchParams}:{searchParams:Promise<{page?:string}>}){const {page}=await searchParams; const session=await auth();const pages=session?.user?.organizationId?await prisma.socialAccount.findMany({where:{organizationId:session.user.organizationId,platform:"FACEBOOK",status:"CONNECTED"},select:{id:true,name:true}}):[]; const preferred=await preferredPage(session?.user?.id,session?.user?.organizationId); const selected=pages.find(p=>p.id===(page||preferred))||pages[0];return <AppShell><PageHeader title="Facebook Video Upload" description="Resumable large-video uploads to Facebook Pages; Reels use a separate workflow"/>{selected&&<PageNavigation accountId={selected.id} active="video-/-reels"/>}<VideoUploader key={selected?.id} pages={pages} selected={selected?.id}/></AppShell>}
