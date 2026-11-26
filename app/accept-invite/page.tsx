import AcceptInviteForm from "@/components/users/AcceptInviteForm";
export default async function AcceptInvite({searchParams}:{searchParams:Promise<{token?:string}>}){
 const {token}=await searchParams;
 return <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4"><div className="w-full max-w-md">{token?<AcceptInviteForm token={token}/>:<div className="rounded-xl bg-white p-8">A valid invitation link is required.</div>}</div></main>;
}
