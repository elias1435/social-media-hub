import { hasOrgPermission } from "@/lib/permissions";
import { NextRequest,NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { decryptToken,graphGet } from "@/lib/meta-connection";

export async function POST(request:NextRequest){
 const session=await auth();const organizationId=session?.user?.organizationId;
 if(!organizationId)return NextResponse.json({error:"Unauthorized"},{status:401});
 if(!await hasOrgPermission(session.user.id,organizationId,"facebook.posts.publish"))return NextResponse.json({error:"Forbidden"},{status:403});
 const body=await request.json().catch(()=>null);
 const pageId=typeof body?.pageId==="string"?body.pageId:"";
 const igId=typeof body?.igId==="string"?body.igId:"";
 const caption=typeof body?.caption==="string"?body.caption.trim():"";
 const imageUrl=typeof body?.imageUrl==="string"?body.imageUrl.trim():"";
 let url:URL;
 try{url=new URL(imageUrl);if(url.protocol!=="https:"||url.username||url.password)throw new Error("Bad URL");}
 catch{return NextResponse.json({error:"Provide a publicly accessible HTTPS image URL."},{status:400});}
 if(!pageId||!/^[0-9]+$/.test(igId)||caption.length>2200)return NextResponse.json({error:"Invalid Instagram account or caption."},{status:400});
 const page=await prisma.socialAccount.findFirst({where:{id:pageId,organizationId,platform:"FACEBOOK",status:"CONNECTED"}});
 if(!page?.accessTokenCiphertext)return NextResponse.json({error:"Connected Facebook Page not found."},{status:404});
 try{
  const token=decryptToken(page.accessTokenCiphertext);
  const linked=await graphGet<{instagram_business_account?:{id:string}}>("/"+page.externalAccountId,token,{fields:"instagram_business_account"});
  if(linked.instagram_business_account?.id!==igId)return NextResponse.json({error:"Instagram account is not linked to the selected Page."},{status:403});
  const make=await fetch("https://graph.facebook.com/v26.0/"+igId+"/media",{
   method:"POST",headers:{Authorization:"Bearer "+token,"Content-Type":"application/x-www-form-urlencoded"},
   body:new URLSearchParams({image_url:imageUrl,caption}),cache:"no-store"
  });
  const container=await make.json().catch(()=>({}));
  if(!make.ok||!container.id)return NextResponse.json({error:container.error?.message||"Meta could not create an Instagram media container."},{status:422});
  const publish=await fetch("https://graph.facebook.com/v26.0/"+igId+"/media_publish",{
   method:"POST",headers:{Authorization:"Bearer "+token,"Content-Type":"application/x-www-form-urlencoded"},
   body:new URLSearchParams({creation_id:container.id}),cache:"no-store"
  });
  const result=await publish.json().catch(()=>({}));
  if(!publish.ok||!result.id)return NextResponse.json({error:result.error?.message||"Media container created but publishing was not accepted. Processing may still be underway; avoid retrying immediately."},{status:422});
  await prisma.activityLog.create({data:{organizationId,actorUserId:session.user.id,action:"INSTAGRAM_IMAGE_PUBLISHED",entityType:"SocialAccount",entityId:page.id,details:{instagramId:igId,mediaId:result.id}}}).catch(()=>{});
  return NextResponse.json({ok:true,mediaId:result.id});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Instagram publishing failed"},{status:502});}
}
