import { NextRequest,NextResponse } from "next/server";
import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";
export async function GET(){
 const session=await auth(),org=session?.user?.organizationId,userId=session?.user?.id;
 if(!org||!userId)return NextResponse.json({error:"Unauthorized"},{status:401});
 const notifications=await prisma.notification.findMany({where:{organizationId:org,userId},orderBy:{createdAt:"desc"},take:30,select:{id:true,title:true,description:true,href:true,readAt:true,createdAt:true}});
 return NextResponse.json({notifications});
}
export async function PATCH(request:NextRequest){
 const session=await auth(),org=session?.user?.organizationId,userId=session?.user?.id;
 if(!org||!userId)return NextResponse.json({error:"Unauthorized"},{status:401});
 const data=await request.json().catch(()=>null);
 const id=typeof data?.id==="string"?data.id:"";
 if(!id)return NextResponse.json({error:"Missing notification ID"},{status:400});
 const result=await prisma.notification.updateMany({where:{id,organizationId:org,userId,readAt:null},data:{readAt:new Date()}});
 return NextResponse.json({ok:true,changed:result.count});
}
