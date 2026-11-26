import "server-only";
import { cookies } from "next/headers";
export async function preferredPage(userId?:string, organizationId?:string){
 if(!userId||!organizationId)return undefined;
 return (await cookies()).get("hub-page-"+organizationId+"-"+userId)?.value;
}
