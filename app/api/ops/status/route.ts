import {NextResponse} from "next/server";
import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";
export const dynamic="force-dynamic";
export async function GET(){
 const session=await auth(),org=session?.user?.organizationId;
 if(!org||!session?.user?.isSystemAdmin)return NextResponse.json({error:"Forbidden"},{status:403});
 const [pending,needsReview,lastRun,connected]=await Promise.all([
  prisma.automationJob.count({where:{organizationId:org,status:"PENDING"}}),
  prisma.automationJob.count({where:{organizationId:org,status:"NEEDS_REVIEW"}}),
  prisma.automationJob.findFirst({where:{organizationId:org,status:"COMPLETED"},orderBy:{completedAt:"desc"},select:{completedAt:true,kind:true}}),
  prisma.socialAccount.count({where:{organizationId:org,status:"CONNECTED"}})
 ]);
 return NextResponse.json({connectedAccounts:connected,jobs:{pending,needsReview,lastCompletedAt:lastRun?.completedAt||null,lastCompletedKind:lastRun?.kind||null},integrations:{emailConfigured:Boolean(process.env.RESEND_API_KEY&&process.env.EMAIL_FROM),workerConfigured:Boolean(process.env.CRON_SECRET&&process.env.CRON_SECRET.length>=32),adsLiveEnabled:process.env.META_ADS_LIVE_CHANGES_ENABLED==="true"},note:"Statuses indicate configured application state, not guaranteed authorization or Meta availability."},{headers:{"Cache-Control":"no-store"}});
}
