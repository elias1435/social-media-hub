import { NextRequest,NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
export async function PATCH(request:NextRequest){
 const session=await auth(),org=session?.user?.organizationId;
 if(!org||!session?.user?.isSystemAdmin)return NextResponse.json({error:"Forbidden"},{status:403});
 const data=await request.json().catch(()=>null);
 const timezone=typeof data?.timezone==="string"?data.timezone:"";
 const defaultPublishMode=typeof data?.defaultPublishMode==="string"?data.defaultPublishMode:"now";
 const validTimezones=Intl.supportedValuesOf("timeZone");
 if(!validTimezones.includes(timezone)||!["now","schedule"].includes(defaultPublishMode))return NextResponse.json({error:"Invalid timezone or publishing default"},{status:400});
 for(const name of ["notifyInApp","notifyEmail","autoAssignInbox","enableAutomation"])if(typeof data?.[name]!=="boolean")return NextResponse.json({error:"Invalid preference: "+name},{status:400});
 const settings=await prisma.organizationSetting.upsert({where:{organizationId:org},create:{organizationId:org,timezone,defaultPublishMode,notifyInApp:data.notifyInApp,notifyEmail:data.notifyEmail,autoAssignInbox:data.autoAssignInbox,enableAutomation:data.enableAutomation},update:{timezone,defaultPublishMode,notifyInApp:data.notifyInApp,notifyEmail:data.notifyEmail,autoAssignInbox:data.autoAssignInbox,enableAutomation:data.enableAutomation}});
 return NextResponse.json({ok:true,settings});
}
