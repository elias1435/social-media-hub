import "server-only";
import { prisma } from "@/lib/prisma";

export async function hasOrgPermission(userId:string,organizationId:string,key:string):Promise<boolean>{
 if(!userId||!organizationId||!key)return false;
 const membership=await prisma.membership.findUnique({
  where:{organizationId_userId:{organizationId,userId}},
  select:{roleId:true},
 });
 if(!membership)return false;
 const match=await prisma.rolePermission.findFirst({
  where:{roleId:membership.roleId,permission:{key}},
  select:{roleId:true},
 });
 return Boolean(match);
}
