import { hasOrgPermission } from "@/lib/permissions";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { decryptToken, graphGet } from "@/lib/meta-connection";

export async function POST(request: NextRequest) {
 const session=await auth(); const organizationId=session?.user?.organizationId;
 if(!organizationId) return NextResponse.json({error:"Unauthorized"},{status:401});
 if(!await hasOrgPermission(session.user.id,organizationId,"facebook.messages.reply"))return NextResponse.json({error:"Forbidden"},{status:403});
 const body=await request.json().catch(()=>null);
 const accountId=typeof body?.accountId==="string"?body.accountId:"";
 const conversationId=typeof body?.conversationId==="string"?body.conversationId:"";
 const recipientId=typeof body?.recipientId==="string"?body.recipientId:"";
 const message=typeof body?.message==="string"?body.message.trim():"";
 if(!accountId||!/^[a-zA-Z0-9_]+$/.test(conversationId)||!/^[0-9]+$/.test(recipientId)||!message||message.length>2000)return NextResponse.json({error:"Invalid Messenger request"},{status:400});
 const account=await prisma.socialAccount.findFirst({where:{id:accountId,organizationId,platform:"FACEBOOK",status:"CONNECTED"}});
 if(!account?.accessTokenCiphertext)return NextResponse.json({error:"Page not connected"},{status:404});
 try {
  const token=decryptToken(account.accessTokenCiphertext);
  const thread=await graphGet<{participants?:{data?:Array<{id?:string}>}}>(
   "/"+encodeURIComponent(conversationId),token,{fields:"participants"}
  );
  const participants=thread.participants?.data||[];
  if(!participants.some(p=>p.id===account.externalAccountId)||!participants.some(p=>p.id===recipientId)){
   return NextResponse.json({error:"Recipient is not part of this Page conversation."},{status:403});
  }
  const sendBody=new URLSearchParams({
   recipient:JSON.stringify({id:recipientId}),
   message:JSON.stringify({text:message}),
   messaging_type:"RESPONSE",
  });
  const response=await fetch("https://graph.facebook.com/v26.0/"+encodeURIComponent(account.externalAccountId)+"/messages",{
   method:"POST",headers:{"Authorization":"Bearer "+token,"Content-Type":"application/x-www-form-urlencoded"},
   body:sendBody,cache:"no-store"
  });
  const data=await response.json().catch(()=>({}));
  if(!response.ok||!data.message_id){
    const metaError=data.error||{};
    const msg=typeof metaError.message==="string"?metaError.message:"Messenger rejected this reply. Check permissions and the permitted messaging window.";
    const reviewRequired=/cannot message users who are not admins|developers or testers|permission is reviewed|app is live/i.test(msg);
    const windowExpired=/24.hour|messaging window|outside the allowed|outside.*window/i.test(msg);
    const code=reviewRequired?"META_APP_REVIEW_REQUIRED":windowExpired?"META_MESSAGING_WINDOW":metaError.code===10||metaError.code===200?"META_PERMISSION_DENIED":"META_SEND_REJECTED";
    return NextResponse.json({error:msg,code,metaCode:metaError.code??null},{status:422});
  }
  await prisma.activityLog.create({data:{organizationId,actorUserId:session.user.id,action:"FACEBOOK_MESSENGER_REPLIED",entityType:"SocialAccount",entityId:account.id,details:{conversationId,messageId:data.message_id}}}).catch(()=>{});
  return NextResponse.json({ok:true,messageId:data.message_id});
 }catch(e){
  return NextResponse.json({error:e instanceof Error?e.message:"Messenger request failed"},{status:502});
 }
}
