import { NextRequest,NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
function fail(error:string,status=400){return NextResponse.json({error},{status});}
export async function POST(request:NextRequest){
 const session=await auth();if(!session?.user?.isSystemAdmin||!session.user.organizationId)return fail("Forbidden",403);
 const body=await request.json().catch(()=>null);
 const name=typeof body?.name==="string"?body.name.trim():"";
 const description=typeof body?.description==="string"?body.description.trim():"";
 const requested=Array.isArray(body?.permissions)?body.permissions:[];
 if(!name||name.length>64||description.length>400||requested.some((p:unknown)=>typeof p!=="string")||requested.length>100)return fail("Invalid role fields.");
 const keys=[...new Set(requested as string[])];
 const permissions=await prisma.permission.findMany({where:{key:{in:keys}}});
 if(permissions.length!==keys.length)return fail("Unknown permission selected.");
 const key=name.toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_|_$/g,"").slice(0,50);
 if(!key||["super_admin","admin"].includes(key))return fail("Choose a different role name.");
 try{
  const role=await prisma.role.create({data:{organizationId:session.user.organizationId,key,name,description:description||null,permissions:{create:permissions.map(p=>({permissionId:p.id}))}}});
  return NextResponse.json({ok:true,id:role.id});
 }catch{return fail("Could not create role. The role name may already exist.",409);}
}
