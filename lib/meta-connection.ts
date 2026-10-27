import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const GRAPH = "https://graph.facebook.com/v26.0";

function key() {
  const raw = process.env.SOCIAL_TOKEN_ENCRYPTION_KEY;
  if (!raw) throw new Error("SOCIAL_TOKEN_ENCRYPTION_KEY is missing");
  return /^[a-f0-9]{64}$/i.test(raw) ? Buffer.from(raw, "hex") : createHash("sha256").update(raw).digest();
}

export function encryptToken(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const body = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return [iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), body.toString("base64url")].join(".");
}

export function decryptToken(value: string) {
  const [iv, tag, body] = value.split(".");
  if (!iv || !tag || !body) throw new Error("Invalid encrypted token");
  const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(body, "base64url")), decipher.final()]).toString("utf8");
}

export async function graphGet<T>(path: string, token: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(path.startsWith("https://") ? path : GRAPH + path);
  // Never allow Meta pagination to make requests to another host.
  if (url.origin !== new URL(GRAPH).origin) throw new Error("Unexpected Graph API host");
  for (const [name, value] of Object.entries(params)) url.searchParams.set(name, value);
  const res = await fetch(url, { headers: { Authorization: "Bearer " + token }, cache: "no-store" });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error?.message || "Meta Graph API request failed");
  return data as T;
}

export type MetaPage = { id: string; name: string; access_token?: string; picture?: { data?: { url?: string } }; followers_count?: number };
export async function getPages(token: string): Promise<MetaPage[]> {
  const pages: MetaPage[] = [];
  let next: string | undefined = "/me/accounts";
  for (let i = 0; i < 20 && next; i++) {
    const page: { data?: MetaPage[]; paging?: { next?: string } } = await graphGet(next, token, next.startsWith("/") ? { fields: "id,name,access_token,picture,followers_count", limit: "100" } : {});
    pages.push(...(page.data || []));
    next = page.paging?.next;
  }
  return pages;
}
