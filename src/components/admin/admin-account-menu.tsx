"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, SignOut, User } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { dicebearAvatarUrl } from "@/lib/avatar/dicebear";
import { authClient } from "@/lib/auth/auth-client";

export function AdminAccountMenu({ email, name: providedName, compact = false }: { email: string; name?: string; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const name = providedName || email.split("@")[0] || "Admin";
  const avatarUrl = dicebearAvatarUrl(email, { size: 96 });

  async function signOut() {
    await authClient.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const trigger = compact ? (
    <DialogTrigger asChild>
      <button
        type="button"
        className="size-9 shrink-0 overflow-hidden rounded-full ring-1 ring-border hover:ring-forest/40"
        aria-label="Open admin account details"
      >
        <img src={avatarUrl} alt="" width={36} height={36} className="size-9 rounded-full bg-primary-200" />
      </button>
    </DialogTrigger>
  ) : (
    <DialogTrigger asChild>
      <button
        type="button"
        className="group flex min-w-0 flex-1 items-center gap-2.5 rounded-2xl p-1.5 text-left transition-colors hover:bg-muted"
        aria-label="Open admin account details"
      >
        <img src={avatarUrl} alt="" width={40} height={40} className="size-10 shrink-0 rounded-full bg-primary-200" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold capitalize">{name}</span>
          <span className="block truncate text-xs text-muted-foreground">{email}</span>
        </span>
      </button>
    </DialogTrigger>
  );

  return (
    <div className={compact ? undefined : "flex items-center gap-2"}>
      <Dialog open={open} onOpenChange={setOpen}>
        {trigger}
        <DialogContent className="gap-0 overflow-hidden rounded-3xl border-border p-0 sm:max-w-md">
          <div className="border-b border-border bg-muted/40 px-6 pb-5 pt-8">
            <DialogHeader className="items-center text-center sm:items-center sm:text-center">
              <img src={dicebearAvatarUrl(email, { size: 128 })} alt="" width={72} height={72} className="mx-auto size-[72px] rounded-full bg-primary-200 ring-2 ring-white shadow-card" />
              <DialogTitle className="mt-3 text-xl font-extrabold capitalize">{name}</DialogTitle>
              <DialogDescription className="truncate">{email}</DialogDescription>
              <div className="mt-3 flex justify-center"><Badge variant="verified">Administrator</Badge></div>
            </DialogHeader>
          </div>
          <div className="space-y-3 px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Admin account</p>
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-muted/50 px-3.5 py-3 text-sm">
              <span className="inline-flex items-center gap-2 font-medium"><ShieldCheck className="size-4 text-forest" /> Access</span>
              <span className="font-semibold">Full admin access</span>
            </div>
            <Button type="button" variant="outline" className="w-full justify-start" onClick={() => setOpen(false)}>
              <User className="size-4" /> Profile settings coming soon
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {!compact ? (
        <button type="button" title="Sign out" aria-label="Sign out" onClick={signOut} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-error-soft px-3 text-xs font-semibold text-destructive transition-colors hover:bg-[#f8d5d5]">
          <SignOut className="size-3.5" /> Sign out
        </button>
      ) : null}
    </div>
  );
}

