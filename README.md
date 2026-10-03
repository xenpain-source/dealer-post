# Dealer Post

A tool that lets small used-car dealers post their inventory to multiple
places (Facebook Marketplace, Instagram, Craigslist, etc.) from one place,
instead of retyping each listing by hand.

Real auth (Clerk), a real database (Neon/Postgres via Drizzle), and real
photo storage (Cloudflare R2) are all wired up — see `SETUP.md` for getting
your own free-tier accounts connected. Facebook Marketplace posting works
today through a companion browser extension (see `extension/`) that fills
in Facebook's own listing form from a DealerLoft listing; the dealer
reviews it and clicks Facebook's own Publish button themselves. Instagram
and Craigslist posting aren't built yet — see "Next steps" below.

## What's here

- `app/page.tsx` — marketing landing page
- `app/login`, `app/signup` — Clerk-hosted auth screens
- `app/(dashboard)/dashboard` — the dealer app (overview, listings table,
  listing detail/edit, "add a car" form)
- `app/api` — listings CRUD, photo upload presigning, and the Facebook
  posting handoff/callback routes
- `lib/db/schema.ts` — the real Drizzle/Postgres schema (dealers, users,
  listings, photos, platform connections, posting history)
- `lib/platforms.ts` — list of target platforms and their status
- `extension/` — the Facebook Marketplace Assistant browser extension

## Running it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000. You'll need real Neon/Clerk/R2 credentials
in `.env.local` first — see `SETUP.md` for the full walkthrough (free,
about 10 minutes).

## Deploying to Vercel

The code is already pushed to GitHub and set up to auto-deploy via Vercel
on every push to `main`. The live site needs its own copy of the env vars
from `.env.local` (Vercel -> Settings -> Environment Variables) — see
`SETUP.md` step 5.

## Next steps

- Instagram posting — needs the Meta Graph API, a Business/Creator IG
  account, and Meta App Review (the review queue is the slow part, not
  the code)
- Craigslist posting — no public API; a manual-assist flow (pre-filled
  copy/paste) is the easy first version
- A Settings/Channels page to manage connections in one place
- A unified inbox across all connected channels

See `SETUP.md` for getting the app running on real accounts, and the
project roadmap doc for the full build-order/status tracking.
