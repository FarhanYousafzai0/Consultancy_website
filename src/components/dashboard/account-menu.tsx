"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CaretRight,
  Coin,
  SignOut,
  Sparkle,
  User,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { dicebearAvatarUrl } from "@/lib/avatar/dicebear";
import { whatsappLink } from "@/lib/site";
import { cn } from "cn";

export type AccountMenuProps = {
  name: string;
  email: string;
  userId: string;
  aiCredits: number;
  sopReviewUnlocked: boolean;
  freeAnalysisUsed: boolean;
  signOutAction: () => Promise<void>;
  /** Compact trigger for the mobile top bar */
  compact?: boolean;
};

export function AccountMenu({
  name,
  email,
  userId,
  aiCredits,
  sopReviewUnlocked,
  freeAnalysisUsed,
  signOutAction,
  compact = false,
}: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const seed = userId || email;
  const avatarUrl = dicebearAvatarUrl(seed, { size: 96 });
  const isPaid = aiCredits > 0 || sopReviewUnlocked;
  const firstName = name.split(" ")[0] || "Student";

  const creditWhatsApp = whatsappLink(
    `Hi! I'm ${name} (${email}). I'd like to buy AI credits / unlock paid services on Parwaaz.`
  );

  if (compact) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="size-9 shrink-0 cursor-pointer overflow-hidden rounded-full ring-1 ring-border hover:ring-forest/40"
            aria-label="Open account details"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl}
              alt=""
              width={36}
              height={36}
              className="size-9 rounded-full bg-primary-200"
            />
          </button>
        </DialogTrigger>
        <AccountDialogBody
          name={name}
          email={email}
          seed={seed}
          isPaid={isPaid}
          aiCredits={aiCredits}
          sopReviewUnlocked={sopReviewUnlocked}
          freeAnalysisUsed={freeAnalysisUsed}
          creditWhatsApp={creditWhatsApp}
          onClose={() => setOpen(false)}
        />
      </Dialog>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="group flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-2xl p-1.5 text-left transition-colors hover:bg-muted"
            aria-label="Open account details"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl}
              alt=""
              width={40}
              height={40}
              className="size-10 shrink-0 rounded-full bg-primary-200"
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">
                {firstName}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {email}
              </span>
            </span>
          </button>
        </DialogTrigger>
        <AccountDialogBody
          name={name}
          email={email}
          seed={seed}
          isPaid={isPaid}
          aiCredits={aiCredits}
          sopReviewUnlocked={sopReviewUnlocked}
          freeAnalysisUsed={freeAnalysisUsed}
          creditWhatsApp={creditWhatsApp}
          onClose={() => setOpen(false)}
        />
      </Dialog>

      <form action={signOutAction} className="shrink-0">
        <button
          type="submit"
          title="Sign out"
          aria-label="Sign out"
          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-error-soft px-3 text-xs font-semibold text-destructive transition-colors hover:bg-[#f8d5d5]"
        >
          <SignOut className="size-3.5" />
          Sign out
        </button>
      </form>
    </div>
  );
}

function AccountDialogBody({
  name,
  email,
  seed,
  isPaid,
  aiCredits,
  sopReviewUnlocked,
  freeAnalysisUsed,
  creditWhatsApp,
  onClose,
}: {
  name: string;
  email: string;
  seed: string;
  isPaid: boolean;
  aiCredits: number;
  sopReviewUnlocked: boolean;
  freeAnalysisUsed: boolean;
  creditWhatsApp: string;
  onClose: () => void;
}) {
  return (
    <DialogContent className="gap-0 overflow-hidden rounded-3xl border-border p-0 sm:max-w-md">
      <div className="border-b border-border bg-muted/40 px-6 pb-5 pt-8">
        <DialogHeader className="items-center text-center sm:items-center sm:text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={dicebearAvatarUrl(seed, { size: 128 })}
            alt=""
            width={72}
            height={72}
            className="mx-auto size-[72px] rounded-full bg-primary-200 ring-2 ring-white shadow-card"
          />
          <DialogTitle className="mt-3 text-xl font-extrabold tracking-[-0.02em]">
            {name}
          </DialogTitle>
          <DialogDescription className="truncate">{email}</DialogDescription>
          <div className="mt-3 flex justify-center">
            <Badge variant={isPaid ? "verified" : "neutral"}>
              {isPaid ? "Paid" : "Free"}
            </Badge>
          </div>
        </DialogHeader>
      </div>

      <div className="space-y-3 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Account
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center justify-between gap-3 rounded-2xl bg-muted/50 px-3.5 py-3">
            <span className="inline-flex items-center gap-2 font-medium">
              <Sparkle className="size-4 text-forest" />
              Plan
            </span>
            <span className="font-semibold">
              {isPaid ? "Paid services" : "Free forever"}
            </span>
          </li>
          <li className="flex items-center justify-between gap-3 rounded-2xl bg-muted/50 px-3.5 py-3">
            <span className="inline-flex items-center gap-2 font-medium">
              <Coin className="size-4 text-forest" />
              AI credits
            </span>
            <span className="font-semibold">{aiCredits}</span>
          </li>
          <li className="flex items-center justify-between gap-3 rounded-2xl bg-muted/50 px-3.5 py-3">
            <span className="font-medium">SOP review</span>
            <span className="font-semibold text-muted-foreground">
              {sopReviewUnlocked ? "Unlocked" : "Locked"}
            </span>
          </li>
          <li className="flex items-center justify-between gap-3 rounded-2xl bg-muted/50 px-3.5 py-3">
            <span className="font-medium">Free profile analysis</span>
            <span className="font-semibold text-muted-foreground">
              {freeAnalysisUsed ? "Used" : "Available"}
            </span>
          </li>
        </ul>

        <p className="text-xs leading-relaxed text-muted-foreground">
          Eligibility check and programme matching stay free. Credits unlock
          extra AI advisor and review tools — buy via WhatsApp.
        </p>

        <div className="flex flex-col gap-2 pt-1">
          <Button asChild variant="outline" className="justify-between">
            <Link href="/dashboard/profile" onClick={onClose}>
              <span className="inline-flex items-center gap-2">
                <User className="size-4" />
                Edit profile
              </span>
              <CaretRight className="size-4" />
            </Link>
          </Button>
          {!isPaid || aiCredits < 1 ? (
            <Button asChild variant="whatsapp" className="justify-center">
              <a
                href={creditWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
              >
                Get credits on WhatsApp
              </a>
            </Button>
          ) : null}
        </div>
      </div>
    </DialogContent>
  );
}
