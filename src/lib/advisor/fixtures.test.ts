import assert from "node:assert/strict";
import { describe, it } from "node:test";

/** Pure helpers mirroring chat citation expectations for the fixture set. */

function inventingProgram(reply: string, knownNames: string[]) {
  // Fail if reply invents a university-looking name not in known list
  const claimed = reply.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3}\s+University)\b/g) ?? [];
  return claimed.filter((n) => !knownNames.some((k) => k.includes(n) || n.includes(k)));
}

function mustCite(reply: string) {
  return /source|verified|https?:\/\//i.test(reply);
}

describe("advisor Q&A fixtures (offline heuristics)", () => {
  const known = ["Technical University of Munich", "Saarland University"];

  it("rejects invented university names", () => {
    const bad = inventingProgram(
      "You should apply to Fake University of Atlantis immediately.",
      known
    );
    assert.ok(bad.length > 0);

    const good = inventingProgram(
      "Consider Saarland University — see our verified program card.",
      known
    );
    assert.equal(good.length, 0);
  });

  it("requires citation cues on factual replies", () => {
    assert.equal(mustCite("Maybe try somewhere in Germany."), false);
    assert.equal(
      mustCite("Deadline 15 July (verified 2026-10-06). Source: https://example.com"),
      true
    );
  });

  const questions = [
    "Do I need APS from Pakistan?",
    "What is a blocked account?",
    "uni-assist vs direct application",
    "Will I get into TUM with 2.8 German grade?",
    "DAAD scholarship odds for Master's CS",
    "Studienkolleg after FSc",
    "IELTS for English-taught Master's",
    "Winter semester deadlines",
    "What documents for Master's",
    "Can you guarantee admission?",
    "Ausbildung consultant please",
    "How does anabin work?",
    "Student visa documents",
    "SOP tips for Germany",
    "Public vs private university cost",
  ];

  it("has a 15-question manual script list", () => {
    assert.equal(questions.length, 15);
  });
});
