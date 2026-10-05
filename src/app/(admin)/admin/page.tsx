import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export default async function AdminIndexPage() {
  const session = await getSession();
  redirect(session?.role === "admin" ? "/admin/programs" : "/admin/login");
}
