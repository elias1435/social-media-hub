import {NextRequest,NextResponse} from "next/server";
import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";
const fail=(error:string,status=400)=>NextResponse.json({error},{status});
export async function PATCH(request:NextRequest,{params}:{params:Promise<{id:string}>}){
 const session=await auth(),org=session?.user?.organizationId;
 if(!org||!session?.user?.isSystemAdmin)return fail("Forbidden",403);
 const {id}=await params,body=await request.json().catch(()=>null);
 if(!body||id===session.user.id&&body.status==="SUSPENDED")return fail("Cannot suspend your own system administrator account.");
 const member=await prisma.membership.findUnique({where:{organizationId_userId:{organizationId:org,userId:id}},include:{user:{select:{isSystemAdmin:true,status:true}}}});
 if(!member)return fail("User is not a member of this organization",404);
 const roleId=typeof body.roleId==="string"?body.roleId:member.roleId;
 const role=await prisma.role.findFirst({where:{id:roleId,organizationId:org}});
 if(!role)return fail("Invalid organization role.");
 const status=body.status;
 if(status!==undefined&&!["ACTIVE","SUSPENDED"].includes(status))return fail("Invalid user status");
 if(member.user.isSystemAdmin&&status==="SUSPENDED")return fail("A system administrator cannot be suspended through this interface.",403);
 await prisma.$transaction(async tx=>{
  await tx.membership.update({where:{organizationId_userId:{organizationId:org,userId:id}},data:{roleId}});
  if(status)await tx.user.update({where:{id},data:{status}});
  await tx.activityLog.create({data:{organizationId:org,actorUserId:session.user.id,action:"USER_ACCESS_UPDATED",entityType:"User",entityId:id,details:{roleId,status:status||undefined}}});
 });
 return NextResponse.json({ok:true});
}
