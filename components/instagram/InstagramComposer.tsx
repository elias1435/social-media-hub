"use client";
import { useState,FormEvent } from "react";
import { toast } from "sonner";
type Account={id:string;name:string;pageId:string};
export default function InstagramComposer({accounts}:{accounts:Account[]}){
 const [pageId,setPageId]=useState(accounts[0]?.pageId||"");
 const [igId,setIgId]=useState(accounts[0]?.id||"");
 const [caption,setCaption]=useState("");
 const [imageUrl,setImageUrl]=useState("");
 const [busy,setBusy]=useState(false);
 async function submit(e:FormEvent){
  e.preventDefault();if(busy||!igId||!imageUrl)return;
  if(!window.confirm("Publish this Instagram image now?"))return;
  setBusy(true);
  try{const res=await fetch("/api/instagram/publish",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({pageId,igId,caption,imageUrl})});const data=await res.json();if(!res.ok)throw new Error(data.error||"Publishing rejected");toast.success("Instagram image published");setCaption("");setImageUrl("");}
  catch(e){toast.error(e instanceof Error?e.message:"Publish failed");}finally{setBusy(false);}
 }
 return <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-6"><h2 className="font-bold">Publish Instagram Photo</h2><p className="mt-2 text-xs leading-5 text-slate-500">Requires instagram_basic and instagram_content_publish. The image must already be hosted at a public HTTPS URL; private file uploads and Reels are not supported in this form.</p>
 <label className="mt-4 block text-sm font-semibold">Account<select value={igId} onChange={e=>{const selected=accounts.find(a=>a.id===e.target.value);setIgId(e.target.value);setPageId(selected?.pageId||"");}} className="mt-2 w-full rounded-lg border border-slate-200 p-3 font-normal">{accounts.map(a=><option value={a.id} key={a.id}>{a.name}</option>)}</select></label>
 <label className="mt-4 block text-sm font-semibold">Public image URL<input required type="url" value={imageUrl} onChange={e=>setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" className="mt-2 w-full rounded-lg border border-slate-200 p-3 font-normal"/></label>
 <label className="mt-4 block text-sm font-semibold">Caption<textarea rows={4} maxLength={2200} value={caption} onChange={e=>setCaption(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 p-3 font-normal"/></label>
 <button disabled={!imageUrl||busy} className="mt-4 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-40">{busy?"Publishing…":"Publish Instagram photo"}</button></form>;
}
