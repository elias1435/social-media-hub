"use client";

import {
  Search,
  Bell,
  CircleHelp,
  ChevronDown,
  CalendarDays,
  LogOut,
} from "lucide-react";

import { signOut } from "next-auth/react";

export default function Header() {
  return (
    <header className="flex h-[72px] items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex w-full max-w-[520px] items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5">
        <Search size={18} className="text-slate-400" />

        <input
          type="text"
          placeholder="Search pages, channels, messages, campaigns..."
          className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100">
          <Bell size={20} />

          <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            12
          </span>
        </button>

        <button className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100">
          <CircleHelp size={20} />
        </button>

        <div className="h-8 w-px bg-slate-200" />

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
            A
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">Admin</p>
            <p className="text-xs text-slate-500">Super Admin</p>
          </div>

          <ChevronDown size={16} className="text-slate-500" />
        </div>

        <button className="ml-2 flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50">
          <CalendarDays size={16} />
          <span className="hidden xl:inline">
            Sep 1, 2026 - Sep 30, 2026
          </span>
        </button>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={16} />
          <span className="hidden lg:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}