# Production deployment check — Social Media Hub

The GitHub Actions workflow at `.github/workflows/build.yml` only runs `npm ci`, `prisma generate`, and `npm run build` for pull requests. It does not deploy to Hostinger.

## Hostinger
1. Open hPanel > Websites > your Social Media Hub site > Git/deployments or Node.js app controls (the section depends on the Hostinger product).
2. Confirm the connected repository is `elias1435/social-media-hub` and the selected branch is `main`.
3. Confirm automatic deployment is enabled and inspect the latest successful deployed commit. If absent, trigger the site's manual pull/deploy and restart its Node.js process using Hostinger's UI.
4. Verify the configured start command and production environment variables are still present. Do not paste secrets into tickets or logs.
5. Visit `https://social.ashikinternational.com/api/version` in a private browser window. Release `2026-11-26-feature-hardening` indicates that this release's code is running.
6. If the version endpoint returns 404, login HTML, or an older release, the updated code was not yet deployed (or the proxy is still routing to an older application).
7. Once the release matches, hard-refresh the browser and test the five features. If logged in under a restricted role, unavailable menu items are intentionally hidden.

Note: the public version endpoint exposes a non-secret release label only; it does not disclose environment variables or credentials. An application build passing GitHub CI is not evidence of a Hostinger deployment.
