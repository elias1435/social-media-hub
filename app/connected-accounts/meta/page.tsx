import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import {
  CheckCircle2,
  Circle,
  Link2,
  Building2,
  Flag,
  BadgeDollarSign,
  ShieldCheck,
} from "lucide-react";

const steps = [
  {
    title: "Connect Meta account",
    description: "Sign in with Facebook and authorize Social Media Hub.",
    icon: Link2,
  },
  {
    title: "Choose Business Portfolio",
    description: "Select the Meta Business Portfolio you want to manage.",
    icon: Building2,
  },
  {
    title: "Choose Facebook Page",
    description: "Select one or more Facebook Pages.",
    icon: Flag,
  },
  {
    title: "Choose Ad Account",
    description: "Select the Meta Ads account you want to connect.",
    icon: BadgeDollarSign,
  },
  {
    title: "Review permissions",
    description: "Confirm permissions for posts, comments, messages and ads.",
    icon: ShieldCheck,
  },
];

export default function MetaConnectPage() {
  return (
    <AppShell>
      <PageHeader
        title="Connect Meta"
        description="Connect Facebook Pages, Messenger and Meta Ads."
      />

      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-900">
              Meta Connection Setup
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Complete these steps to connect your Meta business assets.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.title}
                  className="flex items-start gap-4 p-6"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon size={20} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {index === 0 ? (
                        <Circle size={17} className="text-blue-600" />
                      ) : (
                        <Circle size={17} className="text-slate-300" />
                      )}

                      <h3 className="font-semibold text-slate-900">
                        {step.title}
                      </h3>
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 p-6">
            <Link
              href="/connected-accounts"
              className="text-sm font-semibold text-slate-500 hover:text-slate-700"
            >
              Cancel
            </Link>

            <a
              href="/api/meta/connect"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Link2 />
              Continue with Facebook
            </a>
          </div>
        </div>
      </div>
    </AppShell>
  );
}