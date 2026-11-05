import { hasOrgPermission } from "@/lib/permissions";
import { NextRequest,NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { decryptToken } from "@/lib/meta-connection";
export async function POST(request:NextRequest){
 const session=await auth();const org=session?.user?.organizationId;
 if(!org)return NextResponse.json({error:"Unauthorized"},{status:401});
 if(!await hasOrgPermission(session.user.id,org,"facebook.comments.reply"))return NextResponse.json({error:"Forbidden"},{status:403});
 const body=await request.json().catch(()=>null);
 const id=typeof body?.accountId==="string"?body.accountId:"";
 const commentId=typeof body?.commentId==="string"?body.commentId:"";
 const hide=body?.hide;
 if(!id||!/^\d+(?:_\d+)?$/.test(commentId)||typeof hide!=="boolean")return NextResponse.json({error:"Invalid moderation request"},{status:400});
 const account=await prisma.socialAccount.findFirst({where:{id,organizationId:org,platform:"FACEBOOK",status:"CONNECTED"}});
 if(!account?.accessTokenCiphertext)return NextResponse.json({error:"Page not connected"},{status:404});
 try{
  const token=decryptToken(account.accessTokenCiphertext);
  const response=await fetch("https://graph.facebook.com/v26.0/"+encodeURIComponent(commentId),{method:"POST",headers:{Authorization:"Bearer "+token,"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({is_hidden:String(hide)}),cache:"no-store"});
  const result=await response.json();
  if(!response.ok||result.success!==true)return NextResponse.json({error:result.error?.message||"Meta refused moderation request. Check pages_manage_engagement."},{status:422});
  await prisma.activityLog.create({data:{organizationId:org,actorUserId:session.user.id,action:hide?"FACEBOOK_COMMENT_HIDDEN":"FACEBOOK_COMMENT_UNHIDDEN",entityType:"SocialAccount",entityId:account.id,details:{commentId}}}).catch(()=>{});
  return NextResponse.json({ok:true});
 }catch{return NextResponse.json({error:"Could not moderate comment"},{status:502});}
}
