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

### 2. Better Auth
- `BETTER_AUTH_SECRET` — long random string (32+ chars). Generate: `openssl rand -base64 32`
- `BETTER_AUTH_URL` — `http://localhost:3000` in dev

### 3. Resend (email OTP + deadline alerts)
1. Create account at https://resend.com
2. Create an API key → `RESEND_API_KEY`
3. Verify a sending domain (or use onboarding sender) → `EMAIL_FROM` (also accepts `RESEND_FROM_EMAIL`)
4. Without `RESEND_API_KEY`, OTP is written to `DEV_OTP_FILE` and the server console (dev only).
5. Deadline alerts: set `CRON_SECRET`, then call  
   `GET /api/cron/deadline-alerts` with header `Authorization: Bearer <CRON_SECRET>`  
   (or `x-cron-secret`). Add `?dryRun=1` to list candidates without sending. Reminders fire at 30 / 14 / 7 days before shortlisted program or saved scholarship deadlines.

### 4. Admin allow-list
`ADMIN_EMAILS` — comma-separated **real** emails that get the admin role after OTP login (use an inbox you can open when Resend is on).

### 5. Google OAuth (optional)
`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — enables “Sign in with Google” on `/login` and `/signup`.
Redirect URI: `{BETTER_AUTH_URL}/api/auth/callback/google`

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
5. Without `GEMINI_API_KEY` (and without OpenAI when selected), Ask Parwaz returns an error telling you to set the key.

## Later (leave empty for now)
- PostHog, Vercel Cron schedule — wire cron URL in production when deploying

## Example

```
MONGODB_URI=mongodb+srv://USER:PASS@CLUSTER.mongodb.net/parwaz
BETTER_AUTH_SECRET=generate-a-long-random-string
BETTER_AUTH_URL=http://localhost:3000
ADMIN_EMAILS=you@example.com
RESEND_API_KEY=re_xxxxxxxx
EMAIL_FROM=Parwaz <onboarding@resend.dev>
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
