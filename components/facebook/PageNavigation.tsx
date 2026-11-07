import Link from "next/link";
import { BarChart3, CalendarDays, ScrollText, FileText, LayoutDashboard, MessageCircle, MessagesSquare, Plus, PlaySquare, Settings } from "lucide-react";
type Item = { label:string; href:string; icon:typeof LayoutDashboard; note?:string };
export default function PageNavigation({ accountId, active="overview" }: {accountId:string;active?:string}) {
 const id=encodeURIComponent(accountId);
 const items:Item[]=[
  {label:"Overview",href:"/facebook/"+id,icon:LayoutDashboard},
  {label:"All Posts",href:"/facebook/posts?page="+id,icon:FileText},
  {label:"Create Post",href:"/facebook/create-post?page="+id,icon:FileText},
  {label:"Comments",href:"/facebook/comments?page="+id,icon:MessageCircle},
  {label:"Inbox",href:"/facebook/messages?page="+id,icon:MessagesSquare,note:"Permissions"},
  {label:"Analytics",href:"/analytics?page="+id,icon:BarChart3},
  {label:"Planner",href:"/content-planner?page="+id,icon:CalendarDays},
  {label:"Activity",href:"/facebook/"+id+"/activity",icon:ScrollText},
  {label:"Video / Reels",href:"/facebook/upload-video?page="+id,icon:PlaySquare,note:"Video only"},
  {label:"Settings",href:"/facebook/"+id+"/settings",icon:Settings},
  {label:"Diagnostics",href:"/facebook/"+id+"/diagnostics",icon:Settings},
  {label:"Instagram",href:"/instagram",icon:PlaySquare},
  {label:"Ads Manager",href:"/ads-manager",icon:BarChart3},
 ];
 const current=(item:Item)=>item.href.startsWith("/facebook/upload-video")?active==="video-/-reels":item.label.toLowerCase().replaceAll(" ","-")===active || (active==="overview"&&item.label==="Overview");
 return <nav aria-label="Facebook Page tools" className="mb-6 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
  <div className="mb-3 flex items-center justify-between gap-3 px-2"><h2 className="text-sm font-bold text-slate-900">Page tools</h2><Link href="/connected-accounts/meta" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600"><Plus size={14}/>Add another Page</Link></div>
  <div className="flex flex-wrap gap-2">{items.map(item=>{const Icon=item.icon;const selected=current(item);return <Link key={item.label} href={item.href} aria-current={selected?"page":undefined} className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition ${selected?"border-blue-600 bg-blue-600 text-white":"border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"}`}><Icon size={16}/>{item.label}{item.note&&<span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${selected?"bg-blue-500 text-white":"bg-amber-50 text-amber-700"}`}>{item.note}</span>}</Link>})}</div>
 </nav>;
}
