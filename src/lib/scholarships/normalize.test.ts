import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizeCountry,
  normalizeDegreeLevels,
  normalizeFundingType,
  normalizeNationality,
  normalizeOfficialUrl,
} from "./normalize";

test("normalizes country names and ISO-like codes", () => {
  assert.equal(normalizeCountry(" Pakistan "), "PK");
  assert.equal(normalizeCountry("GB"), "GB");
  assert.equal(normalizeCountry("Türkiye"), "TR");
  assert.equal(normalizeCountry("Abu Dhabi"), "AE");
  assert.equal(normalizeCountry("South Korea"), "KR");
  assert.equal(normalizeCountry("Iceland"), "IS");
  assert.equal(normalizeCountry("Atlantis"), null);
});

test("normalizes nationality names to country codes", () => {
  assert.equal(normalizeNationality("Pakistani"), "PK");
  assert.equal(normalizeNationality("United States"), "US");
  assert.equal(normalizeNationality("bd"), "BD");
  assert.equal(normalizeNationality("international"), "any");
  assert.equal(normalizeNationality("all"), "any");
  assert.equal(normalizeNationality("any"), "any");
});

test("normalizes funding labels to the supported categories", () => {
  assert.equal(normalizeFundingType("Fully funded scholarship"), "fully_funded");
  assert.equal(normalizeFundingType("partial funding"), "partially_funded");
  assert.equal(normalizeFundingType("tuition fee waiver"), "tuition_only");
  assert.equal(normalizeFundingType("monthly stipend"), "stipend");
  assert.equal(normalizeFundingType("award"), "unknown");
});

test("normalizes degree labels and removes duplicates", () => {
  assert.deepEqual(
    normalizeDegreeLevels(["Ph.D.", "Master's", "undergraduate", "PhD"]),
    ["bachelor", "master", "phd"]
  );
  assert.deepEqual(normalizeDegreeLevels("doctoral programme"), ["phd"]);
  assert.deepEqual(normalizeDegreeLevels("certificate"), []);
});

test("canonicalizes official URLs and removes tracking parameters", () => {
  assert.equal(
    normalizeOfficialUrl(
      "http://www.DAAD.de//study/?utm_source=newsletter&b=2&a=1#deadline",
      ["daad.de"]
    ),
    "https://daad.de/study?a=1&b=2"
  );
  assert.equal(normalizeOfficialUrl("https://example.com/page?ref=partner", ["daad.de"]), null);
  assert.equal(normalizeOfficialUrl("javascript:alert(1)"), null);
});
