"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PanelsTopLeft,
  PlaySquare,
  MessageCircle,
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
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Facebook Pages (8)", icon: PanelsTopLeft, href: "/facebook" },
  { label: "YouTube Channels (8)", icon: PlaySquare, href: "/youtube" },
  { label: "WhatsApp Numbers (8)", icon: MessageCircle, href: "/whatsapp" },
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

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col bg-[#102b47] text-white lg:flex">
      <div className="border-b border-white/10 px-5 py-5">
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
          {menuItems.map((item) => {
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
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="my-4 border-t border-white/10" />

        <div className="space-y-1">
          {bottomItems.map((item) => {
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
  );
}
