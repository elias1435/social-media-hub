# Social Media Hub — Production rollout (2026-11-26)

## Deployment safety

This release adds additive Prisma tables for invitations, settings, notifications, Messenger collaboration, automation jobs, analytics snapshots and Ads action auditing.

**GitHub Actions verifies the build but does not deploy to Hostinger.** Hostinger's Git integration must deploy `main`.

The `npm run build` script now generates Prisma; `npm start` runs `prisma migrate deploy` before starting Next.js. Confirm Hostinger actually runs `npm start`. If Hostinger uses its own custom start command, explicitly run `npx prisma migrate deploy` before starting the new app. Back up the production MySQL database first.

1. Back up the database and record its restore point.
2. Confirm Node.js 22 and correct production `DATABASE_URL`.
3. Configure the environment variables below securely in Hostinger, not in GitHub or client-side configuration.
4. Deploy the commit and verify `npx prisma migrate status` and application logs.
5. Visit `https://social.ashikinternational.com/api/version` to verify release (this is not a migration status check).
6. Test login, existing Facebook Page connections, Post publishing, Messenger inbox, role editor, user invite, and settings.
7. Use a restricted test account; verify prohibited routes and API actions return 403.
8. Schedule a *test* Instagram photo, then manually invoke worker in controlled environment, verify successful Meta publication and job status.
9. Test Ads live controls only with a safe test account/campaign, after Meta approval and server allowlisting.
10. Review production logs and failure statuses. Roll back application code to the last known-good commit if needed. Additive tables may remain; do not automatically drop production data.

## Required environment variables (never commit values)

- Existing: `DATABASE_URL`, `AUTH_URL`, `AUTH_SECRET`, `SOCIAL_TOKEN_ENCRYPTION_KEY`, `META_APP_ID`, `META_APP_SECRET`, `META_REDIRECT_URI`, `META_LOGIN_CONFIG_ID`.
- Email invitations and email notifications: `RESEND_API_KEY`, `EMAIL_FROM`. Use a verified sending domain; invitation links expire after seven days.
- Worker: `CRON_SECRET` (random secret of at least 32 characters). Do not expose it in the browser or logs.
- Ads: `META_ADS_ACCESS_TOKEN` with the approved `ads_management` permission and authorized assets. `META_ADS_LIVE_CHANGES_ENABLED=true` enables the code path. `META_ADS_ALLOWED_ACCOUNT_IDS` is a comma-separated allowlist of permitted `act_...` IDs (or bare numeric IDs). Without the allowlist, live changes are rejected.

## Cron

Configure a single Hostinger or trusted scheduler job per minute that makes an authenticated **POST** to:

`https://social.ashikinternational.com/api/automation/run`

with HTTP header `Authorization: Bearer <CRON_SECRET>`.

Run once daily to collect Facebook follower/like snapshots:

`https://social.ashikinternational.com/api/analytics/collect`

with the same bearer secret and method POST.

This must run from a secure scheduler. Do not paste the secret into the site content, public logs, or a GitHub Actions workflow.

The worker claims due jobs atomically. Jobs with ambiguous external Meta failures are put into `NEEDS_REVIEW` rather than blindly retried. Operators must inspect these in Content Planner.

## Meta permissions and integration limitations

- `pages_messaging` Advanced Access remains submitted/pending according to the project owner; public-customer replies are still subject to Meta approval and the messaging window.
- Standard Page videos use the existing resumable upload endpoint. Reels use the separate Meta Page Reels API and a **publicly hosted HTTPS video URL**, with options to publish or schedule. Meta processing remains asynchronous.
- Instagram scheduling uses a persisted job and the cron worker, not Meta's native feed scheduler. Only linked professional accounts and public HTTPS photo URLs are supported.
- Ads changes require explicit typed confirmation, system-admin access, current Marketing API authorization, server enablement, and the account allowlist. The initial live controls support campaign status and campaign daily budget; complete campaign/ad-set/creative creation remains separate.
- Historical Facebook follower/like snapshots accumulate only after daily collector configuration. Ads insights are read live for system admins only, because ad accounts are not yet mapped to per-organization access.

## Support / rollback

If production reports missing database tables, do not repeatedly redeploy or delete data. Confirm the migration was applied against the correct database, and inspect Hostinger logs. If the migration fails, keep the previous release running while resolving the SQL or access issue.

The release probe `/api/version` only indicates code version, not that Meta or worker jobs are healthy.
