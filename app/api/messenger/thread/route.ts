import { NextRequest,NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hasOrgPermission } from "@/lib/permissions";
import { decryptToken,graphGet } from "@/lib/meta-connection";
import { notifyWorkspaceUser } from "@/lib/notifications";
const fail=(error:string,status=400)=>NextResponse.json({error},{status});
async function access(permission:string){
 const session=await auth();const org=session?.user?.organizationId,user=session?.user?.id;
 if(!org||!user||!await hasOrgPermission(user,org,permission))return null;
 return {org,user};
}
export async function GET(request:NextRequest){
 const login=await access("facebook.messages.view");if(!login)return fail("Forbidden",403);
 const accountId=request.nextUrl.searchParams.get("accountId")||"",conversationId=request.nextUrl.searchParams.get("conversationId")||"";
 if(!accountId||!conversationId)return fail("Missing conversation",400);
 const account=await prisma.socialAccount.findFirst({where:{id:accountId,organizationId:login.org,platform:"FACEBOOK"},select:{id:true}});
 if(!account)return fail("Page not found",404);
 const thread=await prisma.messengerThread.findUnique({where:{organizationId_socialAccountId_conversationId:{organizationId:login.org,socialAccountId:accountId,conversationId}},include:{notes:{include:{author:{select:{name:true}}},orderBy:{createdAt:"desc"},take:30}}});
 const colleagues=await prisma.membership.findMany({where:{organizationId:login.org,user:{status:"ACTIVE"}},select:{user:{select:{id:true,name:true,email:true}}}});
 return NextResponse.json({thread:thread?{assignedToId:thread.assignedToId,leadStatus:thread.leadStatus,state:thread.state,labels:thread.labels,notes:thread.notes.map(n=>({id:n.id,text:n.text,createdAt:n.createdAt,author:n.author.name||"Team member"}))}:null,assignees:colleagues.map(m=>m.user)});
}
export async function POST(request:NextRequest){
 const login=await access("facebook.messages.reply");if(!login)return fail("Forbidden",403);
 const body=await request.json().catch(()=>null);
 const accountId=typeof body?.accountId==="string"?body.accountId:"",conversationId=typeof body?.conversationId==="string"?body.conversationId:"";
 if(!accountId||!/^[a-zA-Z0-9_]+$/.test(conversationId))return fail("Invalid conversation",400);
 const account=await prisma.socialAccount.findFirst({where:{id:accountId,organizationId:login.org,platform:"FACEBOOK",status:"CONNECTED"}});
 if(!account?.accessTokenCiphertext)return fail("Page not connected",404);
 // Verify that this thread genuinely belongs to the selected connected Page.
 try{
  const linked=await graphGet<{participants?:{data?:Array<{id?:string}>}}>("/"+conversationId,decryptToken(account.accessTokenCiphertext),{fields:"participants"});
  if(!linked.participants?.data?.some(p=>p.id===account.externalAccountId))return fail("Conversation does not belong to this Page",403);
 }catch{return fail("Could not verify conversation with Meta",422);}
 const leadStatus=body?.leadStatus;const state=body?.state;
 const assignedToId=body?.assignedToId===null?null:typeof body?.assignedToId==="string"?body.assignedToId:undefined;
 const labels=body?.labels;
 const note=typeof body?.note==="string"?body.note.trim():undefined;
 if(leadStatus!==undefined&&!["NEW","QUALIFIED","FOLLOWUP","WON","LOST"].includes(leadStatus))return fail("Invalid lead status");
 if(state!==undefined&&!["OPEN","DONE"].includes(state))return fail("Invalid inbox status");
 if(labels!==undefined&&(!Array.isArray(labels)||labels.length>10||labels.some((x:unknown)=>typeof x!=="string"||x.length>24)))return fail("Invalid labels");
 if(note!==undefined&&(note.length<1||note.length>4000))return fail("Notes must contain 1 to 4000 characters");
 if(assignedToId){
  const member=await prisma.membership.findUnique({where:{organizationId_userId:{organizationId:login.org,userId:assignedToId}},include:{user:{select:{status:true}}}});
  if(!member||member.user.status!=="ACTIVE")return fail("Assignee is not an active workspace member",400);
 }
 const thread=await prisma.messengerThread.upsert({where:{organizationId_socialAccountId_conversationId:{organizationId:login.org,socialAccountId:accountId,conversationId}},create:{organizationId:login.org,socialAccountId:accountId,conversationId,assignedToId:assignedToId??null,leadStatus:leadStatus||"NEW",state:state||"OPEN",labels:labels||[]},update:{...(assignedToId!==undefined?{assignedToId}:{}),...(leadStatus!==undefined?{leadStatus}:{}),...(state!==undefined?{state}:{}),...(labels!==undefined?{labels}:{})}});
 if(note)await prisma.messengerNote.create({data:{threadId:thread.id,authorId:login.user,text:note}});
 if(assignedToId&&assignedToId!==login.user&&body?.assignedToId!==undefined){
  await notifyWorkspaceUser({organizationId:login.org,userId:assignedToId,title:"Messenger conversation assigned",description:"A Facebook Page conversation was assigned to you.",href:"/facebook/messages?page="+encodeURIComponent(accountId)}).catch(()=>{});
 }
 await prisma.activityLog.create({data:{organizationId:login.org,actorUserId:login.user,action:"MESSENGER_THREAD_UPDATED",entityType:"MessengerThread",entityId:thread.id,details:{leadStatus:leadStatus||null,state:state||null,hasNote:Boolean(note)}}}).catch(()=>{});
 return NextResponse.json({ok:true});
}
