import {NextRequest,NextResponse} from "next/server";
import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";
import {hasOrgPermission} from "@/lib/permissions";
import {decryptToken,graphGet} from "@/lib/meta-connection";
const fail=(error:string,status=400)=>NextResponse.json({error},{status});
export async function DELETE(request:NextRequest){
 const session=await auth(),org=session?.user?.organizationId,user=session?.user?.id;
 if(!org||!user||!await hasOrgPermission(user,org,"facebook.posts.publish"))return fail("Forbidden",403);
 const b=await request.json().catch(()=>null);
 if(typeof b?.accountId!=="string"||typeof b?.postId!=="string"||!/^\d+(?:_\d+)?$/.test(b.postId))return fail("Invalid scheduled item.");
 const account=await prisma.socialAccount.findFirst({where:{id:b.accountId,organizationId:org,platform:"FACEBOOK",status:"CONNECTED"}});
 if(!account?.accessTokenCiphertext)return fail("Page not connected.",404);
 try{
  const token=decryptToken(account.accessTokenCiphertext);
  const list=await graphGet<{data?:Array<{id:string;scheduled_publish_time?:string|number}>}>("/"+account.externalAccountId+"/scheduled_posts",token,{fields:"id,scheduled_publish_time",limit:"100"});
  const item=list.data?.find(p=>p.id===b.postId);
  const raw=String(item?.scheduled_publish_time||"");
  const when=/^\d+$/.test(raw)?Number(raw)*1000:Date.parse(raw);
  if(!item||!Number.isFinite(when)||when<=Date.now()+60000)return fail("Item is no longer verifiably scheduled on this Page. Refresh the planner.",409);
  const res=await fetch("https://graph.facebook.com/v26.0/"+encodeURIComponent(item.id),{method:"DELETE",headers:{Authorization:"Bearer "+token},cache:"no-store",signal:AbortSignal.timeout(15000)});
  const result=await res.json().catch(()=>null);
  if(!res.ok||result?.success!==true)return fail("Meta did not confirm deletion. Refresh and check the scheduled item.",422);
  await prisma.activityLog.create({data:{organizationId:org,actorUserId:user,action:"FACEBOOK_SCHEDULED_DELETED",entityType:"SocialAccount",entityId:account.id,details:{postId:item.id}}}).catch(()=>{});
  return NextResponse.json({ok:true});
 }catch{return fail("Unable to verify or delete the scheduled item in Meta. Refresh before retrying.",502);}
}
