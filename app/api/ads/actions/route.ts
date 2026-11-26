import {NextRequest,NextResponse} from "next/server";
import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";
import {graphGet} from "@/lib/meta-connection";
const fail=(error:string,status=400)=>NextResponse.json({error},{status});
type Account={id:string;account_id?:string};type Campaign={id:string;account_id?:string};
export async function POST(request:NextRequest){
 const session=await auth();
 if(!session?.user?.isSystemAdmin||!session.user.organizationId)return fail("Ads management restricted to system administrators.",403);
 if(process.env.META_ADS_LIVE_CHANGES_ENABLED!=="true")return fail("Live Ads changes are disabled by the server administrator.",403);
 const token=process.env.META_ADS_ACCESS_TOKEN;
 if(!token)return fail("Meta Ads access is not configured.",503);
 const body=await request.json().catch(()=>null);
 const accountId=typeof body?.accountId==="string"?body.accountId:"";
 const campaignId=typeof body?.campaignId==="string"?body.campaignId:"";
 const action=body?.action;
 const requestId=typeof body?.requestId==="string"?body.requestId:"";
 if(!/^act_\d+$/.test(accountId)||!/^[0-9]+$/.test(campaignId)||!["PAUSE","ACTIVATE","DAILY_BUDGET"].includes(action)||!/^[0-9a-f-]{36}$/i.test(requestId))return fail("Invalid Ads action.");
 if(body?.confirmation!=="CONFIRM LIVE AD CHANGE")return fail("Explicit confirmation is required.");
 const allowed=(process.env.META_ADS_ALLOWED_ACCOUNT_IDS||"").split(",").map(x=>x.trim()).filter(Boolean);
 if(!allowed.includes(accountId)&&!allowed.includes(accountId.replace(/^act_/,"")))return fail("Ad account is not on the server allowlist.",403);
 const existing=await prisma.adActionRequest.findUnique({where:{id:requestId}});
 if(existing)return fail("This Ads action request has already been processed or submitted.",409);
 let campaign:Campaign;
 try{
  const accounts=await graphGet<{data?:Account[]}>("/me/adaccounts",token,{fields:"id,account_id",limit:"100"});
  if(!accounts.data?.some(a=>a.id===accountId))return fail("Token does not authorize this Ad Account.",403);
  campaign=await graphGet<Campaign>("/"+campaignId,token,{fields:"id,account_id"});
  if(!campaign.account_id||("act_"+campaign.account_id)!==accountId)return fail("Campaign does not belong to the selected ad account.",403);
 }catch(e){return fail(e instanceof Error?e.message:"Could not verify campaign ownership.",422);}
 const budget=Number(body?.dailyBudgetMinor);
 if(action==="DAILY_BUDGET"&&(!Number.isSafeInteger(budget)||budget<100||budget>10000000))return fail("Budget must be specified in currency minor units between 100 and 10,000,000.",400);
 const payload=action==="DAILY_BUDGET"?{daily_budget:String(budget)}:{status:action==="PAUSE"?"PAUSED":"ACTIVE"};
 try{
  await prisma.adActionRequest.create({data:{id:requestId,organizationId:session.user.organizationId,actorId:session.user.id,adAccountId:accountId,action,payload,status:"PROCESSING",externalId:campaignId}});
 }catch{return fail("Duplicate or invalid action request",409);}
 const form=new URLSearchParams(payload);
 try{
  const response=await fetch("https://graph.facebook.com/v26.0/"+encodeURIComponent(campaignId),{method:"POST",headers:{Authorization:"Bearer "+token,"Content-Type":"application/x-www-form-urlencoded"},body:form,cache:"no-store"});
  const result=await response.json().catch(()=>({}));
  if(!response.ok||result.error||result.success!==true)throw new Error(result.error?.message||"Meta did not confirm the change.");
  await prisma.adActionRequest.update({where:{id:requestId},data:{status:"COMPLETED",executedAt:new Date()}});
  await prisma.activityLog.create({data:{organizationId:session.user.organizationId,actorUserId:session.user.id,action:"META_ADS_LIVE_ACTION",entityType:"AdCampaign",entityId:campaignId,details:{action,accountId,requestId}}}).catch(()=>{});
  return NextResponse.json({ok:true,message:"Meta confirmed the campaign change."});
 }catch(e){
  await prisma.adActionRequest.update({where:{id:requestId},data:{status:"FAILED",error:e instanceof Error?e.message:"Unconfirmed Meta action"}}).catch(()=>{});
  return fail(e instanceof Error?e.message:"Meta did not confirm this action.",422);
 }
}
