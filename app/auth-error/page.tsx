import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function AuthErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertTriangle size={28} />
        </div>

        <h1 className="mt-5 text-2xl font-bold text-slate-900">
          Login problem
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          There was a problem signing you in. Please try again.
        </p>

        <Link
          href="/login"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Back to Login
        </Link>
      </div>
    </main>
  );
}