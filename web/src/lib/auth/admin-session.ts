import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "parwaz_admin";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function secret() {
  return (
    process.env.BETTER_AUTH_SECRET?.trim() ||
    process.env.ADMIN_SECRET?.trim() ||
    ""
  );
}

export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export type AdminSession = {
  email: string;
  role: "admin";
  exp: number;
};

export function createAdminToken(email: string) {
  const session: AdminSession = {
    email: email.toLowerCase(),
    role: "admin",
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS,
  };
  const body = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifyAdminToken(token: string | undefined): AdminSession | null {
  if (!token || !secret()) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const session = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as AdminSession;
    if (session.role !== "admin") return null;
    if (session.exp < Math.floor(Date.now() / 1000)) return null;
    if (!adminEmails().includes(session.email.toLowerCase())) return null;
    return session;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const jar = await cookies();
  return verifyAdminToken(jar.get(COOKIE)?.value);
}

export async function setAdminSession(email: string) {
  const jar = await cookies();
  jar.set(COOKIE, createAdminToken(email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export function adminAuthReady() {
  return Boolean(secret()) && adminEmails().length > 0;
}
