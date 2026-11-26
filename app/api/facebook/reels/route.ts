import {NextRequest,NextResponse} from "next/server";
import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";
import {decryptToken} from "@/lib/meta-connection";
import {hasOrgPermission} from "@/lib/permissions";
const fail=(error:string,status=400)=>NextResponse.json({error},{status});
export async function POST(request:NextRequest){
 const session=await auth(),org=session?.user?.organizationId,user=session?.user?.id;
 if(!org||!user||!await hasOrgPermission(user,org,"facebook.posts.publish"))return fail("Forbidden",403);
 const b=await request.json().catch(()=>null);
 const accountId=typeof b?.accountId==="string"?b.accountId:"";
 const description=typeof b?.description==="string"?b.description.trim():"";
 const videoUrl=typeof b?.videoUrl==="string"?b.videoUrl.trim():"";
 const mode=b?.mode==="schedule"?"schedule":"now";
 if(!accountId||description.length>5000||videoUrl.length>2000)return fail("Invalid Reel details");
 let hosted:URL;try{hosted=new URL(videoUrl);if(hosted.protocol!=="https:"||hosted.username||hosted.password||!hosted.hostname||/^(localhost|127\.|10\.|192\.168\.|169\.254\.)/.test(hosted.hostname))throw Error();}catch{return fail("Provide a public HTTPS video file URL.");}
 let scheduledAt:string|null=null;let unix:number|null=null;
 if(mode==="schedule"){
  const d=new Date(typeof b?.scheduleAt==="string"?b.scheduleAt:"");unix=Math.floor(d.getTime()/1000);
  const now=Math.floor(Date.now()/1000);
  if(!Number.isFinite(unix)||unix<now+11*60||unix>now+29*86400)return fail("Choose a Reel schedule between 11 minutes and 29 days ahead.");
  scheduledAt=d.toISOString();
 }
 const account=await prisma.socialAccount.findFirst({where:{id:accountId,organizationId:org,platform:"FACEBOOK",status:"CONNECTED"}});
 if(!account?.accessTokenCiphertext)return fail("Facebook Page not connected",404);
 const token=decryptToken(account.accessTokenCiphertext);
 const api="https://graph.facebook.com/v26.0/"+encodeURIComponent(account.externalAccountId)+"/video_reels";
 try{
  const start=await fetch(api,{method:"POST",headers:{Authorization:"Bearer "+token,"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({upload_phase:"start"}),cache:"no-store"});
  const created=await start.json().catch(()=>({}));
  if(!start.ok||!created.video_id||!created.upload_url)throw new Error(created.error?.message||"Could not create Reel upload session.");
  const uploadUrl=new URL(created.upload_url);
  if(uploadUrl.protocol!=="https:"||uploadUrl.hostname!=="rupload.facebook.com")throw new Error("Meta returned an unexpected upload host.");
  const uploaded=await fetch(uploadUrl.toString(),{method:"POST",headers:{Authorization:"OAuth "+token,file_url:videoUrl},cache:"no-store"});
  const uploadResult=await uploaded.json().catch(()=>({}));
  if(!uploaded.ok||uploadResult.success!==true)throw new Error(uploadResult.error?.message||"Meta did not confirm hosted Reel upload.");
  const body=new URLSearchParams({upload_phase:"finish",video_id:String(created.video_id),video_state:mode==="schedule"?"SCHEDULED":"PUBLISHED",description});
  if(unix)body.set("scheduled_publish_time",String(unix));
  const finish=await fetch(api,{method:"POST",headers:{Authorization:"Bearer "+token,"Content-Type":"application/x-www-form-urlencoded"},body,cache:"no-store"});
  const result=await finish.json().catch(()=>({}));
  if(!finish.ok||result.success!==true)throw new Error(result.error?.message||"Meta has not confirmed Reel publishing.");
  await prisma.activityLog.create({data:{organizationId:org,actorUserId:user,action:mode==="schedule"?"FACEBOOK_POST_SCHEDULED":"FACEBOOK_REEL_PUBLISHED",entityType:"SocialAccount",entityId:accountId,details:{videoId:String(created.video_id),mediaType:"reel",scheduledAt}}}).catch(()=>{});
  return NextResponse.json({ok:true,videoId:String(created.video_id),scheduled:mode==="schedule",note:mode==="schedule"?"Meta accepted scheduled Reel; processing and publication should be verified.":"Meta accepted Reel; processing may continue."});
 }catch(e){return fail(e instanceof Error?e.message:"Reel publishing could not be confirmed.",422);}
}
