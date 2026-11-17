import assert from "node:assert/strict";
import test from "node:test";
import { allowedSourceUrl, fetchOfficialPage, pageLinks } from "./crawler";
import { supportsDeadline } from "./research";

test("official allowlist rejects lookalike hosts, credentials, and non-HTTPS", () => {
  assert.equal(allowedSourceUrl("https://apply.university.edu/form", ["university.edu"]), true);
  for (const url of ["https://fakeuniversity.edu", "https://university.edu.evil.test", "http://university.edu", "https://user@university.edu"]) {
    assert.equal(allowedSourceUrl(url, ["university.edu"]), false);
  }
});

test("HTML discovery resolves official relative detail and PDF links once", () => {
  const links = pageLinks('<a href="/funding?utm_source=a">Scholarship</a><a href="/funding">Again</a><a href="/guide.pdf">Guide</a><a href="https://evil.test">No</a>', "https://university.edu/", ["university.edu"]);
  assert.deepEqual(links.map((link) => link.url), ["https://university.edu/funding", "https://university.edu/guide.pdf"]);
});

test("crawler never follows a redirect outside the official registry", async () => {
  let calls = 0;
  const mock: typeof fetch = async () => { calls++; return new Response(null, { status: 302, headers: { location: "https://evil.test/" } }); };
  await assert.rejects(fetchOfficialPage("https://university.edu/", ["university.edu"], mock), /allowlist/);
  assert.equal(calls, 1);
});

test("fixture HTML yields funding text and linked deadline page", async () => {
  const mock: typeof fetch = async () => new Response('<p>Full tuition scholarship.</p><a href="/deadlines">Dates</a>', { headers: { "content-type": "text/html" } });
  const page = await fetchOfficialPage("https://university.edu/", ["university.edu"], mock);
  assert.match(page.text, /Full tuition scholarship/);
  assert.equal(page.links[0].url, "https://university.edu/deadlines");
});

test("confirmed deadlines require a verbatim quote with the same date and explicit year", () => {
  const text = "Apply by December 15, 2026. Scholarships cover full tuition.";
  assert.equal(supportsDeadline("2026-12-15", "Apply by December 15, 2026.", text), true);
  assert.equal(supportsDeadline("2027-12-15", "Apply by December 15, 2026.", text), false);
  assert.equal(supportsDeadline("2026-12-16", "Apply by December 15, 2026.", text), false);
  assert.equal(supportsDeadline("2026-12-15", "Apply by December 15, 2026.", "No deadlines."), false);
  assert.equal(supportsDeadline("2026-12-15", "Apply by December 15.", "Apply by December 15."), false);
});
