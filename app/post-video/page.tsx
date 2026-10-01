import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
const items=[["Create Facebook Post","Write text, upload media and publish or schedule.","/facebook/create-post"],["Upload Facebook Video / Reel","Upload video content to a selected Facebook Page.","/facebook/upload-video"],["Upload YouTube Video","Upload, schedule and configure YouTube content.","/youtube/upload"],["Content Planner","Review all scheduled content in the calendar.","/content-planner"]];
export default function PostVideo(){return <AppShell><PageHeader title="Post / Video" description="Choose what you want to create or schedule."/><div className="grid gap-4 md:grid-cols-2">{items.map(i=><Panel key={i[0]} className="p-6"><h3 className="font-semibold text-slate-900">{i[0]}</h3><p className="mt-2 text-sm text-slate-500">{i[1]}</p><Link href={i[2]} className="mt-5 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Open</Link></Panel>)}</div></AppShell>}
