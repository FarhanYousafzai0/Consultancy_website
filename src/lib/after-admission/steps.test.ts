import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { seedGuides } from "@/data/seed-guides";
import { partnerOffers } from "@/data/partner-offers";
import {
  AFTER_ADMISSION_STEPS,
  AFTER_ADMISSION_STEP_IDS,
  filterValidCompletedIds,
  isAfterAdmissionStepId,
} from "@/lib/after-admission/steps";

describe("after-admission steps", () => {
  it("has unique step ids", () => {
    assert.equal(
      new Set(AFTER_ADMISSION_STEP_IDS).size,
      AFTER_ADMISSION_STEP_IDS.length
    );
  });

  it("links every guideSlug to a seed guide", () => {
    const slugs = new Set(seedGuides.map((g) => g.slug));
    for (const step of AFTER_ADMISSION_STEPS) {
      assert.ok(
        slugs.has(step.guideSlug),
        `missing seed guide for ${step.id}: ${step.guideSlug}`
      );
    }
  });

  it("filters completed ids to known steps", () => {
    assert.deepEqual(
      filterValidCompletedIds(["aps", "bogus", "visa", "aps"]),
      ["aps", "visa"]
    );
    assert.equal(isAfterAdmissionStepId("housing"), true);
    assert.equal(isAfterAdmissionStepId("xyz"), false);
  });
});

describe("partner offers", () => {
  it("only uses blocked_account or insurance categories", () => {
    for (const p of partnerOffers) {
      assert.ok(
        p.category === "blocked_account" || p.category === "insurance",
        p.id
      );
      assert.ok(p.url.startsWith("http"), p.id);
      assert.ok(p.disclosure.length > 10, p.id);
    }
  });
});
