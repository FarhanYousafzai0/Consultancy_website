"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowClockwise,
  ArrowRight,
  CheckCircle,
  Info,
  ListChecks,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import {
  evaluateEligibility,
  isProfileComplete,
  labelForEnglish,
  labelForField,
  labelForGerman,
  labelForGoal,
  labelForGradeSystem,
  labelForQualification,
  selectAnswers,
  useEligibilityHydrated,
  useEligibilityStore,
  whatsappSummary,
} from "@/lib/eligibility";
import { whatsappLink } from "@/lib/site";
import { MatchesPanel } from "@/components/check/matches-panel";

export function ResultView() {
  const router = useRouter();
  const store = useEligibilityStore();
  const hydrated = useEligibilityHydrated();
  const answers = selectAnswers(store);
  const complete = isProfileComplete(answers);

  useEffect(() => {
    if (hydrated && !complete) {
      router.replace("/check");
    }
  }, [hydrated, complete, router]);

  useEffect(() => {
    if (!hydrated || !complete || answers.goal !== "ausbildung") return;
    try {
      const key = "parwaz_ausbildung_check_counted";
      if (sessionStorage.getItem(key) === "1") return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* ignore */
    }
    void fetch("/api/ausbildung/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "ausbildung_check_completed" }),
    }).catch(() => {});
  }, [hydrated, complete, answers.goal]);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-sm text-muted-foreground">
        Loading your result…
      </div>
    );
  }

  if (!complete) {
    return null;
  }

  const result = evaluateEligibility(answers);
  if (!result) {
    return null;
  }

  const tone =
    result.kind === "masters_eligible" ||
    result.kind === "bachelors_likely_direct" ||
    result.kind === "ausbildung_ready"
      ? "good"
      : result.kind === "cannot_judge" ||
          result.kind === "ausbildung_need_german" ||
          result.kind === "masters_not_enough"
        ? "warn"
        : "info";

  return (
    <div className="mx-auto max-w-2xl px-4 pb-28 pt-4 md:px-6 md:pb-16 md:pt-8">
      <p className="section-label">Your result</p>
      <div
        className={
          tone === "good"
            ? "mt-4 rounded-3xl bg-primary p-6 md:p-8"
            : tone === "warn"
              ? "mt-4 rounded-3xl bg-amber-soft p-6 md:p-8"
              : "mt-4 rounded-3xl bg-muted p-6 md:p-8"
        }
      >
        <Badge
          variant={
            tone === "good"
              ? "verified"
              : tone === "warn"
                ? "predicted"
                : "neutral"
          }
          className={tone === "good" ? "bg-white" : undefined}
        >
          <CheckCircle weight="bold" />
          Pakistan path guidance
        </Badge>
        <h1 className="mt-4 text-2xl font-extrabold tracking-[-0.03em] md:text-4xl">
          {result.headline}
        </h1>
        <p className="mt-3 text-sm text-foreground/75">{result.disclaimer}</p>
      </div>

      <section className="mt-8 rounded-2xl bg-white p-6 shadow-card">
        <h2 className="text-lg font-bold">Why this answer</h2>
        <ul className="mt-4 space-y-3">
          {result.reasons.map((reason) => (
            <li key={reason} className="flex gap-3 text-sm leading-relaxed">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-ink" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </section>

      {result.grade ? (
        <section className="mt-4 rounded-2xl bg-white p-6 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">German grade (converted)</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Modified Bavarian formula · 1.0 is best, 4.0 is the weakest pass
              </p>
            </div>
            <Badge
              variant={
                result.grade.band === "strong" ||
                result.grade.band === "meets_many"
                  ? "match"
                  : result.grade.band === "limited_public"
                    ? "reach"
                    : "error"
              }
            >
              {result.grade.bandLabel}
            </Badge>
          </div>
          <p className="mt-4 font-mono text-5xl font-bold tracking-[-0.04em]">
            {result.grade.germanGrade.toFixed(2)}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {result.grade.bandNote}
          </p>
          {answers.gradeSystem && answers.gradeValue != null ? (
            <p className="mt-3 text-sm">
              From{" "}
              {answers.gradeSystem === "percentage"
                ? `${answers.gradeValue}%`
                : `${answers.gradeValue} ${labelForGradeSystem(answers.gradeSystem)}`}
              {answers.gradeSystem === "percentage" &&
              answers.percentagePassMark != null
                ? ` · ${answers.percentagePassMark}% pass mark`
                : ""}
            </p>
          ) : null}
        </section>
      ) : null}

      {result.englishNote ? (
        <section className="mt-4 flex gap-3 rounded-2xl bg-slate-soft p-5 text-sm text-slate-ink">
          <Info className="mt-0.5 size-5 shrink-0" />
          <p>{result.englishNote}</p>
        </section>
      ) : null}

      <section className="mt-4 rounded-2xl bg-white p-6 shadow-card">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <ListChecks className="size-5" />
          Next steps
        </h2>
        <ol className="mt-4 space-y-3">
          {result.nextSteps.map((step, i) => (
            <li key={step} className="flex gap-3 text-sm leading-relaxed">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-muted font-mono text-xs font-semibold">
                {i + 1}
              </span>
              <span className="pt-1">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <MatchesPanel answers={answers} />

      <section className="mt-4 rounded-2xl bg-white p-6 shadow-card">
        <h2 className="text-lg font-bold">Your answers</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Goal</dt>
            <dd className="font-semibold">
              {answers.goal ? labelForGoal(answers.goal) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Qualification</dt>
            <dd className="font-semibold">
              {answers.goal && answers.qualification
                ? labelForQualification(answers.goal, answers.qualification)
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Field</dt>
            <dd className="font-semibold">
              {answers.goal && answers.field
                ? labelForField(answers.goal, answers.field)
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">English</dt>
            <dd className="font-semibold">
              {answers.englishTest
                ? labelForEnglish(answers.englishTest, answers.englishScore)
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">German</dt>
            <dd className="font-semibold">
              {answers.germanLevel
                ? labelForGerman(answers.germanLevel)
                : "—"}
            </dd>
          </div>
        </dl>
      </section>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {result.showConsultant ? (
          <Button asChild size="lg" variant="whatsapp">
            <Link
              href={whatsappLink(whatsappSummary(answers))}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon className="text-white" />
              Let&apos;s have a chat!
            </Link>
          </Button>
        ) : null}
        <Button
          size="lg"
          variant="outline"
          onClick={() => {
            store.reset();
            router.push("/check");
          }}
        >
          <ArrowClockwise />
          Start again
        </Button>
      </div>

      <section className="mt-6 rounded-2xl bg-ink p-6 text-white">
        <h2 className="text-lg font-bold">Save my results</h2>
        <p className="mt-2 text-sm text-white/70">
          Create a free account to keep your matches, build a shortlist, and
          pick up where you left off on any device.
        </p>
        <Button asChild size="lg" className="mt-5 pr-2">
          <Link href="/signup?next=/dashboard">
            Save my results
            <span className="grid size-9 place-items-center rounded-full bg-ink text-primary">
              <ArrowRight weight="bold" className="size-4" />
            </span>
          </Link>
        </Button>
      </section>
    </div>
  );
}
