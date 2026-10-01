# Social Media Hub mockup routes

This build is a UI/demo foundation only. All platform data is mocked. No Meta, YouTube, WhatsApp, database or authentication credentials are included.

## Main routes
- `/` — Main dashboard
- `/login` — Login mockup
- `/facebook` — Facebook Pages
- `/facebook/dashboard` — Facebook Page dashboard
- `/facebook/create-post` — Create Facebook post
- `/facebook/upload-video` — Upload Facebook video/reel
- `/facebook/posts` — Facebook posts
- `/facebook/comments` — Facebook comments
- `/facebook/messages` — Shared Messenger inbox
- `/youtube` — YouTube channels
- `/youtube/upload` — YouTube upload
- `/youtube/comments` — YouTube comments
- `/whatsapp` — WhatsApp numbers
- `/whatsapp/inbox` — WhatsApp shared inbox
- `/ads-manager` — Meta Ads Manager
- `/ads-manager/create` — Campaign creation workflow
- `/post-video` — Central publishing shortcuts
- `/content-planner` — Content planner
- `/analytics` — Analytics & reports
- `/activity-logs` — Activity logs
- `/team` — Team/users
- `/roles-permissions` — Roles & permissions
- `/connected-accounts` — Connected accounts
- `/settings` — Settings & API status

## Backward-compatible aliases
The earlier mockup paths remain available as well:
- `/facebook/overview`
- `/ads`
- `/ads/create`
- `/roles`

## Local run
```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.
