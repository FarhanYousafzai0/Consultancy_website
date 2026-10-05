import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { seedPrograms } from "../../data/seed-programs";
import type { ProgramInput, ProgramRecord } from "../db/types";
import { emptyAnswers, type EligibilityAnswers } from "../eligibility/types";
import { matchPrograms } from "./match";

function records(inputs: ProgramInput[]): ProgramRecord[] {
  return inputs.map((program, index) => ({
    ...program,
    id: `seed-${index + 1}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

function mastersProfile(
  overrides: Partial<EligibilityAnswers> = {}
): EligibilityAnswers {
  return {
    ...emptyAnswers(),
    goal: "masters",
    qualification: "bs_4year",
    gradeSystem: "cgpa4",
    gradeValue: 3.2,
    field: "computer_science",
    englishTest: "ielts",
    englishScore: 6.5,
    germanLevel: "a2",
    completedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("matchPrograms", () => {
  it("returns top matches for a 4-year CS Master's profile", () => {
    const result = matchPrograms(mastersProfile(), records(seedPrograms));
    assert.ok(result.totalQualified > 0);
    assert.ok(result.matches.length <= 3);
    assert.ok(result.matches.every((m) => m.program.degreeLevel === "master"));
    assert.ok(
      result.matches.some((m) => m.program.field === "computer_science")
    );
  });

  it("returns no university matches for Ausbildung", () => {
    const result = matchPrograms(
      mastersProfile({
        goal: "ausbildung",
        qualification: "matric",
        field: "it",
        germanLevel: "b1",
      }),
      records(seedPrograms)
    );
    assert.equal(result.totalQualified, 0);
    assert.equal(result.matches.length, 0);
  });

  it("returns no matches for 2-year BA alone aiming at Master's", () => {
    const result = matchPrograms(
      mastersProfile({ qualification: "ba_bsc_2year" }),
      records(seedPrograms)
    );
    assert.equal(result.totalQualified, 0);
  });
});
