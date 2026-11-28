import { hasOrgPermission } from "@/lib/permissions";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await auth();
  const orgId = session?.user?.organizationId;
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!await hasOrgPermission(session.user.id,orgId,"social_accounts.manage")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  if (typeof body.id !== "string") return NextResponse.json({ error: "Missing page" }, { status: 400 });
  const result = await prisma.socialAccount.updateMany({
    where: { id: body.id, organizationId: orgId, platform: "FACEBOOK" },
    data: { status: "DISCONNECTED", accessTokenCiphertext: null, refreshTokenCiphertext: null, tokenExpiresAt: null },
  });
  if (!result.count) return NextResponse.json({ error: "Page not found" }, { status: 404 });
  await prisma.activityLog.create({ data: { organizationId: orgId, actorUserId: session.user.id, action: "META_PAGE_DISCONNECTED", entityType: "SocialAccount", entityId: body.id } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const session=await auth();
  const orgId=session?.user?.organizationId;
  if(!orgId||!session?.user?.id)return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!await hasOrgPermission(session.user.id,orgId,"social_accounts.manage"))return NextResponse.json({error:"Forbidden"},{status:403});
  const body=await request.json().catch(()=>null);
  if(typeof body?.id!=="string")return NextResponse.json({error:"Missing page"},{status:400});
  const account=await prisma.socialAccount.findFirst({where:{id:body.id,organizationId:orgId,platform:"FACEBOOK"},select:{id:true,status:true,metadata:true}});
  if(!account)return NextResponse.json({error:"Page not found"},{status:404});
  if(account.status!=="DISCONNECTED")return NextResponse.json({error:"Disconnect this Page before removing it."},{status:409});
  const metadata=account.metadata&&typeof account.metadata==="object"&&!Array.isArray(account.metadata)?account.metadata:{};
  const result=await prisma.socialAccount.updateMany({where:{id:account.id,organizationId:orgId,platform:"FACEBOOK",status:"DISCONNECTED"},data:{metadata:{...metadata,hiddenFromFacebookList:true}}});
  if(!result.count)return NextResponse.json({error:"Page connection changed. Refresh and try again."},{status:409});
  await prisma.activityLog.create({data:{organizationId:orgId,actorUserId:session.user.id,action:"META_PAGE_REMOVED_FROM_LIST",entityType:"SocialAccount",entityId:account.id}}).catch(()=>{});
  return NextResponse.json({ok:true});
}
