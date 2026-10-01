import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import AdsManager from "@/components/dashboard/AdsManager";
export default function Ads(){return <AppShell><PageHeader title="Meta Ads Manager" description="Campaigns, ad sets, ads and reporting in one workspace." action={<Link href="/ads-manager/create" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">+ Create Campaign</Link>}/><AdsManager/></AppShell>}
