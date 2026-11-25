import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { admin, emailOTP } from "better-auth/plugins";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Resend } from "resend";
import { getNativeDb } from "@/lib/db/connect";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/constants";

export { MIN_PASSWORD_LENGTH };

function adminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function withHttps(host: string | undefined) {
  const value = host?.trim();
  if (!value) return undefined;
  return value.startsWith("http") ? value : `https://${value}`;
}

/**
 * The public address of the site. Google sends people back to
 * `${baseURL}/api/auth/callback/google`, so on the live site this must be the
 * live domain — never localhost.
 */
export function authBaseUrl() {
  return (
    process.env.BETTER_AUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    withHttps(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

/** The www and bare-domain twin of an origin, so both are accepted. */
function wwwTwin(origin: string) {
  try {
    const url = new URL(origin);
    if (url.hostname === "localhost") return undefined;
    url.hostname = url.hostname.startsWith("www.")
      ? url.hostname.slice(4)
      : `www.${url.hostname}`;
    return url.origin;
  } catch {
    return undefined;
  }
}

function trustedOrigins() {
  const base = authBaseUrl();
  const extra = (process.env.BETTER_AUTH_TRUSTED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  const origins = [
    base,
    wwwTwin(base),
    withHttps(process.env.NEXT_PUBLIC_SITE_URL),
    withHttps(process.env.VERCEL_PROJECT_PRODUCTION_URL),
    withHttps(process.env.VERCEL_BRANCH_URL),
    withHttps(process.env.VERCEL_URL),
    ...extra,
  ];
  return [...new Set(origins.filter((o): o is string => Boolean(o)))];
}

async function writeDevOtpFile(email: string, otp: string, type: string) {
  const file =
    process.env.DEV_OTP_FILE?.trim() ||
    (process.env.NODE_ENV === "production"
      ? ""
      : "D:\dev-cache\parwaz\last-otp.txt");
  if (!file) return;
  try {
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(
      file,
      `Parwaaz OTP for ${email}: ${otp}\nType: ${type}\nExpires in 10 minutes.\n`,
      "utf8"
    );
    console.info(`[auth] OTP for ${email}: ${otp} (also written to ${file})`);
  } catch (error) {
    console.warn("[auth] Could not write DEV OTP file:", error);
  }
}

function otpEmail(otp: string, type: string) {
  if (type === "forget-password") {
    return {
      subject: "Reset your Parwaaz password",
      text: `Your password reset code is ${otp}. It expires in 10 minutes.\n\nIf you did not ask to reset your password, you can ignore this email.`,
    };
  }
  return {
    subject: "Your Parwaaz sign-in code",
    text: `Your sign-in code is ${otp}. It expires in 10 minutes.\n\nIf you did not try to sign in, you can ignore this email.`,
  };
}

async function deliverOtp(email: string, otp: string, type: string) {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.EMAIL_FROM?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Parwaaz <onboarding@resend.dev>";
  const replyTo = process.env.RESEND_REPLY_TO_EMAIL?.trim();

  if (!resendKey) {
    if (process.env.NODE_ENV === "production") {
      // Without an email service the code can never reach the student.
      throw new Error("Email sending is not configured. Please try again later.");
    }
    await writeDevOtpFile(email, otp, type);
    return;
  }

  const resend = new Resend(resendKey);
  const result = await resend.emails.send({
    from,
    to: email,
    ...(replyTo ? { replyTo } : {}),
    ...otpEmail(otp, type),
  });
  if (result.error) {
    console.error("[auth] Resend error:", result.error);
    throw new Error("We could not send the code. Check the email address and try again.");
  }
  console.info(`[auth] OTP emailed to ${email} via Resend (${result.data?.id ?? "ok"})`);
  await writeDevOtpFile(email, otp, type);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let authPromise: Promise<any> | null = null;

export async function getAuth() {
  if (!authPromise) {
    authPromise = (async () => {
      const db = await getNativeDb();
      return betterAuth({
        database: mongodbAdapter(db),
        baseURL: authBaseUrl(),
        secret: process.env.BETTER_AUTH_SECRET,
        trustedOrigins: trustedOrigins(),
        emailAndPassword: {
          enabled: true,
          // Accounts are created by email code, Google or the admin seed.
          // A password is added afterwards from a verified session.
          disableSignUp: true,
          minPasswordLength: MIN_PASSWORD_LENGTH,
        },
        account: {
          accountLinking: {
            enabled: true,
            trustedProviders: ["google"],
          },
        },
        socialProviders: {
          ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
            ? {
                google: {
                  clientId: process.env.GOOGLE_CLIENT_ID,
                  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                  prompt: "select_account" as const,
                },
              }
            : {}),
        },
        plugins: [
          emailOTP({
            expiresIn: 600,
            // Awaited on purpose: on Vercel a fire-and-forget send can be cut
            // off when the function returns, so the email never leaves.
            async sendVerificationOTP({ email, otp, type }) {
              await deliverOtp(email, otp, type);
            },
          }),
          admin({
            defaultRole: "user",
            adminRoles: ["admin"],
          }),
        ],
        databaseHooks: {
          user: {
            create: {
              async before(user) {
                const emails = adminEmails();
                if (emails.includes(user.email.toLowerCase())) {
                  return {
                    data: {
                      ...user,
                      role: "admin",
                    },
                  };
                }
                return { data: user };
              },
            },
          },
        },
      });
    })();
  }
  return authPromise;
}

export function isAdminEmail(email: string) {
  return adminEmails().includes(email.toLowerCase());
}

export { adminEmails };
