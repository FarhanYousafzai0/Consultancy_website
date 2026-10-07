import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { admin, emailOTP } from "better-auth/plugins";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Resend } from "resend";
import { getNativeDb } from "@/lib/db/connect";

function adminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

async function deliverOtp(email: string, otp: string, type: string) {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.EMAIL_FROM?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Parwaaz <onboarding@resend.dev>";
  const replyTo = process.env.RESEND_REPLY_TO_EMAIL?.trim();

  if (resendKey) {
    const resend = new Resend(resendKey);
    const result = await resend.emails.send({
      from,
      to: email,
      ...(replyTo ? { replyTo } : {}),
      subject: "Your Parwaaz sign-in code",
      text: `Your one-time code is ${otp}. It expires in 10 minutes.\n\nType: ${type}`,
    });
    if (result.error) {
      console.error("[auth] Resend error:", result.error);
      throw new Error(result.error.message || "Failed to send OTP email");
    }
    console.info(`[auth] OTP emailed to ${email} via Resend (${result.data?.id ?? "ok"})`);
    return;
  }

  const file =
    process.env.DEV_OTP_FILE?.trim() || "D:\\dev-cache\\parwaz\\last-otp.txt";
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(
    file,
    `Parwaaz OTP for ${email}: ${otp}\nType: ${type}\nExpires in 10 minutes.\n`,
    "utf8"
  );
  console.info(`[auth] OTP for ${email}: ${otp} (also written to ${file})`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let authPromise: Promise<any> | null = null;

export async function getAuth() {
  if (!authPromise) {
    authPromise = (async () => {
      const db = await getNativeDb();
      return betterAuth({
        database: mongodbAdapter(db),
        baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
        secret: process.env.BETTER_AUTH_SECRET,
        emailAndPassword: {
          enabled: false,
        },
        socialProviders: {
          ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
            ? {
                google: {
                  clientId: process.env.GOOGLE_CLIENT_ID,
                  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                },
              }
            : {}),
        },
        plugins: [
          emailOTP({
            expiresIn: 600,
            async sendVerificationOTP({ email, otp, type }) {
              void deliverOtp(email, otp, type);
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
