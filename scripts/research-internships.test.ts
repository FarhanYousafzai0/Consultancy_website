import { strict as assert } from "node:assert";
import test from "node:test";
import {
  createInternshipResearchMetrics,
  formatInternshipResearchSummary,
  parseInternshipResearchArgs,
  validateInternshipResearchEnvironment,
} from "./research-internships";

test("parses dry-run, force, selected sources, and bounded concurrency", () => {
  assert.deepEqual(parseInternshipResearchArgs([
    "--dry-run",
    "--force",
    "--sources=cern-internships, esa-student-internships",
    "--concurrency=99",
  ]), {
    dryRun: true,
    force: true,
    selection: ["cern-internships", "esa-student-internships"],
    concurrency: 8,
  });
});

test("uses safe defaults for malformed or missing arguments", () => {
  assert.deepEqual(parseInternshipResearchArgs(["--sources= , ", "--concurrency=nope"]), {
    dryRun: false,
    force: false,
    selection: undefined,
    concurrency: 4,
  });
});

test("requires cron and AI credentials, plus MongoDB for writes", () => {
  assert.deepEqual(validateInternshipResearchEnvironment({ dryRun: true }, {}), [
    "CRON_SECRET",
    "GEMINI_API_KEY (or fallback provider key)",
  ]);
  assert.deepEqual(validateInternshipResearchEnvironment({ dryRun: false }, {
    CRON_SECRET: "secret",
    GEMINI_API_KEY: "gemini",
  }), ["MONGODB_URI"]);
});

test("dry-run does not require MongoDB", () => {
  assert.deepEqual(validateInternshipResearchEnvironment({ dryRun: true }, {
    CRON_SECRET: "secret",
    OPENAI_API_KEY: "openai",
  }), []);
});

test("formats structured metrics for CI logs", () => {
  const metrics = createInternshipResearchMetrics();
  metrics.succeeded = 2;
  metrics.extracted = 5;
  metrics.records = 4;
  metrics.skipped = 1;
  assert.deepEqual(formatInternshipResearchSummary({ dryRun: true, concurrency: 3 }, ["cern-internships"], metrics), {
    dryRun: true,
    sources: ["cern-internships"],
    concurrency: 3,
    ...metrics,
  });
});
