# How to Gym

A mobile-first gym companion app. Members sign up, get approved by their gym's
owner, answer a short onboarding questionnaire, and get a weekly workout plan
built only from equipment their specific gym actually has (recognized by
photo, not name). Each session asks how much time is available and trims the
plan to fit, then walks through every exercise with a live 3D movement demo.

Three roles:

- **Super Admin** — creates gyms, invites gym owners, sets member caps,
  curates the master equipment photo catalog.
- **Gym Owner** — builds their gym's equipment inventory (from the catalog or
  a custom photo upload), approves/rejects member signups, can assign or
  block specific exercises per member.
- **Member** — signs up against a specific gym, gets approved, fills the
  onboarding questionnaire, and trains from the generated plan.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind + shadcn/ui · Clerk (auth) ·
Neon Postgres + Drizzle ORM · React Three Fiber (3D exercise demos)

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment variables** — copy `.env.example` to `.env.local` and fill in:
   - `DATABASE_URL` — full Neon connection string (Neon dashboard → Connection Details)
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` — from your Clerk app dashboard

3. **Database**
   ```bash
   npm run db:generate   # regenerate SQL migrations after a schema change
   npm run db:migrate    # apply migrations to the database
   npm run db:seed       # load the 18 sample equipment photos into the master catalog
   ```

4. **Run**
   ```bash
   npm run dev
   ```

## First run

There's no separate "make me an admin" step — **the first person to ever
sign up automatically becomes the Super Admin**. Sign up once, and you're in
the Super Admin dashboard at `/super-admin/gyms`. From there:

1. Create a gym (this sends the owner an email invite via Clerk).
2. The gym owner accepts the invite, signs in, and builds their equipment
   inventory at `/admin/equipment` from the master catalog or their own photos.
3. Members sign up at `/sign-up`, pick that gym, and wait for the owner to
   approve them from `/admin/members`.
4. Once approved, a member completes onboarding and gets their plan.

## Deployment (Cloudflare Workers)

Deployed via the [OpenNext Cloudflare adapter](https://opennext.js.org/cloudflare), live at
`https://how-to-gym.<your-workers-subdomain>.workers.dev`.

```bash
npx wrangler login                          # one-time interactive auth (or set CLOUDFLARE_API_TOKEN)
npx wrangler secret put DATABASE_URL        # paste the Neon connection string
npx wrangler secret put CLERK_SECRET_KEY    # paste the Clerk secret key

NEXT_PUBLIC_APP_URL=https://how-to-gym.<your-workers-subdomain>.workers.dev npm run cf:deploy
```

`NEXT_PUBLIC_APP_URL` must be passed at build time (it's inlined into the client
bundle and used for Clerk gym-owner invite redirect links) — set it inline as
above rather than editing `.env.local`, so local dev keeps using `localhost`.

Notes:
- **`src/middleware.ts` is intentionally not renamed to Next 16's `proxy.ts`**
  — the OpenNext adapter doesn't yet detect that convention
  ([opennextjs-cloudflare#962](https://github.com/opennextjs/opennextjs-cloudflare/issues/962)).
  Next will print a harmless deprecation warning at build time; leave it as-is
  until that's fixed upstream.
- For local Worker-runtime testing (`npm run cf:preview`), copy
  `.dev.vars.example` to `.dev.vars` and fill in the same secrets.
- The Clerk keys currently in use are **development-instance** keys (strict
  usage limits, shows a "Development mode" badge on auth screens). Before
  real public launch, create a Production instance in the Clerk dashboard,
  add the live domain to it, and swap in the production keys as both the
  Worker secret and the local `.env.local` value.

## Notes for future work

- Equipment photos are stored as base64 in Postgres for simplicity. If photo
  volume grows, swap `imageData` for a Vercel Blob URL — the read paths only
  care that it's a string usable in an `<img src>`.
- The 3D exercise demo is a procedurally-rigged low-poly character (no
  external model/animation assets), animated per **movement pattern**
  (`src/components/exercise-3d/poses.ts`), not per individual exercise. New
  equipment just needs to be mapped to the closest existing pattern.
- The recommendation engine (`src/lib/recommendation-engine.ts`) is a
  deterministic rules engine, not ML — it's the place to tune set/rep/rest
  logic or add new split types.
