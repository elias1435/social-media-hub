import { ExternalLink, ImageIcon, Video } from "lucide-react";
export type FacebookPost = {
 id: string; message?: string; created_time?: string; permalink_url?: string;
 full_picture?: string; status_type?: string;
};
export default function PostCard({post}:{post:FacebookPost}){
 const media = post.full_picture && /^https:\/\//.test(post.full_picture) ? post.full_picture : null;
 const isVideo = post.status_type?.toLowerCase().includes("video");
 return <article className="flex flex-col gap-4 px-5 py-5 sm:flex-row">
  {media ? <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:w-44"><img src={media} alt="Post media" loading="lazy" className="h-full w-full object-cover"/>{isVideo&&<div className="absolute bottom-2 left-2 rounded bg-slate-900/80 px-2 py-1 text-xs text-white">Video</div>}</div> :
   <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400">{isVideo?<Video size={22}/>:<ImageIcon size={22}/>}</div>}
  <div className="min-w-0 flex-1"><p className="line-clamp-5 whitespace-pre-wrap text-sm leading-6 text-slate-800">{post.message || (isVideo ? "Video post" : "Facebook post (no caption)")}</p><p className="mt-2 text-xs text-slate-400">{post.created_time?new Date(post.created_time).toLocaleString():"Date unavailable"}</p>
   {post.permalink_url&&<a href={post.permalink_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600"><ExternalLink size={13}/>View post on Facebook</a>}</div>
 </article>;
}
