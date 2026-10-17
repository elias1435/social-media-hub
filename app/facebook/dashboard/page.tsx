import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import {
  BarChart3,
  Eye,
  Heart,
  MessageCircle,
  Users,
  Facebook,
} from "lucide-react";

const metrics = [
  ["Followers", "98,210", Users],
  ["Posts (30 Days)", "48", Eye],
  ["Reach", "245,320", BarChart3],
  ["Engagement", "12,450", Heart],
] as const;

const posts = [
  "খামারের জন্য জিও শিট - টেকসই সমাধান!",
  "ট্রিপল তৈরির সম্পূর্ণ প্রক্রিয়া",
  "ভালো মানের জিও মেমব্রেন কেন প্রয়োজন?",
];

export default function FacebookOverview() {
  return (
    <AppShell>
      <PageHeader
        title="Facebook Page Dashboard"
        description="Geo Market BD • Overview and recent activity"
        action={
          <div className="flex flex-wrap gap-2">
            <a
              href="/api/meta/connect"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              <Facebook size={16} />
              Connect Facebook
            </a>

            <Link
              href="/facebook/create-post"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Create Post
            </Link>

            <Link
              href="/facebook/upload-video"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Upload Video
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([label, value, Icon]) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <Icon size={20} className="text-blue-600" />

            <p className="mt-4 text-xs font-medium text-slate-500">
              {label}
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {value}
            </p>

            <p className="mt-2 text-xs font-semibold text-green-600">
              +12% vs last period
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <Panel>
          <PanelHeader
            title="Recent Posts"
            action={
              <Link
                href="/facebook/posts"
                className="text-xs font-semibold text-blue-600"
              >
                View all
              </Link>
            }
          />

          <div className="divide-y divide-slate-100">
            {posts.map((post, index) => (
              <div
                key={post}
                className="grid grid-cols-[72px_1fr_auto] gap-4 px-5 py-4"
              >
                <div className="h-14 rounded-lg bg-slate-200" />

                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {post}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Sep {17 - index}, 2026 • Published
                  </p>

                  <div className="mt-2 flex gap-4 text-xs text-slate-500">
                    <span>Reach {12 + index * 7}.4K</span>

                    <span className="flex items-center gap-1">
                      <MessageCircle size={13} />
                      {320 - index * 70}
                    </span>
                  </div>
                </div>

                <button className="text-xs font-semibold text-blue-600">
                  View
                </button>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Quick Actions" />

          <div className="grid gap-3 p-5">
            {[
              ["Connect Facebook", "/api/meta/connect"],
              ["Create Post", "/facebook/create-post"],
              ["Upload Video / Reel", "/facebook/upload-video"],
              ["Comments", "/facebook/comments"],
              ["Messages", "/facebook/messages"],
            ].map(([label, href]) =>
              href.startsWith("/api/") ? (
                <a
                  key={href}
                  href={href}
                  className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
                >
                  {label}
                </a>
              ) : (
                <Link
                  key={href}
                  href={href}
                  className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
                >
                  {label}
                </Link>
              )
            )}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}