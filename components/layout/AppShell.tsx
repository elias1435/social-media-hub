import type { ReactNode } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Sidebar />
      <div className="min-h-screen lg:pl-[260px]">
        <Header />
        <main className="p-4 sm:p-6">{children}</main>
        <footer className="flex flex-wrap justify-center gap-x-5 gap-y-2 px-4 pb-6 text-xs text-slate-500"><Link href="/privacy-policy" className="hover:text-blue-600">Privacy Policy</Link><Link href="/terms-of-service" className="hover:text-blue-600">Terms of Service</Link><Link href="/data-deletion" className="hover:text-blue-600">Data Deletion</Link></footer>
      </div>
    </div>
  );
}
