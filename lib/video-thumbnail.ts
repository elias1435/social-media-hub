import "server-only";
export const THUMBNAIL_LIMIT=8*1024*1024;
export async function validThumbnail(file:File){
 if(file.size<=0||file.size>THUMBNAIL_LIMIT||!["image/jpeg","image/png"].includes(file.type))return false;
 const bytes=new Uint8Array(await file.slice(0,8).arrayBuffer());
 return file.type==="image/jpeg"?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v);
}
export async function setVideoThumbnail(videoId:string,token:string,file:File){
 if(!/^\d+$/.test(videoId))return false;
 const body=new FormData();
 body.set("source",file,file.type==="image/png"?"thumbnail.png":"thumbnail.jpg");
 body.set("is_preferred","true");
 try{
  const res=await fetch("https://graph.facebook.com/v26.0/"+encodeURIComponent(videoId)+"/thumbnails",{method:"POST",headers:{Authorization:"Bearer "+token},body,cache:"no-store",signal:AbortSignal.timeout(20000)});
  const data=await res.json().catch(()=>null);
  return res.ok&&!data?.error&&(data?.success===true||Boolean(data?.id));
 }catch{return false;}
}
