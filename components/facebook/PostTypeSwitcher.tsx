"use client";
import { useState } from "react";
import { Film, FileText } from "lucide-react";
import PublishComposer from "@/components/facebook/PublishComposer";
import VideoUploader from "@/components/facebook/VideoUploader";
type Page = { id:string;name:string };
export default function PostTypeSwitcher({pages,selected}:{pages:Page[];selected?:string}) {
 const [type,setType]=useState<"post"|"video">("post");
 return <div className="mx-auto max-w-5xl">
  <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
   <h2 className="mb-3 text-base font-semibold text-slate-900">Choose content type</h2>
   <div className="grid grid-cols-2 gap-3">
    <button type="button" onClick={()=>setType("post")} aria-pressed={type==="post"} className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold ${type==="post"?"border-blue-600 bg-blue-50 text-blue-700":"border-slate-200 text-slate-700 hover:bg-slate-50"}`}><FileText size={18}/>Text / image</button>
    <button type="button" onClick={()=>setType("video")} aria-pressed={type==="video"} className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold ${type==="video"?"border-blue-600 bg-blue-50 text-blue-700":"border-slate-200 text-slate-700 hover:bg-slate-50"}`}><Film size={18}/>Video</button>
   </div>
   <p className="mt-3 text-xs text-slate-500">Both text and standard Facebook Page videos can be published now or scheduled. Image scheduling is not enabled.</p>
  </div>
  <div hidden={type!=="post"}><PublishComposer pages={pages} selected={selected}/></div>
  <div hidden={type!=="video"}><VideoUploader pages={pages} selected={selected}/></div>
 </div>;
}
