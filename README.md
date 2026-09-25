# Dealer Post

Skeleton for a tool that lets small used-car dealers post their inventory
to multiple places (Facebook Marketplace, Instagram, Craigslist, etc.)
from one place, instead of retyping each listing by hand.

This is an early structural skeleton, not a working product yet. Nothing
is wired up to a real database, real auth, or any posting platform —
those come next. Right now it's the shape of the app: a marketing page,
a login screen, and a dashboard with placeholder data.

## What's here

- `app/page.tsx` — marketing landing page
- `app/login` — placeholder login screen
- `app/(dashboard)/dashboard` — placeholder dashboard (overview, listings
  table, "add a car" form)
- `lib/listings.ts` — sample listing data (stand-in for a real database)
- `lib/platforms.ts` — list of target platforms and their status

## Running it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Pushing this to GitHub

From inside this folder:

```bash
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

(Create the empty repo on GitHub first, without a README, so there's
nothing to conflict with.)

## Deploying to Vercel

1. Go to vercel.com and click "Add New Project."
2. Import the GitHub repo you just pushed.
3. Leave the defaults (Vercel auto-detects Next.js) and click Deploy.

Every push to `main` after that will auto-deploy.

## Next steps

- Real authentication (dealer accounts, sessions)
- A real database for listings and photos
- Photo upload/storage
- Craigslist and Instagram posting (no platform approval required to start)
- Facebook Marketplace posting — this needs a business relationship with
  an already-approved Facebook inventory partner; see project notes for
  why direct approval isn't realistic for a new company yet
