import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { decryptToken } from "@/lib/meta-connection";
import {validThumbnail} from "@/lib/video-thumbnail";
import { hasOrgPermission } from "@/lib/permissions";

export const runtime = "nodejs";
const API = "https://graph-video.facebook.com/v26.0";
const CHUNK_LIMIT = 16 * 1024 * 1024;
const EXPIRES_IN_SECONDS = 4 * 60 * 60;

type MetaResult = {
  id?: string; video_id?: string; upload_session_id?: string;
  start_offset?: string; end_offset?: string; success?: boolean;
  error?: { message?: string; code?: number; error_subcode?: number };
};
type SessionData = { accountId: string; organizationId: string; userId: string; uploadId: string; videoId: string; total: number; exp: number };
const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

function sessionSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) throw new Error("AUTH_SECRET must be configured");
  return secret;
}
function sign(value: string) { return createHmac("sha256", sessionSecret()).update(value).digest("base64url"); }
function seal(value: SessionData) {
  const body = Buffer.from(JSON.stringify(value)).toString("base64url");
  return body + "." + sign(body);
}
function unseal(token: string): SessionData | null {
  const parts=token.split(".");
  if(parts.length!==2) return null;
  const expected=Buffer.from(sign(parts[0]));
  const received=Buffer.from(parts[1]);
  if(expected.length!==received.length || !timingSafeEqual(expected,received))return null;
  try {
    const value=JSON.parse(Buffer.from(parts[0],"base64url").toString("utf8")) as SessionData;
    if(!value.exp || value.exp<Date.now()/1000 || !/^\d+$/.test(value.uploadId) || !/^\d+$/.test(value.videoId))return null;
    return value;
  }catch{return null;}
}
async function metaPost(pageId:string, token:string, body:URLSearchParams | FormData):Promise<MetaResult> {
  const response=await fetch(API+"/"+encodeURIComponent(pageId)+"/videos", {
    method:"POST",
    headers:{Authorization:"Bearer "+token,...(body instanceof URLSearchParams?{"Content-Type":"application/x-www-form-urlencoded"}:{})},
    body,cache:"no-store"
  });
  const result=await response.json().catch(()=>({})) as MetaResult;
  if(!response.ok || result.error){const phase=String(body.get("upload_phase")||"unknown");const code=result.error?.code;const subcode=result.error?.error_subcode;const detail=result.error?.message?.replace(/(?:https?:\/\/\S+|access_token\s*[=:]\s*\S+|Bearer\s+\S+)/gi,"[redacted]")||"Meta did not return a detailed error.";throw new Error("Meta "+phase+" failed (HTTP "+response.status+(code!==undefined?", code "+code:"")+(subcode!==undefined?", subcode "+subcode:"")+"). "+detail); }
  return result;
}
function offsets(result:MetaResult) {
  const start=Number(result.start_offset);
  const end=Number(result.end_offset);
  if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||end<start)
    throw new Error("Meta returned invalid upload offsets.");
  return {start,end};
}

export async function POST(request:NextRequest) {
  const session=await auth();
  const org=session?.user?.organizationId;
  const userId=session?.user?.id;
  if(!org||!userId)return fail("Unauthorized",401);
  if(!await hasOrgPermission(userId,org,"facebook.posts.publish"))return fail("Your role cannot publish Facebook videos.",403);

  const contentType=request.headers.get("content-type")||"";
  let payload: {action?:string;accountId?:string;fileSize?:number;description?:string;mode?:string;scheduleAt?:string;sessionToken?:string;startOffset?:number};
  let chunk:File|null=null,thumbnail:File|null=null;
  if(contentType.includes("multipart/form-data")){
    const length=Number(request.headers.get("content-length")||0);
    if(length>CHUNK_LIMIT+100000)return fail("This upload chunk exceeds the server's transfer limit.",413);
    const form=await request.formData().catch(()=>null);
    if(!form)return fail("Invalid upload chunk.");
    payload={action:String(form.get("action")||""),accountId:String(form.get("accountId")||""),sessionToken:String(form.get("sessionToken")||""),startOffset:Number(form.get("startOffset")),description:String(form.get("description")||""),mode:String(form.get("mode")||""),scheduleAt:String(form.get("scheduleAt")||"")};
    const entry=form.get("chunk");
    chunk=entry instanceof File?entry:null;
    const cover=form.get("thumbnail");if(cover!==null){if(!(cover instanceof File)||payload.action!=="finish"||!await validThumbnail(cover))return fail("Invalid thumbnail. Choose a JPG or PNG up to 8 MB.");thumbnail=cover;}
  } else if(contentType.includes("application/json")){
    payload=await request.json().catch(()=>({}));
  } else return fail("Unsupported request format.",415);

  const action=payload.action;
  const accountId=payload.accountId||"";
  if(!["start","transfer","finish"].includes(action||"")||!accountId)return fail("Invalid upload action.");
  const account=await prisma.socialAccount.findFirst({where:{id:accountId,organizationId:org,platform:"FACEBOOK",status:"CONNECTED"}});
  if(!account?.accessTokenCiphertext)return fail("Facebook Page is not connected.",404);
  const pageToken=decryptToken(account.accessTokenCiphertext);

  try {
    if(action==="start"){
      const size=Number(payload.fileSize);
      if(!Number.isSafeInteger(size)||size<=0)return fail("Invalid video size.");
      // No product-level 20 MB restriction: Meta will enforce platform limits.
      const result=await metaPost(account.externalAccountId,pageToken,
        new URLSearchParams({upload_phase:"start",file_size:String(size)}));
      if(!result.upload_session_id||!result.video_id)throw new Error("Meta did not create an upload session.");
      const position=offsets(result);
      const value:SessionData={accountId,organizationId:org,userId,uploadId:result.upload_session_id,videoId:result.video_id,total:size,exp:Math.floor(Date.now()/1000)+EXPIRES_IN_SECONDS};
      return NextResponse.json({ok:true,sessionToken:seal(value),videoId:value.videoId,...position,chunkLimit:CHUNK_LIMIT});
    }

    const value=typeof payload.sessionToken==="string"?unseal(payload.sessionToken):null;
    if(!value||value.accountId!==accountId||value.organizationId!==org||value.userId!==userId)
      return fail("Upload session is invalid or expired. Start again.",403);

    if(action==="transfer"){
      const start=Number(payload.startOffset);
      if(!chunk||!chunk.size||chunk.size>CHUNK_LIMIT||!Number.isSafeInteger(start)||start<0||start+chunk.size>value.total)
        return fail("Invalid chunk or offset.");
      const body=new FormData();
      body.set("upload_phase","transfer");
      body.set("upload_session_id",value.uploadId);
      body.set("start_offset",String(start));
      body.set("video_file_chunk",chunk,"video-part.bin");
      const result=await metaPost(account.externalAccountId,pageToken,body);
      return NextResponse.json({ok:true,...offsets(result)});
    }

    const description=typeof payload.description==="string"?payload.description.trim():"";
    if(description.length>5000)return fail("Description is too long.");
    const mode=payload.mode==="schedule"?"schedule":"now";
    if(payload.mode && !["now","schedule"].includes(payload.mode))return fail("Invalid video publishing mode.");
    let scheduledAt:string|null=null;
    const params=new URLSearchParams({upload_phase:"finish",upload_session_id:value.uploadId,description,published:mode==="schedule"?"false":"true"});
    if(mode==="schedule"){
      const when=new Date(typeof payload.scheduleAt==="string"?payload.scheduleAt:"");
      const unix=Math.floor(when.getTime()/1000);
      const now=Math.floor(Date.now()/1000);
      if(!Number.isFinite(unix)||unix<now+11*60||unix>now+29*86400)return fail("Choose a scheduled time between 11 minutes and 29 days from now.");
      params.set("scheduled_publish_time",String(unix));
      scheduledAt=when.toISOString();
    }
    let finishBody:URLSearchParams|FormData=params;
    if(thumbnail){const form=new FormData();params.forEach((value,key)=>form.set(key,value));form.set("thumb",thumbnail,thumbnail.type==="image/png"?"thumbnail.png":"thumbnail.jpg");finishBody=form;}
    const result=await metaPost(account.externalAccountId,pageToken,finishBody);
    if(result.success!==true&&!(result.id||result.video_id))throw new Error("Meta has not confirmed video publication.");
    const thumbnailSubmitted=Boolean(thumbnail);
    await prisma.activityLog.create({data:{
      organizationId:org,actorUserId:userId,action:mode==="schedule"?"FACEBOOK_POST_SCHEDULED":"FACEBOOK_VIDEO_UPLOADED",
      entityType:"SocialAccount",entityId:account.id,
      details:{videoId:value.videoId,fileSize:value.total,uploadMethod:"CHUNKED",mediaType:"video",mode,scheduledAt,thumbnailSubmitted}
    }}).catch(error=>console.error("Video activity log failure",error));
    return NextResponse.json({ok:true,videoId:value.videoId,scheduled:mode==="schedule",thumbnailSubmitted,thumbnailWarning:thumbnailSubmitted?"Custom thumbnail submitted with the video. Verify the cover after Meta finishes processing.":undefined,note:mode==="schedule"?"Meta accepted the scheduled video. Processing may still be underway.":"Meta accepted the video. Processing and publishing may still be underway."});
  }catch(error){
    const message=error instanceof Error?error.message:"Meta video upload failed.";
    console.error("Facebook video upload step failed:",message);
    return fail(message,422);
  }
}
