import AppShell from "@/components/layout/AppShell";
import StatCards from "@/components/dashboard/StatCards";
import ConnectedAccounts from "@/components/dashboard/ConnectedAccounts";
import RecentPosts from "@/components/dashboard/RecentPosts";
import UnifiedInbox from "@/components/dashboard/UnifiedInbox";
import AdsManager from "@/components/dashboard/AdsManager";
import TeamAccess from "@/components/dashboard/TeamAccess";
import ContentPlanner from "@/components/dashboard/ContentPlanner";
import AnalyticsOverview from "@/components/dashboard/AnalyticsOverview";
import ActivityLogs from "@/components/dashboard/ActivityLogs";

export default function Home() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Welcome Back, Admin!</h2>
          <p className="mt-1 text-sm text-slate-500">Here&apos;s your social media overview.</p>
        </div>

        <StatCards />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <ConnectedAccounts />
          <RecentPosts />
          <UnifiedInbox />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <AdsManager />
          <TeamAccess />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ContentPlanner />
          <AnalyticsOverview />
        </div>

        <ActivityLogs />
      </div>
    </AppShell>
  );
}
