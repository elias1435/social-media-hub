import {NextRequest,NextResponse} from "next/server";
import {timingSafeEqual} from "node:crypto";
import {prisma} from "@/lib/prisma";
import {decryptToken,graphGet} from "@/lib/meta-connection";
export const runtime="nodejs";
export const dynamic="force-dynamic";
function authorized(request:NextRequest){
 const secret=process.env.CRON_SECRET;
 if(!secret||secret.length<32)return false;
 const offered=(request.headers.get("authorization")||"").replace(/^Bearer /,"");
 const a=Buffer.from(secret),b=Buffer.from(offered);
 return a.length===b.length&&timingSafeEqual(a,b);
}
export async function POST(request:NextRequest){
 if(!authorized(request))return NextResponse.json({error:"Unauthorized"},{status:401});
 const pages=await prisma.socialAccount.findMany({where:{platform:"FACEBOOK",status:"CONNECTED",accessTokenCiphertext:{not:null}},select:{organizationId:true,externalAccountId:true,accessTokenCiphertext:true},take:100});
 const date=new Date();date.setUTCHours(0,0,0,0);
 let collected=0,failed=0;
 for(const page of pages){
  try{
   const info=await graphGet<{followers_count?:number;fan_count?:number}>("/"+encodeURIComponent(page.externalAccountId),decryptToken(page.accessTokenCiphertext!),{fields:"followers_count,fan_count"});
   for(const [metric,value] of Object.entries({followers:info.followers_count,likes:info.fan_count})){
    if(typeof value!=="number"||!Number.isFinite(value))continue;
    await prisma.analyticsSnapshot.upsert({
     where:{organizationId_platform_externalId_metric_date:{organizationId:page.organizationId,platform:"FACEBOOK",externalId:page.externalAccountId,metric,date}},
     create:{organizationId:page.organizationId,platform:"FACEBOOK",externalId:page.externalAccountId,metric,value,date},
     update:{value}
    });collected++;
   }
  }catch{failed++;}
 }
 return NextResponse.json({collected,failed,accounts:pages.length});
}
