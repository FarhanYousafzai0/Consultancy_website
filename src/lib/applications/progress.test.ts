import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  APPLICATION_STATUSES,
  buildTimeline,
  docProgress,
  resolveDeadline,
  type ApplicationStatus,
  type TargetIntake,
} from "@/lib/applications/progress";
import type { ProgramRecord } from "@/lib/db/types";

function fakeProgram(
  overrides: Partial<ProgramRecord> = {}
): ProgramRecord {
  return {
    id: "p1",
    name: "MSc CS",
    university: "Test Uni",
    universityType: "public",
    degreeLevel: "master",
    field: "computer_science",
    city: "Berlin",
    state: "Berlin",
    languageOfInstruction: "english",
    ieltsMin: 6.5,
    toeflMin: null,
    germanRequired: "none",
    applicationRoute: "uni_assist",
    tuitionPerSemesterEur: 0,
    semesterFeeEur: 300,
    typicalGermanGradeMax: 2.5,
    intakes: [
      {
        semester: "winter",
        year: 2027,
        deadlineNonEu: "2027-07-15",
        status: "confirmed",
      },
      {
        semester: "summer",
        year: 2027,
        deadlineNonEu: "2027-01-15",
        status: "confirmed",
      },
    ],
    requiredDocuments: ["transcript", "cv", "motivation_letter", "aps_certificate"],
    sourceUrl: "https://example.com",
    lastVerifiedAt: "2026-10-01",
    status: "published",
    notes: "",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

type Item = {
  programId: string;
  status: ApplicationStatus;
  completedDocuments: string[];
  targetIntake: TargetIntake | null;
  program: ProgramRecord | null;
};

function fakeItem(overrides: Partial<Item> = {}): Item {
  return {
    programId: "p1",
    status: "planning",
    completedDocuments: [],
    targetIntake: null,
    program: fakeProgram(),
    ...overrides,
  };
}

describe("shortlist application helpers", () => {
  it("defaults include planning as a valid status", () => {
    assert.ok(APPLICATION_STATUSES.includes("planning"));
    assert.equal(APPLICATION_STATUSES[0], "planning");
  });

  it("resolveDeadline uses earliest intake when no target", () => {
    const item = fakeItem();
    assert.equal(resolveDeadline(item), "2027-01-15");
  });

  it("resolveDeadline prefers target intake", () => {
    const item = fakeItem({
      targetIntake: { semester: "winter", year: 2027 },
    });
    assert.equal(resolveDeadline(item), "2027-07-15");
  });

  it("docProgress intersects completed with required docs", () => {
    const item = fakeItem({
      completedDocuments: ["cv", "stale_doc", "transcript"],
    });
    const progress = docProgress(item);
    assert.deepEqual(progress.completed.sort(), ["cv", "transcript"]);
    assert.equal(progress.done, 2);
    assert.equal(progress.total, 4);
  });

  it("buildTimeline skips withdrawn/rejected and sorts by deadline", () => {
    const items = [
      fakeItem({
        programId: "a",
        status: "gathering_docs",
        program: fakeProgram({
          id: "a",
          name: "Later",
          intakes: [
            {
              semester: "winter",
              year: 2027,
              deadlineNonEu: "2027-07-15",
              status: "confirmed",
            },
          ],
        }),
      }),
      fakeItem({
        programId: "b",
        status: "withdrawn",
        program: fakeProgram({
          id: "b",
          name: "Gone",
          intakes: [
            {
              semester: "summer",
              year: 2027,
              deadlineNonEu: "2027-01-01",
              status: "confirmed",
            },
          ],
        }),
      }),
      fakeItem({
        programId: "c",
        status: "ready_to_apply",
        program: fakeProgram({
          id: "c",
          name: "Soon",
          intakes: [
            {
              semester: "summer",
              year: 2027,
              deadlineNonEu: "2027-03-01",
              status: "confirmed",
            },
          ],
        }),
      }),
    ];
    const timeline = buildTimeline(items, new Date("2026-10-06T00:00:00Z"));
    assert.equal(timeline.length, 2);
    assert.equal(timeline[0]?.name, "Soon");
    assert.equal(timeline[1]?.name, "Later");
  });
});
