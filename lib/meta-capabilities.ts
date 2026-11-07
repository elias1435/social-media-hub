import "server-only";
import { graphGet, decryptToken } from "@/lib/meta-connection";

type DebugInfo = {
  data?: {
    is_valid?: boolean;
    type?: string;
    app_id?: string;
    scopes?: string[];
    granular_scopes?: Array<{scope?: string; target_ids?: string[]}>;
    expires_at?: number;
  };
};
export type CapabilityReport = {
  valid: boolean | null;
  tokenType: string;
  pageToken: boolean;
  pageMatches: boolean;
  scopes: string[];
  granted: Record<string,boolean>;
  publishingReady: boolean;
  warnings: string[];
};
const PERMISSIONS = ["pages_show_list","pages_read_engagement","pages_manage_posts","pages_manage_engagement","pages_read_user_content","pages_messaging","instagram_basic","instagram_content_publish"];

export async function inspectFacebookPageToken(ciphertext:string,pageId:string):Promise<CapabilityReport> {
  const report:CapabilityReport={valid:null,tokenType:"Unknown",pageToken:false,pageMatches:false,scopes:[],granted:{},publishingReady:false,warnings:[]};
  let token:string;
  try{token=decryptToken(ciphertext);}
  catch{report.warnings.push("Saved Page token cannot be decrypted. Reconnect the Page.");return report;}
  const appId=process.env.META_APP_ID;
  const appSecret=process.env.META_APP_SECRET;
  if(appId&&appSecret){
    try {
      const url=new URL("https://graph.facebook.com/v26.0/debug_token");
      url.searchParams.set("input_token",token);
      const response=await fetch(url,{headers:{Authorization:"Bearer "+appId+"|"+appSecret},cache:"no-store"});
      const data=await response.json() as DebugInfo;
      if(!response.ok||!data.data)throw new Error("Token introspection unavailable");
      report.valid=Boolean(data.data.is_valid);
      report.tokenType=data.data.type||"Unknown";
      report.scopes=data.data.scopes||[];
      report.pageToken=report.tokenType.toUpperCase()==="PAGE";
      if(!report.valid)report.warnings.push("Saved access token is invalid or expired.");
      if(!report.pageToken)report.warnings.push("Saved token is not a Page access token. Reconnect Facebook to obtain the correct Page token.");
      if(data.data.app_id&&data.data.app_id!==appId)report.warnings.push("Token belongs to a different Meta application.");
    }catch{report.warnings.push("Meta token debug information could not be retrieved.");}
  }else report.warnings.push("Meta app credentials are not configured for token diagnostics.");
  try{
    const identity=await graphGet<{id?:string}>("/me",token,{fields:"id"});
    report.pageMatches=identity.id===pageId;
    if(!report.pageMatches)report.warnings.push("Token identity does not match this Facebook Page.");
  }catch{report.warnings.push("Meta could not verify the saved token identity.");}
  const grantedScopes=new Set(report.scopes);
  for(const name of PERMISSIONS) report.granted[name]=grantedScopes.has(name);
  if(report.valid===true&&report.pageToken&&report.pageMatches&&!report.granted.pages_manage_posts)report.warnings.push("Token does not include pages_manage_posts; publishing is not authorized.");
  report.publishingReady=report.valid===true&&report.pageToken&&report.pageMatches&&["pages_manage_posts","pages_read_engagement","pages_show_list"].every(p=>report.granted[p]);
  if(report.publishingReady)report.warnings.push("Token checks passed. Facebook Page CREATE_CONTENT task and Meta's video publishing authorization still determine whether an upload is accepted.");
  return report;
}
