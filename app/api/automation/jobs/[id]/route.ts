import {NextRequest,NextResponse} from "next/server";
import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";
import {hasOrgPermission} from "@/lib/permissions";
const fail=(error:string,status=400)=>NextResponse.json({error},{status});
export async function PATCH(request:NextRequest,{params}:{params:Promise<{id:string}>}){
 const session=await auth(),org=session?.user?.organizationId,user=session?.user?.id;
 if(!org||!user||!await hasOrgPermission(user,org,"facebook.posts.publish"))return fail("Forbidden",403);
 const {id}=await params,body=await request.json().catch(()=>null);
 const job=await prisma.automationJob.findFirst({where:{id,organizationId:org,kind:"INSTAGRAM_PHOTO",status:"PENDING"}});
 if(!job)return fail("The job is no longer pending.",409);
 if(body?.action==="CANCEL"){
  const result=await prisma.automationJob.updateMany({where:{id,organizationId:org,status:"PENDING"},data:{status:"CANCELLED"}});
  return result.count?NextResponse.json({ok:true}):fail("Job was already started.",409);
 }
 if(body?.action==="RESCHEDULE"){
  const date=new Date(typeof body?.scheduleAt==="string"?body.scheduleAt:"");
  const delta=date.getTime()-Date.now();
  if(!Number.isFinite(delta)||delta<5*60000||delta>29*86400000)return fail("Choose a time between five minutes and 29 days from now.");
  const result=await prisma.automationJob.updateMany({where:{id,organizationId:org,status:"PENDING"},data:{scheduledAt:date}});
  return result.count?NextResponse.json({ok:true}):fail("Job was already started.",409);
 }
 return fail("Unsupported action");
}
