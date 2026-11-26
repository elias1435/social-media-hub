import "server-only";
export async function sendWorkspaceEmail(to:string,subject:string,html:string) {
 const apiKey=process.env.RESEND_API_KEY;
 const from=process.env.EMAIL_FROM;
 if(!apiKey||!from)throw new Error("Email provider not configured. Set RESEND_API_KEY and EMAIL_FROM.");
 const response=await fetch("https://api.resend.com/emails",{
  method:"POST",headers:{"Authorization":"Bearer "+apiKey,"Content-Type":"application/json"},
  body:JSON.stringify({from,to:[to],subject,html}),cache:"no-store"
 });
 if(!response.ok){console.error("Email provider rejected delivery:",response.status);throw new Error("Could not send invitation email. Check provider configuration.");}
}
