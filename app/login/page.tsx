import Link from "next/link";
import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="hidden bg-[#0f2742] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white font-bold text-blue-600">
                AI
              </div>

              <div>
                <h1 className="text-xl font-semibold">
                  Ashik International
                </h1>
                <p className="text-sm text-slate-300">
                  Social Media Management Hub
                </p>
              </div>
            </div>

            <div className="mt-20 max-w-lg">
              <h2 className="text-4xl font-bold leading-tight">
                Manage your social media from one secure platform.
              </h2>

              <p className="mt-5 text-base leading-7 text-slate-300">
                Manage pages, messages, comments, content, users and campaigns
                from one central dashboard.
              </p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-300">
            <div className="flex items-center gap-3">
              <ShieldCheck size={18} />
              Secure team access and permissions
            </div>

            <div className="flex items-center gap-3">
              <Mail size={18} />
              Centralized messages and customer communication
            </div>

            <div className="flex items-center gap-3">
              <LockKeyhole size={18} />
              Protected account and platform access
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900">
                  Welcome Back
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Login to your Social Media Hub account.
                </p>
              </div>

              <LoginForm />

              <div className="mt-6 text-center">
                <Link
                  href="#"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <nav aria-label="Legal information" className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-slate-500"><Link href="/privacy-policy" className="hover:text-blue-700 hover:underline">Privacy Policy</Link><Link href="/terms-of-service" className="hover:text-blue-700 hover:underline">Terms of Service</Link><Link href="/data-deletion" className="hover:text-blue-700 hover:underline">Data Deletion</Link></nav>
            <p className="mt-4 text-center text-xs text-slate-400">
              © 2026 Ashik International. All rights reserved.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}