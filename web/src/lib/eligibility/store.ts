"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  emptyAnswers,
  type EligibilityAnswers,
  type EnglishTest,
  type Field,
  type GermanLevel,
  type Goal,
  type GradeSystem,
  type PercentagePassMark,
  type Qualification,
} from "./types";

type EligibilityState = EligibilityAnswers & {
  setGoal: (goal: Goal) => void;
  setQualification: (qualification: Qualification) => void;
  setGradeSystem: (
    gradeSystem: GradeSystem,
    percentagePassMark?: PercentagePassMark | null
  ) => void;
  setGrade: (input: {
    gradeSystem: GradeSystem;
    gradeValue: number;
    percentagePassMark: PercentagePassMark | null;
  }) => void;
  setField: (field: Field) => void;
  setEnglishTest: (englishTest: EnglishTest) => void;
  setGermanLevel: (germanLevel: GermanLevel) => void;
  setLanguage: (input: {
    englishTest: EnglishTest;
    englishScore: number | null;
    germanLevel: GermanLevel;
  }) => void;
  markComplete: () => void;
  reset: () => void;
  hydrateGoal: (goal: Goal) => void;
};

export const useEligibilityStore = create<EligibilityState>()(
  persist(
    (set, get) => ({
      ...emptyAnswers(),
      setGoal: (goal) =>
        set({
          goal,
          qualification: null,
          field: null,
          completedAt: null,
        }),
      setQualification: (qualification) =>
        set({ qualification, completedAt: null }),
      setGradeSystem: (gradeSystem, percentagePassMark = null) =>
        set({
          gradeSystem,
          percentagePassMark:
            gradeSystem === "percentage" ? (percentagePassMark ?? 40) : null,
          completedAt: null,
        }),
      setGrade: ({ gradeSystem, gradeValue, percentagePassMark }) =>
        set({
          gradeSystem,
          gradeValue,
          percentagePassMark:
            gradeSystem === "percentage" ? percentagePassMark : null,
          completedAt: null,
        }),
      setField: (field) => set({ field, completedAt: null }),
      setEnglishTest: (englishTest) =>
        set({
          englishTest,
          englishScore: englishTest === "none" ? null : get().englishScore,
          completedAt: null,
        }),
      setGermanLevel: (germanLevel) =>
        set({
          germanLevel,
          completedAt: null,
        }),
      setLanguage: ({ englishTest, englishScore, germanLevel }) =>
        set({
          englishTest,
          englishScore: englishTest === "none" ? null : englishScore,
          germanLevel,
          completedAt: null,
        }),
      markComplete: () => set({ completedAt: new Date().toISOString() }),
      reset: () => set({ ...emptyAnswers() }),
      hydrateGoal: (goal) => {
        const current = get().goal;
        if (current == null) {
          set({ goal, completedAt: null });
        }
      },
    }),
    {
      name: "parwaz-eligibility",
      partialize: (state) => ({
        goal: state.goal,
        qualification: state.qualification,
        gradeSystem: state.gradeSystem,
        gradeValue: state.gradeValue,
        percentagePassMark: state.percentagePassMark,
        field: state.field,
        englishTest: state.englishTest,
        englishScore: state.englishScore,
        germanLevel: state.germanLevel,
        completedAt: state.completedAt,
      }),
    }
  )
);

export function selectAnswers(state: EligibilityAnswers): EligibilityAnswers {
  return {
    goal: state.goal,
    qualification: state.qualification,
    gradeSystem: state.gradeSystem,
    gradeValue: state.gradeValue,
    percentagePassMark: state.percentagePassMark,
    field: state.field,
    englishTest: state.englishTest,
    englishScore: state.englishScore,
    germanLevel: state.germanLevel,
    completedAt: state.completedAt,
  };
}
