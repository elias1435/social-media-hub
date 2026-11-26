import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import RolesManager from "@/components/users/RolesManager";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
export const dynamic="force-dynamic";
export default async function Roles(){
 const session=await auth();
 if(!session?.user?.isSystemAdmin||!session.user.organizationId)return <AppShell><PageHeader title="Roles & Permissions" description="Access restricted"/><div className="rounded-xl border border-amber-200 bg-white p-6 text-sm text-amber-900">Only system administrators can manage organization roles.</div></AppShell>;
 const [roles,permissions]=await Promise.all([
  prisma.role.findMany({where:{organizationId:session.user.organizationId},include:{permissions:{select:{permission:{select:{key:true}}}}},orderBy:{name:"asc"}}),
  prisma.permission.findMany({orderBy:{name:"asc"},select:{id:true,key:true,name:true}})
 ]);
 return <AppShell><PageHeader title="Roles & Permissions" description="Manage real organization roles and feature visibility. Changes apply when users refresh their session."/>
 <RolesManager roles={roles.map(r=>({id:r.id,key:r.key,name:r.name,description:r.description||"",permissions:r.permissions.map(p=>p.permission.key)}))} permissions={permissions}/></AppShell>;
}
