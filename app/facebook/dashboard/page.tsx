import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
export const dynamic="force-dynamic";
export default async function FacebookDashboard(){
 const session=await auth();
 const first=session?.user?.organizationId?await prisma.socialAccount.findFirst({where:{organizationId:session.user.organizationId,platform:"FACEBOOK",status:"CONNECTED"},select:{id:true},orderBy:{updatedAt:"desc"}}):null;
 redirect(first?"/facebook/"+first.id:"/facebook");
}
