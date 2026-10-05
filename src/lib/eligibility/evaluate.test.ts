import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evaluateEligibility } from "./evaluate";
import { emptyAnswers, type EligibilityAnswers } from "./types";

function base(overrides: Partial<EligibilityAnswers>): EligibilityAnswers {
  return {
    ...emptyAnswers(),
    gradeSystem: "cgpa4",
    gradeValue: 3.2,
    percentagePassMark: null,
    field: "computer_science",
    englishTest: "ielts",
    englishScore: 6.5,
    germanLevel: "a2",
    completedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("evaluateEligibility", () => {
  it("marks 4-year BS as Master's eligible with APS", () => {
    const result = evaluateEligibility(
      base({ goal: "masters", qualification: "bs_4year" })
    );
    assert.ok(result);
    assert.equal(result.kind, "masters_eligible");
    assert.equal(result.showConsultant, true);
    assert.ok(result.reasons.some((r) => r.includes("APS")));
  });

  it("rejects 2-year BA/BSc alone for Master's", () => {
    const result = evaluateEligibility(
      base({ goal: "masters", qualification: "ba_bsc_2year" })
    );
    assert.ok(result);
    assert.equal(result.kind, "masters_not_enough");
    assert.equal(result.showConsultant, true);
  });

  it("routes FSc pre-engineering to Studienkolleg T-Kurs", () => {
    const result = evaluateEligibility(
      base({
        goal: "bachelors",
        qualification: "fsc_pre_engineering",
        gradeSystem: "percentage",
        gradeValue: 78,
        percentagePassMark: 40,
      })
    );
    assert.ok(result);
    assert.equal(result.kind, "bachelors_studienkolleg");
    assert.equal(result.studienkollegKurs, "T-Kurs");
    assert.equal(result.showConsultant, true);
  });

  it("treats A-levels as likely direct Bachelor's route", () => {
    const result = evaluateEligibility(
      base({ goal: "bachelors", qualification: "a_levels" })
    );
    assert.ok(result);
    assert.equal(result.kind, "bachelors_likely_direct");
  });

  it("marks Ausbildung ready at B1+ without consultant", () => {
    const result = evaluateEligibility(
      base({
        goal: "ausbildung",
        qualification: "matric",
        field: "it",
        germanLevel: "b1",
        englishTest: "none",
        englishScore: null,
      })
    );
    assert.ok(result);
    assert.equal(result.kind, "ausbildung_ready");
    assert.equal(result.showConsultant, false);
  });

  it("marks Ausbildung below B1 as needing German, no consultant", () => {
    const result = evaluateEligibility(
      base({
        goal: "ausbildung",
        qualification: "fsc_hssc",
        field: "nursing",
        germanLevel: "a2",
        englishTest: "none",
        englishScore: null,
      })
    );
    assert.ok(result);
    assert.equal(result.kind, "ausbildung_need_german");
    assert.equal(result.showConsultant, false);
  });

  it("cannot judge Other qualification", () => {
    const result = evaluateEligibility(
      base({ goal: "masters", qualification: "other" })
    );
    assert.ok(result);
    assert.equal(result.kind, "cannot_judge");
  });
});
