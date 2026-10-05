"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SignOut } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";

export function AdminHeader({
  title,
  email,
}: {
  title: string;
  email: string;
}) {
  const router = useRouter();

  async function signOut() {
    await authClient.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
        <div>
          <p className="section-label">Admin</p>
          <h1 className="mt-1 text-xl font-extrabold tracking-[-0.03em]">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/programs">Programs</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/programs/new">Add program</Link>
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={signOut}>
            <SignOut />
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
