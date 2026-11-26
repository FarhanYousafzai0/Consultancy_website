# Environment setup (copy to `.env.local`)

## Required now

### 1. MongoDB Atlas (Frankfurt) — preferred
1. Create a free cluster at https://cloud.mongodb.com (region: **Frankfurt / eu-central-1**).
2. Database Access → create a user + password.
3. Network Access → allow your IP (or `0.0.0.0/0` for local-only testing).
4. Connect → Drivers → copy the URI. **Insert `/parwaz` before `?`**:
   `mongodb+srv://USER:PASS@CLUSTER.mongodb.net/parwaz?retryWrites=true&w=majority`
5. Put it in `MONGODB_URI`.

If Node fails with `querySrv ECONNREFUSED` (common on some Windows/router DNS), use Atlas **standard connection string** (three `…-shard-00-0x…:27017` hosts) with `ssl=true`, `replicaSet=…`, `authSource=admin`. The app also pins Google/Cloudflare DNS for `mongodb+srv://` lookups.

Local-only alternative when Atlas is unreachable: set `MONGODB_URI=memory`
That starts an in-process MongoDB (binaries on `D:\dev-cache\mongodb-binaries`).

After setting Mongo, run: `npm run db:migrate`

## Internship research automation

The internship research job reads only the curated official sources in
`src/data/internship-sources.ts`. It validates extracted evidence and reports
uncertain records for review; it does not publish records automatically.

Required variables for the scheduled job:

- `MONGODB_URI` — the database to update (not needed for dry-run)
- `CRON_SECRET` — non-empty operational secret required by the research CLI
- `GEMINI_API_KEY` or `OPENAI_API_KEY` — AI extraction provider credentials

Run locally with the same command used by GitHub Actions:

```
npm run internships:research -- --dry-run
npm run internships:research -- --sources=cern-internships --concurrency=1
npm run internships:research -- --force --concurrency=4
```

Supported flags are `--dry-run`, `--force`, `--sources=id,id`, and
`--concurrency=1..8`. Dry-run fetches and validates sources without creating
research runs, changing source state, or writing internship records. Every run
prints per-source results and a JSON summary containing successes, failures,
extracted/upserted records, records needing review, skipped unchanged sources,
provider usage, active published records, and error messages.

GitHub Actions runs this workflow daily and exposes the same flags through
manual dispatch. The workflow uses the `internship-research` concurrency group
with cancellation disabled, so a scheduled run and a manual run cannot overlap.

### 2. Better Auth
- `BETTER_AUTH_SECRET` — long random string (32+ chars). Generate: `openssl rand -base64 32`
- `BETTER_AUTH_URL` — `http://localhost:3000` in dev. **On the live site this must be the live address** (for example `https://www.your-domain.com`, no trailing slash). Google sends people back to `{BETTER_AUTH_URL}/api/auth/callback/google`; if it is wrong, Google login fails.
- `BETTER_AUTH_TRUSTED_ORIGINS` (optional) — extra comma-separated addresses allowed to sign in. The `BETTER_AUTH_URL` address, its `www`/bare twin and the Vercel deployment URLs are allowed automatically.
- Serve the site on **one** host: redirect `www` → bare domain (or the reverse) in Vercel → Domains, and use that host in `BETTER_AUTH_URL`. Google login started on the other host fails with "state mismatch".

### 3. Resend (email OTP + deadline alerts)
1. Create account at https://resend.com
2. Create an API key → `RESEND_API_KEY`
3. Verify a sending domain (or use onboarding sender) → `EMAIL_FROM` (also accepts `RESEND_FROM_EMAIL`)
4. Without `RESEND_API_KEY`, OTP is written to `DEV_OTP_FILE` and the server console (dev only). In production a missing key is an error shown to the user.
5. `EMAIL_FROM` must be on a domain verified in **this** Resend account, for example `Parwaaz <no-reply@your-domain.com>`.
6. Deadline alerts: set `CRON_SECRET`, then call  
   `GET /api/cron/deadline-alerts` with header `Authorization: Bearer <CRON_SECRET>`  
   (or `x-cron-secret`). Add `?dryRun=1` to list candidates without sending. Reminders fire at 30 / 14 / 7 days before shortlisted program or saved scholarship deadlines.

### 4. Admin allow-list
`ADMIN_EMAILS` — comma-separated **real** emails that get the admin role (use an inbox you can open when Resend is on).

Create the admin account with a password:

```
npm run db:seed-admin
```

- Uses the first email in `ADMIN_EMAILS` (or `-- --email=you@example.com`).
- Password comes from `ADMIN_SEED_PASSWORD`; if unset, a random one is saved to `ADMIN_SEED_PASSWORD_FILE` (default `D:\dev-cache\parwaz\admin-password.txt`).
- Re-running keeps an existing password; add `-- --reset-password` to replace it.
- The script writes to whatever database `MONGODB_URI` in `.env.local` points to.

Admins sign in at `/admin/login` with password or email code. Students log in at `/login` with password, email code or Google; after a code or Google login they are offered a password, and can add or change it later on `/dashboard/profile`.

### 5. Google OAuth (optional)
`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — enables “Sign in with Google” on `/login` and `/signup`.
In Google Cloud Console → APIs & Services → Credentials → your OAuth client:
- Authorised JavaScript origins: `http://localhost:3000` and the live address.
- Authorised redirect URIs: `http://localhost:3000/api/auth/callback/google` and `https://<live-host>/api/auth/callback/google`.
- OAuth consent screen: publish the app ("In production"). While it is "Testing", only listed test users can sign in.
- Set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in Vercel for Production too, then redeploy.

### 6. AI Advisor (Gemini + optional OpenAI)
1. Create a Gemini API key in Google AI Studio → `GEMINI_API_KEY`
2. Optional: add `OPENAI_API_KEY` to benchmark / switch providers (`npm run ai:bench`)
3. Model routing (defaults shown):
   - `AI_CHAT_PROVIDER=openai` / `AI_CHAT_MODEL=gpt-4o-mini` (main streaming chat)
   - `AI_CHAT_FALLBACK_PROVIDER=google` / `AI_CHAT_FALLBACK_MODEL=gemini-3.5-flash-lite` (used on 503/overload)
   - `AI_ANALYSIS_PROVIDER=openai` / `AI_ANALYSIS_MODEL=gpt-4o-mini` (paid reports / SOP)
4. Budgets & quotas:
   - `AI_MONTHLY_BUDGET_USD=50` (also accepts legacy `GEMINI_MONTHLY_BUDGET_USD`)
   - `AI_FREE_VISITOR_DAILY=5`, `AI_FREE_STUDENT_DAILY=20`, `AI_PAID_DAILY=200`
   - `AI_CREDIT_PACK_SIZE=5` — credits granted when admin marks an `ai_credits` lead paid
   - Optional partner URL overrides: `NEXT_PUBLIC_PARTNER_EXPATRIO_URL`, `NEXT_PUBLIC_PARTNER_FINTIBA_URL`, `NEXT_PUBLIC_PARTNER_CORACLE_URL`
   - Ausbildung paid partner (gated): `NEXT_PUBLIC_PARTNER_AUSBILDUNG_URL` (+ optional name/blurb); unlock via Insights demand (`AUSBILDUNG_PARTNER_MIN_CHECKS` / `AUSBILDUNG_PARTNER_MIN_APPLY_CLICKS`) or `AUSBILDUNG_PARTNER_FORCE=1`
   - Community invite override: `NEXT_PUBLIC_COMMUNITY_WHATSAPP_URL`
5. Without `GEMINI_API_KEY` (and without OpenAI when selected), Ask Parwaaz returns an error telling you to set the key.

## Later (leave empty for now)
- PostHog, Vercel Cron schedule — wire cron URL in production when deploying

## Example

```
MONGODB_URI=mongodb+srv://USER:PASS@CLUSTER.mongodb.net/parwaz
BETTER_AUTH_SECRET=generate-a-long-random-string
BETTER_AUTH_URL=http://localhost:3000
ADMIN_EMAILS=you@example.com
RESEND_API_KEY=re_xxxxxxxx
EMAIL_FROM=Parwaaz <onboarding@resend.dev>
CRON_SECRET=generate-another-long-secret
DEV_OTP_FILE=D:\dev-cache\parwaz\last-otp.txt
GEMINI_API_KEY=
OPENAI_API_KEY=
AI_CHAT_PROVIDER=openai
AI_CHAT_MODEL=gpt-4o-mini
AI_ANALYSIS_MODEL=gpt-4o-mini
AI_MONTHLY_BUDGET_USD=50
AI_FREE_VISITOR_DAILY=5
AI_FREE_STUDENT_DAILY=20
```

After setting Mongo, run: `npm run db:migrate`
