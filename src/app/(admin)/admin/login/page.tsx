import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import AdminLoginClient from "./login-client";

export const metadata = {
  title: "Admin login",
};

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session?.role === "admin") {
    redirect("/admin/programs");
  }
  return <AdminLoginClient />;
}
