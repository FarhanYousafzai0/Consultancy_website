import { strict as assert } from "node:assert";
import { test } from "node:test";
import { parseIaesteDetail, type IaesteDetailPage } from "./iaeste-detail";

// Adapted from the public CH-2027-36 detail page, flattened like the crawler.
const page: IaesteDetailPage = {
  url: "https://iaeste.org/internships/ch-2027-36?utm_source=test",
  text: "IAESTE A.s.b.l. Internship Details Work Offered How To Apply About IAESTE Switzerland Testimonials Location Switzerland Internship type ON-SITE Reference Number CH-2027-36 Student Requirements General Discipline AGRICULTURE BIOLOGY Completed Years of Study 2 Field of Study - Languages English - Good (B1, B2) or German - Good (B1, B2) Required Knowledge and Experience Motivated students from agronomy. Other Requirements Valid driving license preferred but not required. Work Details Duration 34 Weeks Within 01.02.2027 - 30.09.2027 Company closed during holidays None Work Environment Field work Gross Pay 2400 CHF / month approx. 10 % Social security AHV/IV Working Hours 40 per week / 8 per day Living Lodging Type Of Accommodation Other Estimated cost of lodging 850 CHF / month Estimated cost of living (including lodging) 1650 CHF / month Interested In Applying For This Internship? Register now",
  links: [{ label: "Register", url: "https://iaeste.smartsimple.ie/s_csignup.jsp?token=example" }],
};

test("extracts detail-backed fields and preserves the availability window", () => {
  const result = parseIaesteDetail(page)!;
  assert.equal(result.canonicalIdentity, "iaeste-exchange-internships:CH-2027-36");
  assert.equal(result.title, null);
  assert.equal(result.country, "Switzerland");
  assert.equal(result.duration, "34 Weeks");
  assert.deepEqual(result.availabilityWindow, { from: "2027-02-01", to: "2027-09-30" });
  assert.equal(result.deadline, null);
  assert.equal(result.deadlineStatus, "not_published");
  assert.match(result.stipendSummary!, /^2400 CHF/);
  assert.ok(result.eligibilityCriteria.includes("Completed Years of Study: 2"));
  assert.ok(result.eligibilityCriteria.some((item) => item.includes("preferred but not required")));
  assert.ok(result.applicationUrl?.startsWith("https://iaeste.smartsimple.ie/"));
  for (const evidence of result.evidence) assert.ok(page.text.includes(evidence.quote));
});

test("leaves an unlabelled header date ambiguous when header text is available", () => {
  const withHeader = { ...page, text: `CH-2027-36 AGRICULTURE 27.11.2026 Apply Now ${page.text}` };
  assert.equal(parseIaesteDetail(withHeader)?.title, "AGRICULTURE");
  assert.equal(parseIaesteDetail(withHeader)?.deadlineStatus, "ambiguous");
  assert.equal(parseIaesteDetail(withHeader)?.deadline, null);
});

test("rejects other pages and mismatched identities", () => {
  assert.equal(parseIaesteDetail({ ...page, url: "https://iaeste.org/internships" }), null);
  assert.equal(parseIaesteDetail({ ...page, url: "https://evil.example/internships/ch-2027-36" }), null);
  assert.equal(parseIaesteDetail({ ...page, url: "https://iaeste.org/internships/ch-2027-29" }), null);
});

test("validates dates, avoids unlinked portals, and keeps unknowns unknown", () => {
  const altered = { ...page, text: page.text.replace("30.09.2027", "31.02.2027").replace("Field of Study -", "Field of Study -"), links: [{ label: "Register", url: "https://iaeste.smartsimple.ie.evil.example/" }] };
  const result = parseIaesteDetail(altered)!;
  assert.equal(result.availabilityWindow, null);
  assert.equal(result.applicationUrl, null);
  assert.ok(!result.eligibilityCriteria.some((item) => item.startsWith("Field of Study:")));
  const minimal = parseIaesteDetail({ ...page, text: "Reference Number CH-2027-36", links: [] })!;
  assert.equal(minimal.title, null);
  assert.equal(minimal.deadlineStatus, "not_published");
  assert.deepEqual(minimal.eligibilityCriteria, []);
});

test("accepts only an explicitly labelled valid deadline", () => {
  const explicit = { ...page, text: page.text.replace("Work Details Duration", "Application Deadline 15.12.2026 Work Details Duration") };
  assert.equal(parseIaesteDetail(explicit)?.deadline, "2026-12-15");
  assert.equal(parseIaesteDetail(explicit)?.deadlineStatus, "confirmed");
  assert.equal(parseIaesteDetail({ ...explicit, text: explicit.text.replace("15.12.2026", "31.02.2026") })?.deadlineStatus, "ambiguous");
});
