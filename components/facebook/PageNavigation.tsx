import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BarChart3, CalendarDays, ScrollText, FileText, LayoutDashboard, MessageCircle, MessagesSquare, Plus, PlaySquare, Settings } from "lucide-react";
type Item = { label:string; href:string; icon:typeof LayoutDashboard; note?:string; permission:string };
export default async function PageNavigation({ accountId, active="overview" }: {accountId:string;active?:string}) {
 const session=await auth();
 const org=session?.user?.organizationId;const userId=session?.user?.id;
 const grants=org&&userId?await prisma.rolePermission.findMany({where:{role:{memberships:{some:{organizationId:org,userId}}}},select:{permission:{select:{key:true}}}}):[];
 const permissions=new Set(grants.map(p=>p.permission.key));
 const allowed=(key:string)=>Boolean(session?.user?.isSystemAdmin)||permissions.has(key);
 const id=encodeURIComponent(accountId);
 const items:Item[]=[
  {label:"Overview",permission:"facebook.pages.view",href:"/facebook/"+id,icon:LayoutDashboard},
  {label:"All Posts",permission:"facebook.posts.view",href:"/facebook/posts?page="+id,icon:FileText},
  {label:"Create Post",permission:"facebook.posts.create",href:"/facebook/create-post?page="+id,icon:FileText},
  {label:"Comments",permission:"facebook.comments.view",href:"/facebook/comments?page="+id,icon:MessageCircle},
  {label:"Inbox",permission:"facebook.messages.view",href:"/facebook/messages?page="+id,icon:MessagesSquare},
  {label:"Analytics",permission:"analytics.view",href:"/analytics?page="+id,icon:BarChart3},
  {label:"Planner",permission:"facebook.posts.view",href:"/content-planner?page="+id,icon:CalendarDays},
  {label:"Activity",permission:"activity_logs.view",href:"/facebook/"+id+"/activity",icon:ScrollText},
  {label:"Video / Reels",permission:"facebook.posts.publish",href:"/facebook/upload-video?page="+id,icon:PlaySquare,note:"Video only"},
  {label:"Settings",permission:"social_accounts.manage",href:"/facebook/"+id+"/settings",icon:Settings},
  {label:"Diagnostics",permission:"social_accounts.view",href:"/facebook/"+id+"/diagnostics",icon:Settings},
  {label:"Instagram",permission:"social_accounts.view",href:"/instagram",icon:PlaySquare},
  {label:"Ads Manager",permission:"ads.view",href:"/ads-manager",icon:BarChart3},
 ];
 const current=(item:Item)=>item.href.startsWith("/facebook/upload-video")?active==="video-/-reels":item.label.toLowerCase().replaceAll(" ","-")===active || (active==="overview"&&item.label==="Overview");
 return <nav aria-label="Facebook Page tools" className="mb-6 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
  <div className="mb-3 flex items-center justify-between gap-3 px-2"><h2 className="text-sm font-bold text-slate-900">Page tools</h2>{allowed("social_accounts.manage")&&<Link href="/connected-accounts/meta" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600"><Plus size={14}/>Add another Page</Link>}</div>
  <div className="flex flex-wrap gap-2">{items.filter(item=>allowed(item.permission)).map(item=>{const Icon=item.icon;const selected=current(item);return <Link key={item.label} href={item.href} aria-current={selected?"page":undefined} className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition ${selected?"border-blue-600 bg-blue-600 text-white":"border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"}`}><Icon size={16}/>{item.label}{item.note&&<span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${selected?"bg-blue-500 text-white":"bg-amber-50 text-amber-700"}`}>{item.note}</span>}</Link>})}</div>
 </nav>;
}
