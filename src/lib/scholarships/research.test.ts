import assert from "node:assert/strict";
import test from "node:test";
import { extractedScholarshipSchema, htmlToText } from "./research";

test("htmlToText removes scripts, styles, and markup while preserving readable text", () => {
  const html = `
    <html>
      <head><style>.hidden { display: none }</style><script>throw new Error("ignore");</script></head>
      <body><h1>DAAD Scholarship</h1><p>Apply <strong>before</strong> 31 January.</p></body>
    </html>
  `;

  assert.equal(
    htmlToText(html),
    "DAAD Scholarship Apply before 31 January."
  );
});

test("htmlToText decodes supported entities and normalizes whitespace", () => {
  assert.equal(
    htmlToText("<p>Funding:&nbsp;&nbsp;tuition &amp; living costs</p>\n<p>Open</p>"),
    "Funding: tuition & living costs Open"
  );
});

test("htmlToText handles plain text and empty markup", () => {
  assert.equal(htmlToText("  already readable text  "), "already readable text");
  assert.equal(htmlToText("<div></div><span></span>"), "");
});

test("extracted scholarship schema accepts supported degree levels and official URLs", () => {
  const result = extractedScholarshipSchema.safeParse({
    scholarships: [
      {
        name: "Global Future Scholarship",
        provider: "Example University",
        slug: "global-future-scholarship",
        levels: ["bachelor", "master", "phd"],
        nationalities: ["PK"],
        studyCountries: ["DE"],
        fields: ["computer_science"],
        amountSummary: "Tuition and living stipend",
        coverage: "Tuition, accommodation, and monthly stipend",
        fundingType: "fully_funded",
        languageRequirements: ["IELTS 6.5"],
        cycles: [{ openAt: "2026-10-01", closeAt: "2027-01-31", status: "confirmed", evidence: "Apply by January 31, 2027." }],
        applicationUrl: "https://example.edu/apply",
        sourceUrl: "https://example.edu/scholarships",
        notes: "Apply through the official university page.",
      },
    ],
  });

  assert.equal(result.success, true);
});

test("extracted scholarship schema rejects unsupported degree levels and invalid URLs", () => {
  const result = extractedScholarshipSchema.safeParse({
    scholarships: [
      {
        name: "Invalid Scholarship",
        provider: "Example University",
        slug: "invalid-scholarship",
        levels: ["undergraduate"],
        nationalities: ["PK"],
        studyCountries: ["DE"],
        fields: ["computer_science"],
        amountSummary: "Unknown",
        coverage: "Unknown",
        fundingType: "unknown",
        languageRequirements: [],
        cycles: [],
        applicationUrl: "not-a-url",
        sourceUrl: "https://example.edu/scholarships",
        notes: "",
      },
    ],
  });

  assert.equal(result.success, false);
});

// Provider fallback cannot be isolated without changing production exports or
// adding a module-mocking dependency: research.ts imports generateObject and
// analysisModel as static bindings. The fallback remains covered manually by
// running the research worker with the primary provider unavailable.
// Retry classification helpers are not currently present; retry behavior lives
// as an inline loop in scripts/research-scholarships.ts.
