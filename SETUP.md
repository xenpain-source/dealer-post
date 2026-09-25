# Getting Dealer Post running on real accounts

The code is wired up to three free-tier services. None of these accounts can
be created for you — sign-up and pasting in API keys are things only you can
do — but everything below is copy-paste once you have them.

Total cost to get through this guide: **$0**.

## 1. Database — Neon (Postgres)

1. Go to [neon.tech](https://neon.tech) and sign up (free, no card required).
2. Create a new project (any name/region is fine).
3. On the project dashboard, copy the **connection string** — use the
   "pooled connection" version if Neon offers both.
4. Paste it into `.env.local` (copy `.env.example` to `.env.local` first) as
   `DATABASE_URL`.
5. Push the schema to your new database:
   ```
   npm run db:push
   ```
   This creates the `dealers`, `users`, `listings`, `listing_photos`,
   `platform_connections`, and `posting_history` tables. You can browse the
   data any time with `npm run db:studio`.

## 2. Auth — Clerk

1. Go to [clerk.com](https://clerk.com) and sign up.
2. Create a new application (any name).
3. In **API Keys**, copy the **Publishable key** and **Secret key** into
   `.env.local` as `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and
   `CLERK_SECRET_KEY`.
4. The other four `NEXT_PUBLIC_CLERK_*` variables in `.env.example` are
   already set correctly for this app's routes — no changes needed unless
   you rename the `/login` or `/signup` pages.
5. That's it — sign-up, sign-in, sessions, and account management are all
   handled by Clerk's hosted components already wired into the app.

## 3. Photo storage — Cloudflare R2

1. Go to the [Cloudflare dashboard](https://dash.cloudflare.com), sign up if
   needed, and open **R2** in the sidebar.
2. Create a bucket (e.g. `dealer-post-photos`).
3. In the bucket's **Settings** tab, enable **Public access** (R2.dev
   subdomain is fine to start) and copy the public URL it gives you into
   `.env.local` as `R2_PUBLIC_URL`.
4. Still in bucket Settings, add a **CORS policy** so the browser can upload
   directly to R2:
   ```json
   [
     {
       "AllowedOrigins": ["http://localhost:3000", "https://YOUR-VERCEL-DOMAIN"],
       "AllowedMethods": ["PUT"],
       "AllowedHeaders": ["Content-Type"]
     }
   ]
   ```
5. Go to **R2 -> Manage API tokens**, create a token with **Object Read &
   Write** permission scoped to this bucket. Copy the Account ID, Access Key
   ID, and Secret Access Key into `.env.local` as `R2_ACCOUNT_ID`,
   `R2_ACCESS_KEY_ID`, and `R2_SECRET_ACCESS_KEY`. Set `R2_BUCKET_NAME` to
   the bucket name from step 2.

## 4. Local check

```
npm install
npm run dev
```

Visit `localhost:3000`, click **Log in**, sign up for a real account, and
try **Add a car** with a photo. If it saves and shows up on the Listings
page, everything is wired correctly.

## 5. Deploy — add the same variables to Vercel

The code is already pushed to GitHub and auto-deploys via Vercel, but the
live site needs its own copy of these env vars (it doesn't read your local
`.env.local`):

1. Open the project on [vercel.com](https://vercel.com) -> **Settings ->
   Environment Variables**.
2. Add every variable from `.env.local` (same names, same values — a real
   `DATABASE_URL`, real Clerk keys, real R2 credentials).
3. Redeploy (Vercel -> Deployments -> ⋯ -> Redeploy), since env var changes
   don't apply retroactively to an existing build.
4. Update the R2 CORS policy's `AllowedOrigins` to include your real Vercel
   domain once you know it (step 3 above used a placeholder).

Once that's done, the live site has a real database, real accounts, and
real photo uploads — no more sample data.
