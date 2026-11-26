import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizeCountry,
  normalizeDuration,
  normalizeEducationLevels,
  normalizeFundingStatus,
  normalizeOfficialUrl,
  normalizeStudyFields,
  normalizeWorkMode,
} from "./normalize";

test("normalizes internship country names through the shared country contract", () => {
  assert.equal(normalizeCountry(" Pakistan "), "PK");
  assert.equal(normalizeCountry("Türkiye"), "TR");
  assert.equal(normalizeCountry("GB"), "GB");
  assert.equal(normalizeCountry("Atlantis"), null);
});

test("normalizes work modes without guessing unknown values", () => {
  assert.equal(normalizeWorkMode("Remote internship"), "remote");
  assert.equal(normalizeWorkMode("hybrid / flexible"), "hybrid");
  assert.equal(normalizeWorkMode("in-person"), "on_site");
  assert.equal(normalizeWorkMode("work from anywhere"), "unknown");
  assert.equal(normalizeWorkMode(null), "unknown");
});

test("normalizes funding labels while keeping ambiguous funding unknown", () => {
  assert.equal(normalizeFundingStatus("paid internship with monthly salary"), "paid");
  assert.equal(normalizeFundingStatus("unpaid"), "unpaid");
  assert.equal(normalizeFundingStatus("fully funded"), "fully_funded");
  assert.equal(normalizeFundingStatus("partial funding"), "partially_funded");
  assert.equal(normalizeFundingStatus("funded"), "unknown");
  assert.equal(normalizeFundingStatus("competitive compensation"), "unknown");
});

test("normalizes fields and education levels with stable ordering and deduplication", () => {
  assert.deepEqual(
    normalizeStudyFields(["AI", "computer science", "data science", "unknown field"]),
    ["computer_science", "data", "other"]
  );
  assert.deepEqual(
    normalizeEducationLevels(["undergraduate", "bachelor's", "PhD", "doctoral"]),
    ["undergraduate", "phd"]
  );
});

test("normalizes common duration values without inventing a duration", () => {
  assert.deepEqual(normalizeDuration("12 weeks"), {
    durationValue: 12,
    durationUnit: "weeks",
    durationText: "12 weeks",
  });
  assert.deepEqual(normalizeDuration("one year"), {
    durationValue: 1,
    durationUnit: "year",
    durationText: "one year",
  });
  assert.deepEqual(normalizeDuration("several months"), {
    durationValue: null,
    durationUnit: "months",
    durationText: "several months",
  });
  assert.deepEqual(normalizeDuration(null), {
    durationValue: null,
    durationUnit: "unknown",
    durationText: null,
  });
});

test("canonicalizes official URLs and rejects unsafe or disallowed URLs", () => {
  assert.equal(
    normalizeOfficialUrl(
      "http://www.Example.org//internships/?utm_source=mail&b=2&a=1#apply",
      ["example.org"]
    ),
    "https://example.org/internships?a=1&b=2"
  );
  assert.equal(normalizeOfficialUrl("javascript:alert(1)"), null);
  assert.equal(normalizeOfficialUrl("https://other-example.org/apply", ["example.org"]), null);
});
