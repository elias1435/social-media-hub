import { NextRequest,NextResponse } from "next/server";
import { createHash,randomBytes } from "node:crypto";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendWorkspaceEmail } from "@/lib/mail";
const error=(message:string,status=400)=>NextResponse.json({error:message},{status});
export async function POST(request:NextRequest){
 const session=await auth();
 if(!session?.user?.isSystemAdmin||!session.user.organizationId)return error("Forbidden",403);
 const data=await request.json().catch(()=>null);
 const name=typeof data?.name==="string"?data.name.trim():"";
 const email=typeof data?.email==="string"?data.email.trim().toLowerCase():"";
 const roleId=typeof data?.roleId==="string"?data.roleId:"";
 if(!name||name.length>120||!/^\S+@\S+\.\S+$/.test(email)||!roleId)return error("Provide a valid name, email, and role.");
 const org=session.user.organizationId;
 const [role,existing]=await Promise.all([
  prisma.role.findFirst({where:{id:roleId,organizationId:org}}),
  prisma.user.findUnique({where:{email}})
 ]);
 if(!role)return error("Role not found in your organization.",404);
 if(existing)return error("This email already belongs to an existing workspace account.",409);
 const token=randomBytes(32).toString("base64url");
 const tokenHash=createHash("sha256").update(token).digest("hex");
 const invitation=await prisma.userInvitation.create({data:{
  name,email,roleId,organizationId:org,invitedById:session.user.id,tokenHash,
  expiresAt:new Date(Date.now()+7*86400000)
 }});
 const origin=process.env.AUTH_URL||"https://social.ashikinternational.com";
 const url=new URL("/accept-invite",origin);url.searchParams.set("token",token);
 try{
  await sendWorkspaceEmail(email,"Your Social Media Hub invitation",
   `<p>You have been invited to Ashik International Social Hub.</p><p><a href="${url.toString()}">Set up your account</a></p><p>This invitation expires in seven days. If you did not expect this invitation, ignore it.</p>`);
 }catch(e){
  await prisma.userInvitation.delete({where:{id:invitation.id}}).catch(()=>{});
  return error(e instanceof Error?e.message:"Email delivery failed.",503);
 }
 await prisma.activityLog.create({data:{organizationId:org,actorUserId:session.user.id,action:"USER_INVITED",entityType:"UserInvitation",entityId:invitation.id}}).catch(()=>{});
 return NextResponse.json({ok:true,message:"Invitation sent. The recipient can set their own password."});
}
