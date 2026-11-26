import assert from "node:assert/strict";
import test from "node:test";
import { internshipSources } from "@/data/internship-sources";
import { fetchInternshipPage, internshipDomains } from "./crawler";

test("initial internship registry contains only HTTPS official sources", () => {
  assert.deepEqual(internshipSources.map((source) => source.id), [
    "cern-internships",
    "esa-student-internships",
    "oecd-internships",
    "world-bank-internships",
    "us-state-department-internships",
    "mit-urop",
    "microsoft-university-internships",
    "iaeste-exchange-internships",
  ]);
  for (const source of internshipSources) {
    assert.equal(new URL(source.url).protocol, "https:");
    assert.equal(new URL(source.url).hostname, source.domain);
    assert.match(source.verificationBasis, /^Official /);
  }
});

test("initial registry covers every approved source category", () => {
  const categories = new Set(internshipSources.map((source) => source.organizationType));
  assert.equal(categories.has("government"), true);
  assert.equal(categories.has("university") || categories.has("research_institute"), true);
  assert.equal(categories.has("company"), true);
  assert.equal(categories.has("exchange_program"), true);
  assert.equal(categories.has("international_organization"), true);
});

test("internship crawler keeps official links and rejects redirects outside the registry", async () => {
  const source = internshipSources[0];
  const page = await fetchInternshipPage(source.url, source, async () =>
    new Response(
      '<h1>Short-Term Internship</h1><p>Apply by 31 January 2027.</p><a href="/apply/123">Apply</a><a href="https://evil.test/apply">No</a>',
      { headers: { "content-type": "text/html" } }
    )
  );
  assert.match(page.text, /Apply by 31 January 2027/);
  assert.ok(page.links.some((link) => link.url === "https://careers.cern/apply/123"));
  assert.deepEqual(internshipDomains(source), ["careers.cern"]);

  await assert.rejects(
    fetchInternshipPage(source.url, source, async () =>
      new Response(null, { status: 302, headers: { location: "https://evil.test/" } })
    ),
    /allowlist/
  );
});

test("internship crawler enforces the official body-size limit", async () => {
  const source = internshipSources[0];
  const oversized = new Uint8Array(8_000_001);
  await assert.rejects(
    fetchInternshipPage(source.url, source, async () =>
      new Response(oversized, { headers: { "content-type": "text/html" } })
    ),
    /8 MB limit/
  );
});
