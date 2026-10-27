import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { decryptToken, graphGet } from "@/lib/meta-connection";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import { BarChart3, ExternalLink, Users, FileText, CircleCheck, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

type Info = {
  id?: string; name?: string; about?: string; category?: string;
  followers_count?: number; fan_count?: number; link?: string;
  picture?: { data?: { url?: string } };
};
type Post = { id: string; message?: string; created_time?: string; permalink_url?: string };
type Feed = { data?: Post[] };
export default async function FacebookPageDetails({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.organizationId) redirect("/login");
  const { id } = await params;
  const account = await prisma.socialAccount.findFirst({
    where: { id, organizationId: session.user.organizationId, platform: "FACEBOOK" },
  });
  if (!account) notFound();

  let info: Info | null = null;
  let posts: Post[] = [];
  let detailsError: string | null = null;
  let postsError: string | null = null;
  if (account.status === "CONNECTED" && account.accessTokenCiphertext) {
    try {
      const token = decryptToken(account.accessTokenCiphertext);
      try {
        info = await graphGet<Info>("/" + encodeURIComponent(account.externalAccountId), token, {
          fields: "id,name,about,category,followers_count,fan_count,link,picture",
        });
      } catch {
        // A smaller field set still lets users manage Pages with restricted insights permissions.
        info = await graphGet<Info>("/" + encodeURIComponent(account.externalAccountId), token, {
          fields: "id,name,picture",
        });
        detailsError = "Some Page information is unavailable with the granted Meta permissions.";
      }
      try {
        const feed = await graphGet<Feed>("/" + encodeURIComponent(account.externalAccountId) + "/posts", token, {
          fields: "id,message,created_time,permalink_url", limit: "8",
        });
        posts = feed.data || [];
      } catch {
        postsError = "Recent posts could not be loaded. Check your Page content permissions.";
      }
    } catch {
      detailsError = "Unable to load Page details. The saved connection may need to be reauthorized.";
    }
  }

  const title = info?.name || account.name;
  const followers = info?.followers_count ?? (account.metadata as { followersCount?: number } | null)?.followersCount;
  const pageUrl = info?.link || "https://www.facebook.com/" + encodeURIComponent(account.externalAccountId);
  const picture = info?.picture?.data?.url;
  return <AppShell>
    <PageHeader title={title} description="Facebook Page overview and connection details"
      action={<div className="flex gap-2">
        <Link href="/facebook" className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold">All Pages</Link>
        <a href={pageUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"><ExternalLink size={15}/>View on Facebook</a>
      </div>}
    />
    <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-4">
        {picture ? <img src={picture} alt="" className="h-16 w-16 rounded-full object-cover" /> : <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">{title.slice(0,2).toUpperCase()}</div>}
        <div className="flex-1"><h2 className="text-xl font-bold">{title}</h2><p className="text-sm text-slate-500">{info?.category || "Facebook Page"} · Page ID: {account.externalAccountId}</p></div>
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${account.status === "CONNECTED" ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}><CircleCheck size={15}/>{account.status === "CONNECTED" ? "Connected" : "Disconnected"}</span>
      </div>
      {info?.about && <p className="mt-5 border-t border-slate-100 pt-5 text-sm leading-6 text-slate-600">{info.about}</p>}
      <p className="mt-4 text-xs text-slate-400">Last connection update: {account.updatedAt.toLocaleDateString()}</p>
    </div>
    {detailsError && <div className="mb-5 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><AlertTriangle size={18}/>{detailsError}</div>}
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-xl border border-slate-200 bg-white p-5"><Users className="text-blue-600" size={22}/><p className="mt-3 text-sm text-slate-500">Followers</p><p className="mt-1 text-2xl font-bold">{typeof followers === "number" ? followers.toLocaleString() : "Not available"}</p></div>
      <div className="rounded-xl border border-slate-200 bg-white p-5"><BarChart3 className="text-blue-600" size={22}/><p className="mt-3 text-sm text-slate-500">Page likes</p><p className="mt-1 text-2xl font-bold">{typeof info?.fan_count === "number" ? info.fan_count.toLocaleString() : "Not available"}</p></div>
      <div className="rounded-xl border border-slate-200 bg-white p-5"><FileText className="text-blue-600" size={22}/><p className="mt-3 text-sm text-slate-500">Recent posts loaded</p><p className="mt-1 text-2xl font-bold">{postsError ? "Unavailable" : posts.length}</p></div>
    </div>
    <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4"><h3 className="font-bold">Recent Page Posts</h3><p className="mt-1 text-xs text-slate-500">Real posts returned by Meta; no demo content</p></div>
      {postsError ? <p className="px-5 py-6 text-sm text-amber-700">{postsError}</p> : posts.length === 0 ? <p className="px-5 py-8 text-sm text-slate-500">No posts returned for this Page.</p> :
        <div className="divide-y divide-slate-100">{posts.map(post => <div key={post.id} className="flex items-start justify-between gap-4 px-5 py-4"><div><p className="whitespace-pre-wrap text-sm text-slate-700">{post.message || "Page post"}</p><p className="mt-2 text-xs text-slate-400">{post.created_time ? new Date(post.created_time).toLocaleString() : ""}</p></div>{post.permalink_url && <a href={post.permalink_url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-xs font-semibold text-blue-600">Open post</a>}</div>)}</div>}
    </div>
  </AppShell>;
}
