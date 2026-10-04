import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { evaluateGrade, gradeBand, toGermanGrade } from "./grade";

describe("toGermanGrade", () => {
  it("converts a mid percentage with 40% pass", () => {
    // 1 + 3 * (100 - 70) / (100 - 40) = 1 + 90/60 = 2.5
    assert.equal(toGermanGrade("percentage", 70, 40), 2.5);
  });

  it("converts a perfect percentage to 1.0", () => {
    assert.equal(toGermanGrade("percentage", 100, 40), 1);
  });

  it("converts a pass-mark percentage to 4.0", () => {
    assert.equal(toGermanGrade("percentage", 40, 40), 4);
  });

  it("converts CGPA 3.2 / 4.0", () => {
    // 1 + 3 * (4 - 3.2) / (4 - 2) = 1 + 2.4/2 = 2.2
    assert.equal(toGermanGrade("cgpa4", 3.2), 2.2);
  });

  it("converts CGPA 4.0 / 5.0", () => {
    // 1 + 3 * (5 - 4) / (5 - 2) = 1 + 3/3 = 2
    assert.equal(toGermanGrade("cgpa5", 4), 2);
  });
});

describe("gradeBand", () => {
  it("maps bands", () => {
    assert.equal(gradeBand(1.7), "strong");
    assert.equal(gradeBand(2.3), "meets_many");
    assert.equal(gradeBand(2.8), "limited_public");
    assert.equal(gradeBand(3.5), "unlikely_public");
  });
});

describe("evaluateGrade", () => {
  it("returns label and note", () => {
    const result = evaluateGrade("cgpa4", 3.6);
    assert.equal(result.band, "strong");
    assert.ok(result.bandLabel.length > 0);
    assert.ok(result.bandNote.length > 0);
  });
});
