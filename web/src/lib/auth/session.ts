import { headers } from "next/headers";
import { getAuth, isAdminEmail } from "@/lib/auth/auth";

export type AppSession = {
  email: string;
  name: string;
  role: "admin" | "user";
  userId: string;
};

export async function getSession(): Promise<AppSession | null> {
  const auth = await getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.email) return null;

  const role =
    (session.user as { role?: string }).role === "admin" ||
    isAdminEmail(session.user.email)
      ? "admin"
      : "user";

  return {
    email: session.user.email,
    name: session.user.name || session.user.email,
    role,
    userId: session.user.id,
  };
}

export async function requireAdminSession(): Promise<AppSession> {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireUserSession(): Promise<AppSession> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}
