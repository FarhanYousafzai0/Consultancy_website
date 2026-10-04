"use client";

import type { ReactNode } from "react";
import { ArrowLeft } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

type StepShellProps = {
  step: number;
  total: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onBack?: () => void;
  onContinue?: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
};

export function StepShell({
  step,
  total,
  title,
  subtitle,
  children,
  onBack,
  onContinue,
  continueLabel = "Continue",
  continueDisabled,
}: StepShellProps) {
  const progress = (step / total) * 100;

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-40 pt-4 md:px-6 md:pb-16 md:pt-8">
      <div className="mb-6">
        <div className="flex items-center justify-between gap-3">
          <p className="section-label">Eligibility check</p>
          <p className="font-mono text-xs text-muted-foreground">
            {step} of {total}
          </p>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <h1 className="text-2xl font-extrabold tracking-[-0.03em] md:text-3xl">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          {subtitle}
        </p>
      ) : null}

      <div className="mt-6 space-y-3">{children}</div>

      <div className="fixed inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-30 border-t border-muted bg-background/95 px-4 py-3 backdrop-blur md:static md:mt-8 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          {onBack ? (
            <Button type="button" variant="outline" onClick={onBack}>
              <ArrowLeft />
              Back
            </Button>
          ) : null}
          {onContinue ? (
            <Button
              type="button"
              className="ml-auto"
              disabled={continueDisabled}
              onClick={onContinue}
            >
              {continueLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
