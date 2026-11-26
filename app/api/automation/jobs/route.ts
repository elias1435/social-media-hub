import {NextRequest,NextResponse} from "next/server";
import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";
import {hasOrgPermission} from "@/lib/permissions";
import {decryptToken,graphGet} from "@/lib/meta-connection";
const fail=(error:string,status=400)=>NextResponse.json({error},{status});
export async function GET(){
 const session=await auth(),org=session?.user?.organizationId;
 if(!org||!session.user?.id)return fail("Unauthorized",401);
 const jobs=await prisma.automationJob.findMany({where:{organizationId:org},orderBy:{createdAt:"desc"},take:100,select:{id:true,kind:true,status:true,scheduledAt:true,completedAt:true,attempts:true,lastError:true,createdAt:true}});
 return NextResponse.json({jobs});
}
export async function POST(request:NextRequest){
 const session=await auth(),org=session?.user?.organizationId,user=session?.user?.id;
 if(!org||!user||!await hasOrgPermission(user,org,"facebook.posts.publish"))return fail("Forbidden",403);
 const setting=await prisma.organizationSetting.findUnique({where:{organizationId:org}});
 if(setting?.enableAutomation!==true)return fail("Enable Automation in Settings first.",403);
 const body=await request.json().catch(()=>null);
 const pageId=typeof body?.pageId==="string"?body.pageId:"";
 const igId=typeof body?.igId==="string"?body.igId:"";
 const caption=typeof body?.caption==="string"?body.caption.trim():"";
 const imageUrl=typeof body?.imageUrl==="string"?body.imageUrl.trim():"";
 const date=new Date(typeof body?.scheduleAt==="string"?body.scheduleAt:"");
 const delta=date.getTime()-Date.now();
 if(!Number.isFinite(delta)||delta<5*60000||delta>29*86400000)return fail("Choose a time from five minutes to 29 days ahead.");
 if(!pageId||!/^[0-9]+$/.test(igId)||caption.length>2200)return fail("Invalid Instagram account or caption.");
 let url:URL;try{url=new URL(imageUrl);if(url.protocol!=="https:"||url.username||url.password||imageUrl.length>2000)throw Error();}catch{return fail("A public HTTPS image URL is required.");}
 const page=await prisma.socialAccount.findFirst({where:{id:pageId,organizationId:org,platform:"FACEBOOK",status:"CONNECTED"}});
 if(!page?.accessTokenCiphertext)return fail("Page is not connected.",404);
 try{
  const token=decryptToken(page.accessTokenCiphertext);
  const linked=await graphGet<{instagram_business_account?:{id:string}}>("/"+page.externalAccountId,token,{fields:"instagram_business_account"});
  if(linked.instagram_business_account?.id!==igId)return fail("Instagram account is not linked to this Page.",403);
 }catch(e){return fail(e instanceof Error?e.message:"Could not verify Instagram connection.",422);}
 const job=await prisma.automationJob.create({data:{organizationId:org,kind:"INSTAGRAM_PHOTO",payload:{pageId,igId,caption,imageUrl,actorUserId:user},scheduledAt:date}});
 await prisma.activityLog.create({data:{organizationId:org,actorUserId:user,action:"INSTAGRAM_PHOTO_SCHEDULED",entityType:"AutomationJob",entityId:job.id,details:{scheduledAt:date.toISOString()}}}).catch(()=>{});
 return NextResponse.json({ok:true,id:job.id,status:job.status});
}
