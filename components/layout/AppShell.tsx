import type { ReactNode } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/layout/Sidebar";

export default async function AppShell({ children }: { children: ReactNode }) {
  const session = await auth();
  const user = session?.user;
  const org = user?.organizationId;
  const [rolePermissions, activity] = org && user ? await Promise.all([
    prisma.rolePermission.findMany({where:{role:{memberships:{some:{organizationId:org,userId:user.id}}}},select:{permission:{select:{key:true}}}}),
    prisma.activityLog.findMany({where:{organizationId:org},orderBy:{createdAt:"desc"},take:8,select:{id:true,action:true,createdAt:true}}),
  ]) : [[], []];
  const permissions = rolePermissions.map(p=>p.permission.key);
  if(user?.isSystemAdmin) permissions.push("users.manage","roles.manage");
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Sidebar permissions={permissions} systemAdmin={Boolean(user?.isSystemAdmin)} />
      <div className="min-h-screen lg:pl-[260px]">
        <Header permissions={permissions} userName={user?.name || "User"} roleName={user?.roleName || "Member"} activity={activity.map(a=>({id:a.id,action:a.action,createdAt:a.createdAt.toISOString()}))} />
        <main className="p-4 sm:p-6">{children}</main>
        <footer className="flex flex-wrap justify-center gap-x-5 gap-y-2 px-4 pb-6 text-xs text-slate-500"><Link href="/privacy-policy" className="hover:text-blue-600">Privacy Policy</Link><Link href="/terms-of-service" className="hover:text-blue-600">Terms of Service</Link><Link href="/data-deletion" className="hover:text-blue-600">Data Deletion</Link></footer>
      </div>
    </div>
  );
}
