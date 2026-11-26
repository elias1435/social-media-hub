"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  PanelsTopLeft,
  PlaySquare,
  MessageCircle,
  Camera,
  Megaphone,
  CalendarDays,
  MessagesSquare,
  Inbox,
  BarChart3,
  Users,
  ShieldCheck,
  Link2,
  Settings,
  Headphones,
  ScrollText,
  Menu, X, ArrowLeft,
} from "lucide-react";

export const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Facebook Pages", icon: PanelsTopLeft, href: "/facebook" },
  { label: "Instagram Accounts", icon: Camera, href: "/instagram" },
  { label: "YouTube Channels", icon: PlaySquare, href: "/youtube" },
  { label: "WhatsApp Numbers", icon: MessageCircle, href: "/whatsapp" },
  { label: "Ads Manager", icon: Megaphone, href: "/ads-manager" },
  { label: "Post / Video", icon: CalendarDays, href: "/post-video" },
  { label: "Content Planner", icon: CalendarDays, href: "/content-planner" },
  { label: "Comments", icon: MessagesSquare, href: "/facebook/comments" },
  { label: "Messages / Inbox", icon: Inbox, href: "/facebook/messages" },
  { label: "Analytics / Reports", icon: BarChart3, href: "/analytics" },
];

const bottomItems = [
  { label: "Team / Users", icon: Users, href: "/team" },
  { label: "Roles & Permissions", icon: ShieldCheck, href: "/roles-permissions" },
  { label: "Activity Logs", icon: ScrollText, href: "/activity-logs" },
  { label: "Connected Accounts", icon: Link2, href: "/connected-accounts" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export const permissionByRoute:Record<string,string> = {"/":"dashboard.view","/facebook":"facebook.pages.view","/instagram":"social_accounts.view","/youtube":"social_accounts.view","/whatsapp":"social_accounts.view","/ads-manager":"ads.view","/post-video":"facebook.posts.create","/content-planner":"facebook.posts.view","/facebook/comments":"facebook.comments.view","/facebook/messages":"facebook.messages.view","/analytics":"analytics.view","/team":"users.manage","/roles-permissions":"roles.manage","/activity-logs":"activity_logs.view","/connected-accounts":"social_accounts.view","/settings":"settings.view"};

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar({permissions,systemAdmin}:{permissions:string[];systemAdmin:boolean}) {
  const pathname = usePathname();
  const [mobileOpen,setMobileOpen]=useState(false);
  const allowed=(href:string)=>systemAdmin||permissions.includes(permissionByRoute[href]||"__unavailable__");
  const visibleMenu=menuItems.filter(item=>allowed(item.href));
  const visibleBottom=bottomItems.filter(item=>allowed(item.href));

  return (
    <>
    <button type="button" aria-label="Open navigation" onClick={()=>setMobileOpen(true)} className="fixed bottom-5 left-5 z-50 rounded-full bg-[#102b47] p-3 text-white shadow-lg lg:hidden"><Menu size={23}/></button>
    {mobileOpen&&<button type="button" aria-label="Close menu overlay" onClick={()=>setMobileOpen(false)} className="fixed inset-0 z-40 bg-black/50 lg:hidden"/>}
    <aside className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-[#102b47] text-white transition-transform lg:translate-x-0 ${mobileOpen?"translate-x-0":"-translate-x-full"}`}>
      <div className="border-b border-white/10 px-5 py-5">
        <button type="button" onClick={()=>setMobileOpen(false)} aria-label="Close navigation" className="float-right lg:hidden"><X size={20}/></button>
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-lg font-black text-blue-600">AI</div>
          <div>
            <h1 className="text-[15px] font-semibold leading-tight">Ashik International</h1>
            <p className="mt-0.5 text-xs text-slate-300">Social Media Hub</p>
          </div>
        </Link>
        <p className="mt-4 text-xs text-slate-300">Manage • Engage • Grow</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {visibleMenu.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={()=>setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  active ? "bg-blue-600 text-white" : "text-slate-200 hover:bg-white/10"
                }`}
              >
                <Icon size={18} />
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="my-4 border-t border-white/10" />

        <div className="space-y-1">
          {visibleBottom.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  active ? "bg-blue-600 text-white" : "text-slate-200 hover:bg-white/10"
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-4">
        <div className="rounded-xl bg-white/5 p-4">
          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10"><Headphones size={18} /></div>
            <div>
              <p className="text-sm font-medium">Help & Support</p>
              <p className="mt-1 text-xs leading-4 text-slate-300">Need help?<br />Contact our support team.</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
    </>
  );
}
