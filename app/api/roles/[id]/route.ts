import { NextRequest,NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
function fail(error:string,status=400){return NextResponse.json({error},{status});}
export async function PATCH(request:NextRequest,{params}:{params:Promise<{id:string}>}){
 const session=await auth();if(!session?.user?.isSystemAdmin||!session.user.organizationId)return fail("Forbidden",403);
 const {id}=await params;
 const role=await prisma.role.findFirst({where:{id,organizationId:session.user.organizationId}});
 if(!role)return fail("Role not found.",404);
 if(role.key==="super_admin")return fail("Super Admin permissions are protected.",403);
 const body=await request.json().catch(()=>null);
 const requested=Array.isArray(body?.permissions)?body.permissions:null;
 if(!requested||requested.length>100||requested.some((p:unknown)=>typeof p!=="string"))return fail("Invalid permissions.");
 const keys=[...new Set(requested as string[])];
 const permissions=await prisma.permission.findMany({where:{key:{in:keys}}});
 if(permissions.length!==keys.length)return fail("Unknown permission selected.");
 const name=typeof body?.name==="string"?body.name.trim():role.name;
 if(!name||name.length>64)return fail("Invalid name.");
 const description=typeof body?.description==="string"?body.description.trim():role.description||"";
 if(description.length>400)return fail("Description is too long.");
 await prisma.$transaction(async tx=>{
  await tx.role.update({where:{id},data:{name,description:description||null}});
  await tx.rolePermission.deleteMany({where:{roleId:id}});
  if(permissions.length)await tx.rolePermission.createMany({data:permissions.map(p=>({roleId:id,permissionId:p.id}))});
 });
 return NextResponse.json({ok:true});
}
