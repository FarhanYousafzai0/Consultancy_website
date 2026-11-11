import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { consultationSchema, stepSchemas, upcomingIntakes } from "./schema";
import { intakeLabel, summarySections } from "./summary";

const valid = {
  services: ["full_application", "scholarships"],
  degreeLevel: "master",
  intake: "winter_2027",
  fullName: "Test Student",
  email: "test.student@example.test",
  phone: "+92 300 0000000",
  city: "Lahore",
  qualification: "bs_4year",
  degreeTitle: "BS Computer Science",
  university: "Test University",
  degreeStatus: "completed",
  graduationYear: 2025,
  gradeSystem: "cgpa4",
  gradeValue: 3.2,
  backlogs: "none",
  hecAttestation: "done",
  englishTest: "ielts",
  englishScore: 6.5,
  germanLevel: "a2",
  gmatGre: "none",
  workExperience: "1_2",
  workRole: "Junior developer",
  fields: ["data"],
  teachingLanguage: "english_only",
  universityType: "public_only",
  funding: "partial",
  fundingSources: ["family"],
  passport: "valid",
  visaRefusal: "none",
  applicationStage: "preparing",
  contactChannel: "whatsapp",
  contactTime: "evening",
  consent: true,
};

describe("consultation schema", () => {
  it("accepts a complete master's profile and fills optional fields", () => {
    const parsed = consultationSchema.parse(valid);
    assert.equal(parsed.birthYear, null);
    assert.equal(parsed.gmatGreScore, null);
    assert.equal(parsed.notes, "");
    assert.equal(parsed.referral, "");
  });

  it("rejects a grade above its scale", () => {
    assert.equal(consultationSchema.safeParse({ ...valid, gradeValue: 4.4 }).success, false);
    assert.equal(
      consultationSchema.safeParse({ ...valid, gradeSystem: "percentage", gradeValue: 72 }).success,
      true
    );
  });

  it("requires consent, a valid phone and at least one service", () => {
    assert.equal(consultationSchema.safeParse({ ...valid, consent: false }).success, false);
    assert.equal(consultationSchema.safeParse({ ...valid, phone: "12" }).success, false);
    assert.equal(consultationSchema.safeParse({ ...valid, services: [] }).success, false);
  });

  it("caps fields of study at three", () => {
    const r = stepSchemas.plan.safeParse({
      ...valid,
      fields: ["data", "business", "economics", "health"],
    });
    assert.equal(r.success, false);
  });

  it("validates each step on its own", () => {
    for (const schema of Object.values(stepSchemas)) {
      assert.equal(schema.safeParse(valid).success, true);
    }
  });
});

describe("intakes", () => {
  it("offers the next realistic intakes from mid-November", () => {
    const list = upcomingIntakes(new Date(2026, 10, 12)).map((i) => i.value);
    assert.deepEqual(list, ["summer_2027", "winter_2027", "summer_2028", "winter_2028", "undecided"]);
  });

  it("offers the coming winter intake in spring", () => {
    assert.equal(upcomingIntakes(new Date(2027, 2, 1))[0].value, "winter_2027");
  });

  it("labels intakes", () => {
    assert.equal(intakeLabel("winter_2027"), "Winter 2027/28");
    assert.equal(intakeLabel("summer_2028"), "Summer 2028");
  });
});

describe("summary", () => {
  it("renders human labels for the review step and admin", () => {
    const rows = Object.fromEntries(
      summarySections(consultationSchema.parse(valid)).flatMap((s) => s.rows)
    );
    assert.equal(rows["Help with"], "Full master's application support, Scholarships");
    assert.equal(rows["Grade"], "3.2 (CGPA / 4.0)");
    assert.equal(rows["English"], "IELTS Academic · 6.5");
  });
});
