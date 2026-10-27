import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import FacebookConnections from "@/components/facebook/FacebookConnections";

export const dynamic = "force-dynamic";
export default async function FacebookPages({ searchParams }: { searchParams: Promise<{ meta?: string }> }) {
  const session = await auth();
  const params = await searchParams;
  const pages = session?.user?.organizationId ? await prisma.socialAccount.findMany({
    where: { organizationId: session.user.organizationId, platform: "FACEBOOK" },
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, externalAccountId: true, avatarUrl: true, status: true, updatedAt: true, metadata: true },
  }) : [];
  const safePages = pages.map(p => {
    const meta = p.metadata as { followersCount?: number | null } | null;
    return { id: p.id, name: p.name, externalAccountId: p.externalAccountId, avatarUrl: p.avatarUrl, status: p.status, updatedAt: p.updatedAt.toISOString(), followersCount: typeof meta?.followersCount === "number" ? meta.followersCount : null };
  });
  return <AppShell>
    <PageHeader title="Facebook Pages" description="Connect and manage your real Facebook Pages from one place." action={<Link href="/connected-accounts/meta" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">+ Add Page</Link>} />
    <Panel><FacebookConnections initialPages={safePages} result={params.meta || ""} /></Panel>
  </AppShell>;
}
