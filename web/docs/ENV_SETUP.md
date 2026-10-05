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

### 3. Resend (email OTP)
1. Create account at https://resend.com
2. Create an API key → `RESEND_API_KEY`
3. Verify a sending domain (or use onboarding sender) → `EMAIL_FROM`
4. Without `RESEND_API_KEY`, OTP is written to `DEV_OTP_FILE` and the server console (dev only).

### 4. Admin allow-list
`ADMIN_EMAILS` — comma-separated **real** emails that get the admin role after OTP login (use an inbox you can open when Resend is on).

## Later (leave empty for now)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — student Google sign-in
- PostHog, Gemini, Vercel — not required for Programs search

## Example

```
MONGODB_URI=mongodb+srv://USER:PASS@CLUSTER.mongodb.net/parwaz
# or standard (non-SRV) URI if DNS SRV fails
# or: MONGODB_URI=memory
BETTER_AUTH_SECRET=generate-a-long-random-string
BETTER_AUTH_URL=http://localhost:3000
ADMIN_EMAILS=you@example.com
RESEND_API_KEY=re_xxxxxxxx
EMAIL_FROM=Parwaz <onboarding@resend.dev>
DEV_OTP_FILE=D:\dev-cache\parwaz\last-otp.txt
```
