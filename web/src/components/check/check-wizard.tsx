"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowClockwise, ArrowRight } from "@phosphor-icons/react";
import { OptionCard } from "@/components/check/option-card";
import { StepShell } from "@/components/check/step-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ausbildungFieldOptions,
  ausbildungQualificationOptions,
  bachelorsQualificationOptions,
  englishTestOptions,
  fieldSchemaFor,
  germanLevelOptions,
  goalOptions,
  goalSchema,
  gradeStepSchema,
  gradeSystemOptions,
  languageStepSchema,
  mastersQualificationOptions,
  passMarkOptions,
  qualificationSchemaFor,
  studyFieldOptions,
  useEligibilityHydrated,
  useEligibilityStore,
  type EnglishTest,
  type Field,
  type GermanLevel,
  type GradeSystem,
  type Qualification,
} from "@/lib/eligibility";

const TOTAL_STEPS = 5;

type CheckWizardProps = {
  initialGoal?: string | null;
};

export function CheckWizard({ initialGoal }: CheckWizardProps) {
  const router = useRouter();
  const store = useEligibilityStore();
  const hydrated = useEligibilityHydrated();
  const parsedGoal = goalSchema.safeParse(initialGoal);
  const [step, setStep] = useState(parsedGoal.success ? 2 : 1);
  const [goalApplied, setGoalApplied] = useState(false);
  const [gradeError, setGradeError] = useState<string | null>(null);
  const [languageError, setLanguageError] = useState<string | null>(null);
  const [gradeDraft, setGradeDraft] = useState<string | null>(null);
  const [englishDraft, setEnglishDraft] = useState<string | null>(null);

  if (hydrated && parsedGoal.success && !goalApplied) {
    store.hydrateGoal(parsedGoal.data);
    setGoalApplied(true);
    if (store.completedAt == null) {
      setStep(2);
    }
  }

  const localGradeValue =
    gradeDraft ??
    (hydrated && store.gradeValue != null ? String(store.gradeValue) : "");
  const localEnglishScore =
    englishDraft ??
    (hydrated && store.englishScore != null ? String(store.englishScore) : "");

  const qualificationOptions = useMemo(() => {
    if (store.goal === "masters") return mastersQualificationOptions;
    if (store.goal === "bachelors") return bachelorsQualificationOptions;
    if (store.goal === "ausbildung") return ausbildungQualificationOptions;
    return [];
  }, [store.goal]);

  const fieldOptions = useMemo(() => {
    if (store.goal === "ausbildung") return ausbildungFieldOptions;
    return studyFieldOptions;
  }, [store.goal]);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-sm text-muted-foreground">
        Loading your check…
      </div>
    );
  }

  if (store.completedAt && step === 1 && !parsedGoal.success) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10 md:px-6 md:py-16">
        <p className="section-label">Eligibility check</p>
        <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.03em]">
          You already finished a check
        </h1>
        <p className="mt-3 text-muted-foreground">
          Your answers are saved in this browser. See the result again, or start
          over with new answers.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg" className="pr-2">
            <Link href="/check/result">
              See my result
              <span className="grid size-9 place-items-center rounded-full bg-ink text-primary">
                <ArrowRight weight="bold" className="size-4" />
              </span>
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => {
              store.reset();
              setStep(1);
              setGradeDraft(null);
              setEnglishDraft(null);
              setGoalApplied(false);
            }}
          >
            <ArrowClockwise />
            Start again
          </Button>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <StepShell
        step={1}
        total={TOTAL_STEPS}
        title="What do you want to do?"
        subtitle="Pick the path that matches where you are now."
      >
        {goalOptions.map((option) => (
          <OptionCard
            key={option.value}
            label={option.label}
            description={option.description}
            selected={store.goal === option.value}
            onSelect={() => {
              store.setGoal(option.value);
              setStep(2);
            }}
          />
        ))}
      </StepShell>
    );
  }

  if (step === 2) {
    return (
      <StepShell
        step={2}
        total={TOTAL_STEPS}
        title="Your qualification"
        subtitle="This decides whether you can apply directly, need Studienkolleg, or need more study first."
        onBack={() => setStep(1)}
      >
        {qualificationOptions.map((option) => (
          <OptionCard
            key={option.value}
            label={option.label}
            selected={store.qualification === option.value}
            onSelect={() => {
              if (!store.goal) return;
              const parsed = qualificationSchemaFor(store.goal).safeParse(
                option.value
              );
              if (!parsed.success) return;
              store.setQualification(parsed.data as Qualification);
              setStep(3);
            }}
          />
        ))}
      </StepShell>
    );
  }

  if (step === 3) {
    const continueGrade = () => {
      const value = Number(localGradeValue);
      const draft = {
        gradeSystem: store.gradeSystem ?? ("percentage" as GradeSystem),
        gradeValue: Number.isFinite(value) ? value : NaN,
        percentagePassMark: store.percentagePassMark,
      };
      const parsed = gradeStepSchema.safeParse(draft);
      if (!parsed.success) {
        setGradeError(parsed.error.issues[0]?.message ?? "Check your grade.");
        return;
      }
      setGradeError(null);
      store.setGrade(parsed.data);
      setStep(4);
    };

    return (
      <StepShell
        step={3}
        total={TOTAL_STEPS}
        title="Your grade"
        subtitle="We convert this to the German scale so you can see how competitive you look."
        onBack={() => setStep(2)}
        onContinue={continueGrade}
        continueDisabled={!store.gradeSystem || localGradeValue === ""}
      >
        <div className="space-y-3">
          <p className="text-sm font-semibold">Grade system</p>
          {gradeSystemOptions.map((option) => (
            <OptionCard
              key={option.value}
              label={option.label}
              selected={store.gradeSystem === option.value}
              onSelect={() =>
                store.setGradeSystem(
                  option.value,
                  option.value === "percentage"
                    ? (store.percentagePassMark ?? 40)
                    : null
                )
              }
            />
          ))}
        </div>

        {store.gradeSystem === "percentage" ? (
          <div className="space-y-3 pt-2">
            <p className="text-sm font-semibold">Pass mark on your transcript</p>
            <div className="flex flex-wrap gap-2">
              {passMarkOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => store.setGradeSystem("percentage", option.value)}
                  className={
                    store.percentagePassMark === option.value
                      ? "rounded-full bg-primary px-4 py-2 text-sm font-semibold"
                      : "rounded-full bg-muted px-4 py-2 text-sm font-semibold text-muted-foreground"
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="space-y-2 pt-2">
          <label htmlFor="grade-value" className="text-sm font-semibold">
            {store.gradeSystem === "percentage"
              ? "Your percentage"
              : store.gradeSystem === "cgpa5"
                ? "Your CGPA (out of 5.0)"
                : store.gradeSystem === "cgpa4"
                  ? "Your CGPA (out of 4.0)"
                  : "Your grade"}
          </label>
          <Input
            id="grade-value"
            type="number"
            inputMode="decimal"
            step="0.01"
            value={localGradeValue}
            onChange={(e) => setGradeDraft(e.target.value)}
            placeholder={
              store.gradeSystem === "percentage" ? "e.g. 78" : "e.g. 3.2"
            }
            className="h-12 rounded-2xl"
          />
          {gradeError ? (
            <p className="text-sm text-destructive">{gradeError}</p>
          ) : null}
        </div>
      </StepShell>
    );
  }

  if (step === 4) {
    return (
      <StepShell
        step={4}
        total={TOTAL_STEPS}
        title={
          store.goal === "ausbildung"
            ? "Which training field interests you?"
            : "Which field do you want to study?"
        }
        subtitle="We use this later to match programs. Pick the closest fit."
        onBack={() => setStep(3)}
      >
        {fieldOptions.map((option) => (
          <OptionCard
            key={option.value}
            label={option.label}
            selected={store.field === option.value}
            onSelect={() => {
              if (!store.goal) return;
              const parsed = fieldSchemaFor(store.goal).safeParse(option.value);
              if (!parsed.success) return;
              store.setField(parsed.data as Field);
              setStep(5);
            }}
          />
        ))}
      </StepShell>
    );
  }

  const continueLanguage = () => {
    const score = localEnglishScore === "" ? null : Number(localEnglishScore);
    const draft = {
      englishTest: store.englishTest ?? ("none" as EnglishTest),
      englishScore: score != null && Number.isFinite(score) ? score : null,
      germanLevel: store.germanLevel ?? ("none" as GermanLevel),
    };
    const parsed = languageStepSchema.safeParse(draft);
    if (!parsed.success) {
      setLanguageError(
        parsed.error.issues[0]?.message ?? "Check your language answers."
      );
      return;
    }
    setLanguageError(null);
    store.setLanguage(parsed.data);
    store.markComplete();
    router.push("/check/result");
  };

  return (
    <StepShell
      step={5}
      total={TOTAL_STEPS}
      title="Language"
      subtitle={
        store.goal === "ausbildung"
          ? "German level decides whether you are ready to look for Ausbildung places."
          : "English scores do not fail this check — we just show how they compare to typical asks."
      }
      onBack={() => setStep(4)}
      onContinue={continueLanguage}
      continueLabel="See my result"
      continueDisabled={!store.englishTest || !store.germanLevel}
    >
      <div className="space-y-3">
        <p className="text-sm font-semibold">English test</p>
        {englishTestOptions.map((option) => (
          <OptionCard
            key={option.value}
            label={option.label}
            selected={store.englishTest === option.value}
            onSelect={() => store.setEnglishTest(option.value)}
          />
        ))}
      </div>

      {store.englishTest && store.englishTest !== "none" ? (
        <div className="space-y-2 pt-2">
          <label htmlFor="english-score" className="text-sm font-semibold">
            Your score
          </label>
          <Input
            id="english-score"
            type="number"
            inputMode="decimal"
            step="0.5"
            value={localEnglishScore}
            onChange={(e) => setEnglishDraft(e.target.value)}
            placeholder={
              store.englishTest === "ielts"
                ? "e.g. 6.5"
                : store.englishTest === "toefl"
                  ? "e.g. 90"
                  : "Your score"
            }
            className="h-12 rounded-2xl"
          />
        </div>
      ) : null}

      <div className="space-y-3 pt-4">
        <p className="text-sm font-semibold">German level</p>
        {germanLevelOptions.map((option) => (
          <OptionCard
            key={option.value}
            label={option.label}
            selected={store.germanLevel === option.value}
            onSelect={() => store.setGermanLevel(option.value)}
          />
        ))}
      </div>

      {languageError ? (
        <p className="text-sm text-destructive">{languageError}</p>
      ) : null}
    </StepShell>
  );
}
