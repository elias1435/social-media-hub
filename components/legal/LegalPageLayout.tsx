import Link from "next/link";
import type { ReactNode } from "react";

export const legalLinks = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-of-service", label: "Terms of Service" },
  { href: "/data-deletion", label: "Data Deletion Instructions" },
];

export const contactEmail = "zahidulislamashik@gmail.com";

export default function LegalPageLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-700 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link href="/login" className="flex items-center gap-3 text-sm font-semibold text-slate-900">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">AI</span>
            <span>Ashik International <span className="block text-xs font-normal text-slate-500">Social Media Hub</span></span>
          </Link>
          <Link href="/login" className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50">
            Sign in
          </Link>
        </header>
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
          <div className="mt-6 space-y-5 text-sm leading-7 [&_a]:font-medium [&_a]:text-blue-700 [&_a:hover]:underline [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-slate-900 [&_li]:mb-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mt-2 [&_ul]:list-disc [&_ul]:pl-6">
            {children}
          </div>
        </article>
        <footer className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-500">
          {legalLinks.map(link => <Link key={link.href} href={link.href} className="hover:text-blue-700 hover:underline">{link.label}</Link>)}
          <span>© {new Date().getFullYear()} Ashik International</span>
        </footer>
      </div>
    </main>
  );
}
