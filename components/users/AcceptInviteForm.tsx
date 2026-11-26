"use client";
import {FormEvent,useState} from "react";
import Link from "next/link";
export default function AcceptInviteForm({token}:{token:string}){
 const [password,setPassword]=useState("");
 const [confirm,setConfirm]=useState("");
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");
 const [success,setSuccess]=useState(false);
 async function submit(e:FormEvent){e.preventDefault();if(password!==confirm){setMessage("Passwords must match.");return;}setBusy(true);setMessage("");
 try{const response=await fetch("/api/invitations/accept",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token,password})});
 const data=await response.json();if(!response.ok)throw new Error(data.error||"Could not accept invitation.");setSuccess(true);}catch(e){setMessage(e instanceof Error?e.message:"Could not complete registration.");}finally{setBusy(false);}}
 if(success)return <div className="rounded-xl bg-white p-8 shadow"><h1 className="text-xl font-bold">Your account is ready</h1><Link href="/login" className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-white">Sign in</Link></div>;
 return <form onSubmit={submit} className="rounded-xl bg-white p-8 shadow"><h1 className="text-xl font-bold">Accept workspace invitation</h1><p className="mt-2 text-sm text-slate-500">Choose a password for your new account.</p>
 <label className="mt-5 block text-sm font-medium">Password<input type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded border p-3"/></label>
 <label className="mt-4 block text-sm font-medium">Confirm password<input type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={confirm} onChange={e=>setConfirm(e.target.value)} className="mt-2 w-full rounded border p-3"/></label>
 {message&&<p role="alert" className="mt-3 text-sm text-red-700">{message}</p>}
 <button type="submit" disabled={busy||!password||password!==confirm} className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-50">{busy?"Activating…":"Activate account"}</button>
 </form>;
}
