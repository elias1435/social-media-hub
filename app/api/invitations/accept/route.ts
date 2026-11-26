import { NextRequest,NextResponse } from "next/server";
import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
const fail=(error:string,status=400)=>NextResponse.json({error},{status});
export async function POST(request:NextRequest){
 const data=await request.json().catch(()=>null);
 const token=typeof data?.token==="string"?data.token:"";
 const password=typeof data?.password==="string"?data.password:"";
 if(!/^[\w-]{32,200}$/.test(token)||password.length<12||password.length>128)return fail("Invalid or expired invitation, or password is too short.");
 const tokenHash=createHash("sha256").update(token).digest("hex");
 const invite=await prisma.userInvitation.findUnique({where:{tokenHash}});
 if(!invite||invite.acceptedAt||invite.expiresAt<Date.now())return fail("Invitation expired or already used.",410);
 const hash=await bcrypt.hash(password,12);
 try{
  await prisma.$transaction(async tx=>{
   const updated=await tx.userInvitation.updateMany({where:{id:invite.id,acceptedAt:null,expiresAt:{gt:new Date()}},data:{acceptedAt:new Date()}});
   if(updated.count!==1)throw new Error("Invitation already used.");
   if(await tx.user.findUnique({where:{email:invite.email}}))throw new Error("Account already exists.");
   await tx.user.create({data:{name:invite.name,email:invite.email,passwordHash:hash,status:"ACTIVE",
    memberships:{create:{organizationId:invite.organizationId,roleId:invite.roleId}}}});
  });
  return NextResponse.json({ok:true});
 }catch{return fail("Invitation could not be accepted. Ask your administrator for a new invitation.",409);}
}
