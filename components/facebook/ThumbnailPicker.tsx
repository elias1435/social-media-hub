"use client";
import {useEffect,useId,useRef,useState} from "react";
import {ImagePlus,X} from "lucide-react";
import {toast} from "sonner";
export default function ThumbnailPicker({file,onChange,disabled,reel=false}:{file:File|null;onChange:(file:File|null)=>void;disabled?:boolean;reel?:boolean}){
 const id=useId(),input=useRef<HTMLInputElement>(null);
 const [preview,setPreview]=useState("");
 useEffect(()=>{if(!file){setPreview("");return;}const url=URL.createObjectURL(file);setPreview(url);return()=>URL.revokeObjectURL(url);},[file]);
 return <section className="space-y-3 rounded-xl border border-slate-200 p-4">
  <div><h3 className="text-sm font-semibold">{reel?"Reel cover":"Video thumbnail"} <span className="font-normal text-slate-500">(optional)</span></h3><p className="mt-1 text-xs text-slate-500">Upload a custom JPG or PNG, up to 8 MB. {reel?"Recommended: 1080 × 1920 (9:16).":"Recommended: match the video aspect ratio, e.g. 1280 × 720 (16:9)."} Without an image, Meta selects the thumbnail.</p></div>
  {file&&preview&&<div className="flex flex-wrap items-center gap-4"><img src={preview} alt="Selected thumbnail preview" className={reel?"max-h-56 w-auto rounded-lg border object-contain":"max-h-44 max-w-full rounded-lg border object-contain"}/><div className="min-w-0"><p className="break-all text-sm font-medium">{file.name}</p><button type="button" disabled={disabled} onClick={()=>{onChange(null);if(input.current)input.current.value="";}} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-red-600 disabled:opacity-50"><X size={14}/>Remove</button></div></div>}
  <label htmlFor={id} className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-blue-700 ${disabled?"pointer-events-none opacity-50":""}`}><ImagePlus size={18}/>{file?"Replace image":"Upload thumbnail"}</label>
  <input ref={input} id={id} type="file" accept="image/jpeg,image/png" disabled={disabled} className="sr-only" onChange={e=>{const next=e.target.files?.[0];if(!next)return;if(!["image/jpeg","image/png"].includes(next.type)||next.size<=0||next.size>8*1024*1024){toast.error("Choose a JPG or PNG image up to 8 MB.");e.target.value="";return;}onChange(next);e.target.value="";}}/>
 </section>;
}
