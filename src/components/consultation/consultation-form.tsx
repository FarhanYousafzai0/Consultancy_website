"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  Clock,
  GraduationCap,
  Lock,
  PencilSimple,
  Target,
  Translate,
  User,
  Wallet,
  ChatCircle,
} from "@phosphor-icons/react";
import { cn } from "cn";
import { motion, useReducedMotion } from "motion/react";
import { StepRail } from "@/components/consultation/step-rail";

// Enter-only step transitions: a keyed remount slides in from the direction of travel.
// (No exit animation — "wait" mode can leave the form blank if an exit stalls.)
const slide = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 24 }),
  center: { opacity: 1, x: 0 },
};
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { useEligibilityHydrated, useEligibilityStore } from "@/lib/eligibility";
import {
  applicationStageOptions,
  backlogOptions,
  contactChannelOptions,
  contactTimeOptions,
  degreeLevelOptions,
  degreeStatusOptions,
  englishTestOptions,
  fieldOptions,
  fundingOptions,
  fundingSourceOptions,
  germanLevelOptions,
  gmatGreOptions,
  gradeSystemOptions,
  hecOptions,
  passportOptions,
  qualificationOptions,
  referralOptions,
  refusalOptions,
  serviceOptions,
  stepSchemas,
  teachingLanguageOptions,
  universityTypeOptions,
  upcomingIntakes,
  workExperienceOptions,
  type ConsultationInput,
} from "@/lib/consultation/schema";
import { summarySections } from "@/lib/consultation/summary";
import {
  cityOptions,
  degreeGroups,
  ieltsBands,
  universityGroups,
  yearOptions,
} from "@/lib/consultation/lists";
import { Combobox } from "@/components/ui/combobox";

const THIS_YEAR = new Date().getFullYear();
const birthYears = yearOptions(1970, THIS_YEAR - 16);
const graduationYears = yearOptions(1990, THIS_YEAR + 4);
import { whatsappLink } from "@/lib/site";

type Draft = {
  [K in keyof ConsultationInput]?: ConsultationInput[K] | null;
};

const DRAFT_KEY = "parwaz-consultation-draft";

const STEPS = [
  {
    key: "service",
    short: "Goal",
    icon: Target,
    title: "What can we help you with?",
    subtitle: "Pick everything that applies. You can explain more later.",
    why: "The consultant knows what you want before they open your profile.",
  },
  {
    key: "about",
    short: "About you",
    icon: User,
    title: "Tell us about yourself",
    subtitle: "So the right consultant can reach you.",
    why: "We reply on WhatsApp first — most students in Pakistan prefer it.",
  },
  {
    key: "academics",
    short: "Academics",
    icon: GraduationCap,
    title: "Your academic background",
    subtitle: "German universities decide mostly on your bachelor's — this is the core of your profile.",
    why: "Grade, subject fit and 16 years of education decide which master's programmes are realistic.",
  },
  {
    key: "tests",
    short: "Tests & work",
    icon: Translate,
    title: "Language tests & experience",
    subtitle: "Estimates are fine if you haven't taken a test yet.",
    why: "English scores filter programmes; work experience opens scholarships like DAAD EPOS.",
  },
  {
    key: "plan",
    short: "Plan & funding",
    icon: Wallet,
    title: "Your plan and funding",
    subtitle: "Be honest — it helps us give advice that actually works for you.",
    why: "Funding and visa history change which route and timeline we recommend.",
  },
  {
    key: "contact",
    short: "Contact",
    icon: ChatCircle,
    title: "How should we reach you?",
    subtitle: "Pick the channel and time that's easiest for you.",
    why: "We only use your details to respond to this request.",
  },
  {
    key: "review",
    short: "Review",
    icon: CheckCircle,
    title: "Check before sending",
    subtitle: "Edit any section if something's wrong.",
    why: "A complete profile means a useful first call, not a questionnaire.",
  },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

const qualificationFromCheck: Record<string, ConsultationInput["qualification"]> = {
  bs_4year: "bs_4year",
  ba_bsc_2year: "ba_bsc_2year",
  ba_bsc_2year_plus_masters: "ba_bsc_2year_plus_masters",
};

const numOrNull = (v: string) => {
  if (v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export function ConsultationForm({
  initialName,
  initialEmail,
  initialService,
}: {
  initialName?: string | null;
  initialEmail?: string | null;
  initialService?: string | null;
}) {
  const intakes = useMemo(() => upcomingIntakes(), []);
  const [step, setStep] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [draft, setDraft] = useState<Draft>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [direction, setDirection] = useState(1);
  const reduceMotion = useReducedMotion();

  const check = useEligibilityStore();
  const checkHydrated = useEligibilityHydrated();

  // Load saved draft once, then fill gaps from the eligibility check + session.
  useEffect(() => {
    if (!checkHydrated || loaded) return;
    let saved: Draft = {};
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) saved = JSON.parse(raw) as Draft;
    } catch {
      /* private mode etc. */
    }
    const fromCheck: Draft = {};
    if (check.qualification && qualificationFromCheck[check.qualification]) {
      fromCheck.qualification = qualificationFromCheck[check.qualification];
    }
    if (check.gradeSystem) fromCheck.gradeSystem = check.gradeSystem as ConsultationInput["gradeSystem"];
    if (check.gradeValue != null) fromCheck.gradeValue = check.gradeValue;
    if (check.field) fromCheck.fields = [check.field as ConsultationInput["fields"][number]];
    if (check.englishTest) fromCheck.englishTest = check.englishTest as ConsultationInput["englishTest"];
    if (check.englishScore != null) fromCheck.englishScore = check.englishScore;
    if (check.germanLevel) fromCheck.germanLevel = check.germanLevel as ConsultationInput["germanLevel"];

    const service = serviceOptions.find((s) => s.value === initialService)?.value;
    const base: Draft = {
      degreeLevel: "master",
      services: service ? [service] : undefined,
      fullName: initialName ?? undefined,
      email: initialEmail ?? undefined,
      contactChannel: "whatsapp",
      ...fromCheck,
    };
    const merged = { ...base } as Record<string, unknown>;
    for (const [k, v] of Object.entries(saved)) {
      if (v !== undefined && v !== null && v !== "") merged[k] = v;
    }
    merged.consent = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from browser storage
    setDraft(merged as Draft);
    setLoaded(true);
  }, [checkHydrated, loaded, check, initialEmail, initialName, initialService]);

  useEffect(() => {
    if (!loaded || reference) return;
    try {
      const { consent: _c, ...rest } = draft;
      void _c;
      localStorage.setItem(DRAFT_KEY, JSON.stringify(rest));
    } catch {
      /* ignore */
    }
  }, [draft, loaded, reference]);

  const set = <K extends keyof ConsultationInput>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setErrors((e) => {
      if (!e[key as string]) return e;
      const next = { ...e };
      delete next[key as string];
      return next;
    });
  };

  const toggleIn = <K extends "services" | "fields" | "fundingSources">(
    key: K,
    value: string,
    max?: number
  ) => {
    setDraft((d) => {
      const current = (d[key] as string[] | undefined) ?? [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : max && current.length >= max
          ? current
          : [...current, value];
      return { ...d, [key]: next };
    });
    setErrors((e) => {
      if (!e[key]) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
  };

  const goTo = (next: number) => {
    setDirection(next >= step ? 1 : -1);
    setStep(next);
    setMaxReached((m) => Math.max(m, next));
    requestAnimationFrame(() => {
      headingRef.current?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const validateStep = (key: StepKey): boolean => {
    if (key === "review") return true;
    const schema = stepSchemas[key];
    const result = schema.safeParse(draft, { reportInput: true });
    const errs: Record<string, string> = {};
    if (!result.success) {
      for (const issue of result.error.issues) {
        const path = String(issue.path[0] ?? "");
        if (path && !errs[path]) errs[path] = friendlyMessage(issue);
      }
    }
    if (key === "academics" && draft.gradeValue != null) {
      const max = draft.gradeSystem === "cgpa4" ? 4 : draft.gradeSystem === "cgpa5" ? 5 : 100;
      if (draft.gradeValue > max) errs.gradeValue = `Grade can't be above ${max}.`;
    }
    setErrors(errs);
    if (Object.keys(errs).length) {
      requestAnimationFrame(() => {
        document.querySelector<HTMLElement>("[data-field-error]")?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
      return false;
    }
    return true;
  };

  const next = () => {
    if (!validateStep(STEPS[step].key)) return;
    goTo(step + 1);
  };

  const submit = async () => {
    for (let i = 0; i < STEPS.length - 1; i++) {
      if (!validateStep(STEPS[i].key)) {
        goTo(i);
        return;
      }
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, website: honeypot }),
      });
      const data = (await res.json()) as { reference?: string; error?: string };
      if (!res.ok || !data.reference) {
        setSubmitError(data.error ?? "We could not save your request. Please try again.");
        return;
      }
      setReference(data.reference);
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setSubmitError("Network error. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (reference) {
    return <SuccessView reference={reference} name={draft.fullName ?? ""} channel={draft.contactChannel ?? "whatsapp"} />;
  }

  const current = STEPS[step];
  const progress = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 pb-40 pt-6 md:px-6 md:pb-16 md:pt-10 lg:grid-cols-[280px_1fr] lg:gap-12">
      {/* Sidebar — step list (desktop) */}
      <aside className="hidden lg:block">
        <div className="sticky top-28 space-y-6">
          <div>
            <p className="section-label">Consultation · Germany</p>
            <p className="mt-2 text-sm text-muted-foreground">About 5 minutes · saved as you go</p>
          </div>
          <StepRail steps={STEPS} current={step} maxReached={maxReached} onSelect={goTo} />
          <div className="overflow-hidden rounded-2xl bg-muted p-4 text-sm">
            <p className="font-semibold">Why we ask</p>
              <motion.p
                key={current.key}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-1 text-muted-foreground"
              >
                {current.why}
              </motion.p>
          </div>
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Lock className="mt-0.5 size-4 shrink-0" />
            <span>
              Your details stay private and are only used to answer this request. See our{" "}
              <Link href="/privacy" className="underline">privacy policy</Link>.
            </span>
          </div>
        </div>
      </aside>

      <section className="min-w-0">
        {/* Progress (mobile + desktop) */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-3">
            <p className="section-label lg:hidden">Consultation · Germany</p>
            <p className="ml-auto font-mono text-xs text-muted-foreground">
              Step {step + 1} of {STEPS.length} · {current.short}
            </p>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 140, damping: 22 }}
            />
          </div>
        </div>

          <motion.div
            key={`head-${current.key}`}
            custom={direction}
            variants={slide}
            initial="enter"
            animate="center"
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-extrabold tracking-[-0.03em] outline-none md:text-3xl">
              {current.title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">{current.subtitle}</p>
          </motion.div>

        {!loaded ? (
          <p className="mt-8 text-sm text-muted-foreground">Loading…</p>
        ) : (
          <form
            className="mt-8 space-y-8"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (current.key === "review") void submit();
              else next();
            }}
          >
            {/* Honeypot */}
            <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label>
                Website
                <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
              </label>
            </div>

            <motion.div
              key={current.key}
              custom={direction}
              variants={slide}
              initial="enter"
              animate="center"
              transition={{ duration: reduceMotion ? 0 : 0.26, ease: [0.22, 1, 0.36, 1], delay: reduceMotion ? 0 : 0.03 }}
              className="space-y-8"
            >
            {current.key === "service" ? (
              <>
                <Field label="I need help with" hint="Choose one or more" error={errors.services}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {serviceOptions.map((o) => (
                      <ChoiceCard
                        key={o.value}
                        multi
                        label={o.label}
                        description={o.description}
                        selected={draft.services?.includes(o.value) ?? false}
                        onSelect={() => toggleIn("services", o.value)}
                      />
                    ))}
                  </div>
                </Field>
                <Field label="Degree level" error={errors.degreeLevel}>
                  <Chips options={degreeLevelOptions} value={draft.degreeLevel} onChange={(v) => set("degreeLevel", v)} />
                  {draft.degreeLevel && draft.degreeLevel !== "master" ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      We specialise in master&apos;s admissions, but we&apos;ll still review your request and tell you honestly if we can help.
                    </p>
                  ) : null}
                </Field>
                <Field label="Target intake" hint="Winter semester starts October, summer starts April" error={errors.intake}>
                  <Chips options={intakes} value={draft.intake} onChange={(v) => set("intake", v)} />
                </Field>
              </>
            ) : null}

            {current.key === "about" ? (
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Full name" required error={errors.fullName} htmlFor="c-name" className="sm:col-span-2">
                  <TextInput id="c-name" autoComplete="name" value={draft.fullName ?? ""} onChange={(v) => set("fullName", v)} placeholder="As on your passport" invalid={!!errors.fullName} />
                </Field>
                <Field label="Email" required error={errors.email} htmlFor="c-email">
                  <TextInput id="c-email" type="email" autoComplete="email" value={draft.email ?? ""} onChange={(v) => set("email", v)} placeholder="you@example.com" invalid={!!errors.email} />
                </Field>
                <Field label="WhatsApp number" required error={errors.phone} htmlFor="c-phone">
                  <TextInput id="c-phone" type="tel" inputMode="tel" autoComplete="tel" value={draft.phone ?? ""} onChange={(v) => set("phone", v)} placeholder="+92 300 1234567" invalid={!!errors.phone} />
                </Field>
                <Field label="Current city" required error={errors.city} htmlFor="c-city">
                  <Combobox id="c-city" value={draft.city} onChange={(v) => set("city", v)} options={cityOptions} allowCustom placeholder="Choose your city" searchPlaceholder="Search cities…" invalid={!!errors.city} />
                </Field>
                <Field label="Year of birth" hint="Optional — some scholarships have age limits" error={errors.birthYear} htmlFor="c-birth">
                  <Combobox id="c-birth" value={draft.birthYear != null ? String(draft.birthYear) : null} onChange={(v) => set("birthYear", numOrNull(v))} options={birthYears} placeholder="Choose year" searchPlaceholder="Type a year…" invalid={!!errors.birthYear} />
                </Field>
              </div>
            ) : null}

            {current.key === "academics" ? (
              <>
                <Field label="Highest qualification" required error={errors.qualification}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {qualificationOptions.map((o) => (
                      <ChoiceCard key={o.value} label={o.label} selected={draft.qualification === o.value} onSelect={() => set("qualification", o.value)} />
                    ))}
                  </div>
                  {draft.qualification === "ba_bsc_2year" ? (
                    <p className="mt-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                      Most German master&apos;s programmes expect 16 years of education. A consultant will check which routes are open to you.
                    </p>
                  ) : null}
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Degree" required error={errors.degreeTitle} htmlFor="c-degree">
                    <Combobox id="c-degree" value={draft.degreeTitle} onChange={(v) => set("degreeTitle", v)} groups={degreeGroups} allowCustom placeholder="Choose your degree" searchPlaceholder="Search degrees, e.g. software…" invalid={!!errors.degreeTitle} />
                  </Field>
                  <Field label="University" required error={errors.university} htmlFor="c-uni">
                    <Combobox id="c-uni" value={draft.university} onChange={(v) => set("university", v)} groups={universityGroups} allowCustom placeholder="Choose your university" searchPlaceholder="Search universities, e.g. NUST…" invalid={!!errors.university} />
                  </Field>
                </div>
                <Field label="Degree status" required error={errors.degreeStatus}>
                  <Chips options={degreeStatusOptions} value={draft.degreeStatus} onChange={(v) => set("degreeStatus", v)} />
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label={draft.degreeStatus === "completed" ? "Graduation year" : "Expected graduation year"} required error={errors.graduationYear} htmlFor="c-grad">
                    <Combobox id="c-grad" value={draft.graduationYear != null ? String(draft.graduationYear) : null} onChange={(v) => set("graduationYear", numOrNull(v))} options={graduationYears} placeholder="Choose year" searchPlaceholder="Type a year…" invalid={!!errors.graduationYear} />
                  </Field>
                  <div />
                </div>
                <Field label="Grade" required error={errors.gradeSystem ?? errors.gradeValue}>
                  <Chips options={gradeSystemOptions} value={draft.gradeSystem} onChange={(v) => set("gradeSystem", v)} />
                  <div className="mt-3 max-w-[200px]">
                    <TextInput
                      aria-label="Grade value"
                      inputMode="decimal"
                      value={draft.gradeValue != null ? String(draft.gradeValue) : ""}
                      onChange={(v) => set("gradeValue", numOrNull(v))}
                      placeholder={draft.gradeSystem === "percentage" ? "e.g. 72" : "e.g. 3.1"}
                      invalid={!!errors.gradeValue}
                    />
                  </div>
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Failed / repeated courses" required error={errors.backlogs}>
                    <Chips options={backlogOptions} value={draft.backlogs} onChange={(v) => set("backlogs", v)} />
                  </Field>
                  <Field label="HEC degree attestation" required error={errors.hecAttestation}>
                    <Chips options={hecOptions} value={draft.hecAttestation} onChange={(v) => set("hecAttestation", v)} />
                  </Field>
                </div>
              </>
            ) : null}

            {current.key === "tests" ? (
              <>
                <Field label="English proficiency" required error={errors.englishTest ?? errors.englishScore}>
                  <Chips options={englishTestOptions} value={draft.englishTest} onChange={(v) => { set("englishTest", v); if (!["ielts", "toefl", "pte", "duolingo"].includes(v)) set("englishScore", null); }} />
                  {draft.englishTest && ["ielts", "toefl", "pte", "duolingo"].includes(draft.englishTest) ? (
                    <div className="mt-3 max-w-[220px]">
                      {draft.englishTest === "ielts" ? (
                        <Combobox aria-label="IELTS overall band" value={draft.englishScore != null ? draft.englishScore.toFixed(1) : null} onChange={(v) => set("englishScore", numOrNull(v))} options={ieltsBands} searchable={false} placeholder="Overall band" />
                      ) : (
                        <TextInput aria-label="English score" inputMode="decimal" value={draft.englishScore != null ? String(draft.englishScore) : ""} onChange={(v) => set("englishScore", numOrNull(v))} placeholder={draft.englishTest === "toefl" ? "Total, e.g. 90" : draft.englishTest === "pte" ? "Overall, e.g. 65" : "Overall, e.g. 115"} />
                      )}
                    </div>
                  ) : null}
                </Field>
                <Field label="German level" required error={errors.germanLevel}>
                  <Chips options={germanLevelOptions} value={draft.germanLevel} onChange={(v) => set("germanLevel", v)} />
                </Field>
                <Field label="GRE / GMAT" hint="Some business and engineering programmes ask for it" required error={errors.gmatGre}>
                  <Chips options={gmatGreOptions} value={draft.gmatGre} onChange={(v) => { set("gmatGre", v); if (v !== "gre" && v !== "gmat") set("gmatGreScore", null); }} />
                  {draft.gmatGre === "gre" || draft.gmatGre === "gmat" ? (
                    <div className="mt-3 max-w-[200px]">
                      <TextInput aria-label="GRE or GMAT score" inputMode="numeric" value={draft.gmatGreScore != null ? String(draft.gmatGreScore) : ""} onChange={(v) => set("gmatGreScore", numOrNull(v))} placeholder="Total score" />
                    </div>
                  ) : null}
                </Field>
                <Field label="Full-time work experience" required error={errors.workExperience}>
                  <Chips options={workExperienceOptions} value={draft.workExperience} onChange={(v) => set("workExperience", v)} />
                </Field>
                {draft.workExperience && draft.workExperience !== "none" ? (
                  <Field label="Current or last role" hint="Optional" htmlFor="c-role">
                    <TextInput id="c-role" value={draft.workRole ?? ""} onChange={(v) => set("workRole", v)} placeholder="e.g. Software Engineer at Systems Ltd" />
                  </Field>
                ) : null}
              </>
            ) : null}

            {current.key === "plan" ? (
              <>
                <Field label="Fields you want to study" hint="Up to three" required error={errors.fields}>
                  <div className="flex flex-wrap gap-2">
                    {fieldOptions.map((o) => (
                      <Chip key={o.value} label={o.label} selected={draft.fields?.includes(o.value) ?? false} onClick={() => toggleIn("fields", o.value, 3)} />
                    ))}
                  </div>
                </Field>
                <Field label="Programmes or universities in mind" hint="Optional" htmlFor="c-progs">
                  <textarea id="c-progs" rows={2} maxLength={400} value={draft.targetProgrammes ?? ""} onChange={(e) => set("targetProgrammes", e.target.value)} placeholder="e.g. MSc Data Science at TU Dortmund, RWTH Aachen" className={textareaCls} />
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Teaching language" required error={errors.teachingLanguage}>
                    <Chips options={teachingLanguageOptions} value={draft.teachingLanguage} onChange={(v) => set("teachingLanguage", v)} />
                  </Field>
                  <Field label="University type" required error={errors.universityType}>
                    <Chips options={universityTypeOptions} value={draft.universityType} onChange={(v) => set("universityType", v)} />
                  </Field>
                </div>
                <Field label="Funding" hint="Germany requires proof of funds (blocked account) for the visa" required error={errors.funding}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {fundingOptions.map((o) => (
                      <ChoiceCard key={o.value} label={o.label} selected={draft.funding === o.value} onSelect={() => set("funding", o.value)} />
                    ))}
                  </div>
                </Field>
                <Field label="Where will the money come from?" hint="Optional · pick any">
                  <div className="flex flex-wrap gap-2">
                    {fundingSourceOptions.map((o) => (
                      <Chip key={o.value} label={o.label} selected={draft.fundingSources?.includes(o.value) ?? false} onClick={() => toggleIn("fundingSources", o.value)} />
                    ))}
                  </div>
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Passport" required error={errors.passport}>
                    <Chips options={passportOptions} value={draft.passport} onChange={(v) => set("passport", v)} />
                  </Field>
                  <Field label="Any previous visa refusal?" required error={errors.visaRefusal}>
                    <Chips options={refusalOptions} value={draft.visaRefusal} onChange={(v) => set("visaRefusal", v)} />
                  </Field>
                </div>
                <Field label="Where are you in the process?" required error={errors.applicationStage}>
                  <Chips options={applicationStageOptions} value={draft.applicationStage} onChange={(v) => set("applicationStage", v)} />
                </Field>
              </>
            ) : null}

            {current.key === "contact" ? (
              <>
                <Field label="Preferred channel" required error={errors.contactChannel}>
                  <Chips options={contactChannelOptions} value={draft.contactChannel} onChange={(v) => set("contactChannel", v)} />
                </Field>
                <Field label="Best time to reach you (Pakistan time)" required error={errors.contactTime}>
                  <Chips options={contactTimeOptions} value={draft.contactTime} onChange={(v) => set("contactTime", v)} />
                </Field>
                <Field label="Anything else we should know?" hint="Optional" htmlFor="c-notes">
                  <textarea id="c-notes" rows={4} maxLength={1500} value={draft.notes ?? ""} onChange={(e) => set("notes", e.target.value)} placeholder="Questions, deadlines, special circumstances…" className={textareaCls} />
                </Field>
                <Field label="How did you hear about us?" hint="Optional">
                  <Chips options={referralOptions} value={draft.referral || undefined} onChange={(v) => set("referral", v)} />
                </Field>
                <div data-field-error={errors.consent ? "" : undefined}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-white p-4 shadow-card">
                    <input
                      type="checkbox"
                      checked={draft.consent === true}
                      onChange={(e) => set("consent", e.target.checked as true)}
                      className="mt-1 size-4 accent-[var(--ink)]"
                    />
                    <span className="text-sm">
                      Parwaaz may contact me about this request on WhatsApp, phone or email. I understand the first consultation is paid and the fee is confirmed before anything is booked.
                    </span>
                  </label>
                  {errors.consent ? <p className="mt-2 text-sm text-destructive">{errors.consent}</p> : null}
                </div>
              </>
            ) : null}

            {current.key === "review" ? (
              <div className="space-y-4">
                {summarySections(draft as Partial<ConsultationInput>).map((section, i) => (
                  <div key={section.title} className="rounded-2xl bg-white p-5 shadow-card">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="font-extrabold">{section.title}</h2>
                      <button type="button" onClick={() => goTo(i)} className="inline-flex items-center gap-1 text-sm font-medium text-forest hover:underline">
                        <PencilSimple className="size-4" /> Edit
                      </button>
                    </div>
                    <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[180px_1fr]">
                      {section.rows.map(([k, v]) => (
                        <div key={k} className="contents">
                          <dt className="text-muted-foreground">{k}</dt>
                          <dd className="break-words font-medium">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
                {submitError ? (
                  <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{submitError}</p>
                ) : null}
              </div>
            ) : null}
            </motion.div>

            <div className="fixed inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-30 border-t border-muted bg-background/95 px-4 py-3 backdrop-blur md:static md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
              <div className="mx-auto flex max-w-6xl items-center gap-3">
                {step > 0 ? (
                  <Button type="button" variant="outline" onClick={() => goTo(step - 1)}>
                    <ArrowLeft /> Back
                  </Button>
                ) : null}
                <Button type="submit" className="group ml-auto pr-2" disabled={submitting}>
                  {current.key === "review" ? (submitting ? "Sending…" : "Send request") : "Continue"}
                  <span className="grid size-7 place-items-center rounded-full bg-ink text-primary transition-transform duration-200 group-hover:translate-x-0.5 group-active:scale-90">
                    {submitting ? (
                      <span className="size-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    ) : (
                      <ArrowRight weight="bold" className="size-3.5" />
                    )}
                  </span>
                </Button>
              </div>
            </div>
          </form>
        )}

        <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground lg:hidden">
          <Clock className="size-4" /> About 5 minutes · your answers are saved on this device
        </p>
      </section>
    </div>
  );
}

function friendlyMessage(issue: { code: string; message: string; input?: unknown }) {
  const missing = issue.input === undefined || issue.input === null || issue.input === "";
  if ((issue.code === "invalid_type" || issue.code === "invalid_value") && issue.message.startsWith("Invalid")) {
    return missing ? "Please answer this." : issue.code === "invalid_type" ? "Enter a number." : "Please choose an option.";
  }
  return issue.message;
}

const textareaCls =
  "w-full rounded-2xl border border-input bg-white px-4 py-3 text-base shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm";

function Field({
  label,
  hint,
  required,
  error,
  htmlFor,
  className,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}) {
  const Label = htmlFor ? "label" : "p";
  return (
    <div className={cn("space-y-2", className)} data-field-error={error ? "" : undefined}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <Label {...(htmlFor ? { htmlFor } : {})} className="text-sm font-semibold">
          {label}
          {required ? <span className="text-destructive"> *</span> : null}
        </Label>
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </div>
      {children}
      {error ? (
        <motion.p
          key={error}
          role="alert"
          initial={{ opacity: 0, x: 0 }}
          animate={{ opacity: 1, x: [0, -6, 6, -3, 3, 0] }}
          transition={{ duration: 0.35 }}
          className="text-sm text-destructive"
        >
          {error}
        </motion.p>
      ) : null}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  invalid,
  ...props
}: Omit<React.ComponentProps<"input">, "onChange" | "value"> & {
  value: string;
  onChange: (v: string) => void;
  invalid?: boolean;
}) {
  return (
    <Input
      {...props}
      value={value}
      aria-invalid={invalid || undefined}
      onChange={(e) => onChange(e.target.value)}
      className="h-12 rounded-2xl bg-white transition-[border-color,box-shadow] hover:border-ink/30 focus-visible:border-ink/40 focus-visible:ring-primary/40"
    />
  );
}

const popIn = { type: "spring" as const, stiffness: 600, damping: 24 };

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring",
        selected ? "bg-ink text-primary" : "bg-white text-foreground shadow-card hover:bg-muted"
      )}
    >
      <motion.span
        aria-hidden
        initial={false}
        animate={selected ? { width: 14, opacity: 1, scale: 1 } : { width: 0, opacity: 0, scale: 0 }}
        transition={popIn}
        className="inline-flex overflow-hidden"
        style={{ marginRight: selected ? 0 : -6 }}
      >
        <Check weight="bold" className="size-3.5 shrink-0" />
      </motion.span>
      {label}
    </motion.button>
  );
}

function Chips<V extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { value: V; label: string }[];
  value: V | null | undefined;
  onChange: (v: V) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup">
      {options.map((o) => (
        <Chip key={o.value} label={o.label} selected={value === o.value} onClick={() => onChange(o.value)} />
      ))}
    </div>
  );
}

function ChoiceCard({
  label,
  description,
  selected,
  multi,
  onSelect,
}: {
  label: string;
  description?: string;
  selected: boolean;
  multi?: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className={cn(
        "flex w-full items-start gap-3 rounded-2xl bg-white p-4 text-left shadow-card transition-shadow duration-200",
        "hover:shadow-card-hover",
        "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2",
        selected && "bg-primary/10 shadow-[inset_0_0_0_2px_var(--ink)]"
      )}
    >
      <span
        className={cn(
          "mt-0.5 grid size-6 shrink-0 place-items-center border-2 border-border transition-colors duration-200",
          multi ? "rounded-md" : "rounded-full",
          selected && "border-ink bg-primary"
        )}
      >
        <motion.span
          aria-hidden
          initial={false}
          animate={selected ? { scale: 1, rotate: 0, opacity: 1 } : { scale: 0, rotate: -30, opacity: 0 }}
          transition={popIn}
        >
          <Check weight="bold" className="size-3.5" />
        </motion.span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{label}</span>
        {description ? <span className="mt-0.5 block text-sm text-muted-foreground">{description}</span> : null}
      </span>
    </motion.button>
  );
}

function SuccessView({ reference, name, channel }: { reference: string; name: string; channel: string }) {
  const first = name.split(" ")[0] || "there";
  return (
    <div className="mx-auto max-w-xl px-4 py-12 text-center md:py-20">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-primary">
        <Check weight="bold" className="size-8 text-ink" />
      </span>
      <h1 className="mt-6 text-3xl font-extrabold tracking-[-0.03em]">Request received, {first}</h1>
      <p className="mt-3 text-muted-foreground">
        A consultant will review your profile and contact you on{" "}
        {channel === "call" ? "a phone call" : channel === "email" ? "email" : "WhatsApp"} within 1 business day.
      </p>
      <div className="mx-auto mt-8 max-w-sm rounded-2xl bg-white p-5 shadow-card">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Your reference</p>
        <p className="mt-1 font-mono text-2xl font-bold tracking-wider">{reference}</p>
        <p className="mt-2 text-xs text-muted-foreground">Quote this when you message us.</p>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg" variant="whatsapp">
          <a
            href={whatsappLink(`Hi! I just requested a consultation on Parwaaz. My reference is ${reference}.`)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon className="size-[18px]" /> Message us now
          </a>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/programs">Browse master&apos;s programmes</Link>
        </Button>
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        While you wait: run the{" "}
        <Link href="/check" className="font-medium text-forest hover:underline">eligibility check</Link> and note a few programmes you like — it makes the first call more useful.
      </p>
    </div>
  );
}
