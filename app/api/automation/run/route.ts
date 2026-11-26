import {NextRequest,NextResponse} from "next/server";
import {timingSafeEqual} from "node:crypto";
import {prisma} from "@/lib/prisma";
import {decryptToken,graphGet} from "@/lib/meta-connection";
import {notifyWorkspaceUser} from "@/lib/notifications";
export const runtime="nodejs";
export const dynamic="force-dynamic";
function validSecret(request:NextRequest){
 const secret=process.env.CRON_SECRET;
 if(!secret||secret.length<32)return false;
 const auth=request.headers.get("authorization")||"";
 const offered=auth.startsWith("Bearer ")?auth.slice(7):"";
 const a=Buffer.from(secret),b=Buffer.from(offered);
 return a.length===b.length&&timingSafeEqual(a,b);
}
type InstagramPayload={pageId:string;igId:string;caption:string;imageUrl:string;actorUserId:string};
async function runInstagram(org:string,raw:unknown){
 const p=raw as InstagramPayload;
 if(!p||!p.pageId||!/^[0-9]+$/.test(p.igId))throw new Error("Invalid scheduled Instagram payload");
 const page=await prisma.socialAccount.findFirst({where:{id:p.pageId,organizationId:org,platform:"FACEBOOK",status:"CONNECTED"}});
 if(!page?.accessTokenCiphertext)throw new Error("Connected Facebook Page unavailable");
 const token=decryptToken(page.accessTokenCiphertext);
 const linked=await graphGet<{instagram_business_account?:{id:string}}>("/"+page.externalAccountId,token,{fields:"instagram_business_account"});
 if(linked.instagram_business_account?.id!==p.igId)throw new Error("Instagram link revoked");
 const endpoint="https://graph.facebook.com/v26.0/"+encodeURIComponent(p.igId);
 const containerRes=await fetch(endpoint+"/media",{method:"POST",headers:{"Authorization":"Bearer "+token,"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({image_url:p.imageUrl,caption:p.caption}),cache:"no-store"});
 const container=await containerRes.json().catch(()=>({}));
 if(!containerRes.ok||!container.id)throw new Error(container.error?.message||"Instagram container creation failed");
 const publishRes=await fetch(endpoint+"/media_publish",{method:"POST",headers:{"Authorization":"Bearer "+token,"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({creation_id:container.id}),cache:"no-store"});
 const result=await publishRes.json().catch(()=>({}));
 if(!publishRes.ok||!result.id)throw new Error(result.error?.message||"Instagram publication was not confirmed");
 await prisma.activityLog.create({data:{organizationId:org,actorUserId:p.actorUserId,action:"INSTAGRAM_IMAGE_PUBLISHED",entityType:"SocialAccount",entityId:page.id,details:{instagramId:p.igId,mediaId:result.id,source:"AUTOMATION"}}});
}
async function processJob(job:{id:string;kind:string;organizationId:string;payload:unknown}){
 if(job.kind==="INSTAGRAM_PHOTO"){await runInstagram(job.organizationId,job.payload);return;}
 if(job.kind==="NOTIFY"){
  const p=job.payload as {userId:string;title:string;description?:string;href?:string};
  if(!p?.userId||!p.title)throw new Error("Invalid notification job");
  await notifyWorkspaceUser({organizationId:job.organizationId,...p});return;
 }
 throw new Error("Unsupported job kind");
}
export async function POST(request:NextRequest){
 if(!validSecret(request))return NextResponse.json({error:"Unauthorized"},{status:401});
 const due=await prisma.automationJob.findMany({where:{status:"PENDING",scheduledAt:{lte:new Date()}},orderBy:{scheduledAt:"asc"},take:10,select:{id:true,organizationId:true,kind:true,payload:true}});
 let done=0,review=0;
 for(const job of due){
  const claimed=await prisma.automationJob.updateMany({where:{id:job.id,status:"PENDING"},data:{status:"RUNNING",attempts:{increment:1},lockedUntil:new Date(Date.now()+10*60000)}});
  if(!claimed.count)continue;
  try{
   await processJob(job);
   await prisma.automationJob.update({where:{id:job.id},data:{status:"COMPLETED",completedAt:new Date(),lockedUntil:null,lastError:null}});
   done++;
  }catch(e){
   // External publishing could have succeeded before an ambiguous network error.
   // Do NOT automatically retry: that could publish duplicate customer content.
   await prisma.automationJob.update({where:{id:job.id},data:{status:"NEEDS_REVIEW",lockedUntil:null,lastError:e instanceof Error?e.message:"Unconfirmed execution"}});
   review++;
  }
 }
 return NextResponse.json({processed:done,needsReview:review,checked:due.length});
}
