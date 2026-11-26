import { execSync } from "node:child_process";

if (process.env.DEPLOY_ENV !== "production") {
  console.log("[migrate] Skipped: DEPLOY_ENV is not 'production'.");
  process.exit(0);
}

try {
  console.log("[migrate] Applying pending Prisma migrations...");
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
  console.log("[migrate] Database schema is up to date.");
} catch {
  console.error("[migrate] FAILED. Build stopped; the previous version stays live.");
  process.exit(1);
}
