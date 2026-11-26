import "server-only";
import {prisma} from "@/lib/prisma";
import {sendWorkspaceEmail} from "@/lib/mail";
export async function notifyWorkspaceUser(args:{organizationId:string;userId:string;title:string;description?:string;href?:string}){
 const settings=await prisma.organizationSetting.findUnique({where:{organizationId:args.organizationId}});
 if(settings?.notifyInApp!==false){
  await prisma.notification.create({data:{organizationId:args.organizationId,userId:args.userId,title:args.title,description:args.description,href:args.href}});
 }
 if(settings?.notifyEmail){
  const user=await prisma.user.findUnique({where:{id:args.userId},select:{email:true,status:true}});
  if(user?.email&&user.status==="ACTIVE"){
   try{
    await sendWorkspaceEmail(user.email,args.title,`<p>${args.title.replace(/[&<>"]/g,"")}</p><p>${(args.description||"").replace(/[&<>"]/g,"")}</p><p>Sign in to your Social Media Hub workspace to see details.</p>`);
   }catch(error){console.error("Workspace email notification failed",error instanceof Error?error.message:"mail error");}
  }
 }
}
