import { NextRequest,NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { decryptToken } from "@/lib/meta-connection";

export const runtime="nodejs";
const MAX_SIZE=20*1024*1024;
export async function POST(request:NextRequest){
 const session=await auth();const organizationId=session?.user?.organizationId;
 if(!organizationId)return NextResponse.json({error:"Unauthorized"},{status:401});
 const length=Number(request.headers.get("content-length")||0);
 if(length>MAX_SIZE+100000)return NextResponse.json({error:"Video upload exceeds the 20 MB limit"},{status:413});
 if(!(request.headers.get("content-type")||"").includes("multipart/form-data"))return NextResponse.json({error:"Expected multipart form data"},{status:415});
 const form=await request.formData().catch(()=>null);
 if(!form)return NextResponse.json({error:"Invalid upload"},{status:400});
 const pageId=form.get("pageId"),description=form.get("description"),video=form.get("video");
 if(typeof pageId!=="string"||typeof description!=="string"||description.length>5000||!(video instanceof File)||video.size===0||video.size>MAX_SIZE||!["video/mp4","video/quicktime"].includes(video.type)){
  return NextResponse.json({error:"Choose an MP4 or MOV video up to 20 MB and a connected Page"},{status:400});
 }
 const page=await prisma.socialAccount.findFirst({where:{id:pageId,organizationId,platform:"FACEBOOK",status:"CONNECTED"}});
 if(!page?.accessTokenCiphertext)return NextResponse.json({error:"Page not connected"},{status:404});
 try{
  const payload=new FormData();
  payload.set("source",video,video.name||"video.mp4");payload.set("description",description);
  payload.set("published","true");
  const response=await fetch("https://graph-video.facebook.com/v26.0/"+encodeURIComponent(page.externalAccountId)+"/videos",{method:"POST",headers:{Authorization:"Bearer "+decryptToken(page.accessTokenCiphertext)},body:payload,cache:"no-store"});
  const data=await response.json().catch(()=>({}));
  if(!response.ok||!data.id)return NextResponse.json({error:data.error?.message||"Meta rejected video upload. Check pages_manage_posts and video limits."},{status:422});
  await prisma.activityLog.create({data:{organizationId,actorUserId:session.user.id,action:"FACEBOOK_VIDEO_UPLOADED",entityType:"SocialAccount",entityId:page.id,details:{videoId:data.id,fileSize:video.size}}}).catch(()=>{});
  return NextResponse.json({ok:true,videoId:data.id,note:"Meta accepted the upload. Facebook may still be processing the video."});
 }catch(e){
  console.error("FACEBOOK_VIDEO_UPLOAD_ERROR",e instanceof Error?e.message:"Unknown");
  return NextResponse.json({error:"Upload could not complete. Retry with a smaller file."},{status:502});
 }
}
