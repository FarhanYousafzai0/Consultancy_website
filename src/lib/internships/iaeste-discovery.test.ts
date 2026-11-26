import assert from "node:assert/strict";
import test from "node:test";
import { discoverIaesteInternships } from "./iaeste-discovery";

const origin = "https://iaeste.org";
function fixture(robots: string, pages: Record<string, string | Response>) {
  const requests: string[] = [];
  const fetcher: typeof fetch = async input => {
    const url = String(input); requests.push(url);
    if (url === `${origin}/robots.txt`) return new Response(robots, { headers: { "content-type": "text/plain" } });
    const page = pages[url];
    if (page instanceof Response) return page;
    return page === undefined ? new Response("missing", { status: 404 }) : new Response(page, { headers: { "content-type": "text/html" } });
  };
  return { fetcher, requests };
}
const first = '<a class="card--internship" href="/internships/ch-2027-36">One</a><a rel="next" href="/internships?page=2&amp;sort=deadline_at">Next</a>';
const second = '<a class="card--internship" href="/internships/ch-2027-36">One</a><a href="/internships/gb-2027-01">Two</a>';

test("traverses listing pagination, deduplicates and fetches details", async () => {
  const f = fixture("User-agent: *\nDisallow: /admin/", {
    [`${origin}/internships`]: first,
    [`${origin}/internships?page=2&sort=deadline_at`]: second,
    [`${origin}/internships/ch-2027-36`]: "<h1>First</h1>",
    [`${origin}/internships/gb-2027-01`]: "<h1>Second</h1>",
  });
  const result = await discoverIaesteInternships({ fetcher: f.fetcher, delayMs: 0 });
  assert.equal(result.complete, true); assert.equal(result.listingPagesFetched, 2);
  assert.equal(result.detailUrls.length, 2); assert.equal(result.pages.length, 2);
  assert.match(result.pages[0].hash, /^[a-f0-9]{64}$/);
});

test("does not fetch detail pages disallowed by IAESTE robots", async () => {
  const f = fixture("User-agent: *\nDisallow: /internships/", { [`${origin}/internships`]: '<a href="/internships/ch-2027-36">One</a>' });
  const result = await discoverIaesteInternships({ fetcher: f.fetcher, delayMs: 0 });
  assert.equal(result.complete, false); assert.equal(result.detailUrls.length, 1);
  assert.match(result.failures[0], /blocked by robots/); assert.equal(f.requests.length, 2);
});

test("reports limits and failed detail fetches as incomplete", async () => {
  const f = fixture("User-agent: *\nAllow: /", { [`${origin}/internships`]: first });
  const result = await discoverIaesteInternships({ fetcher: f.fetcher, delayMs: 0, maxListingPages: 1 });
  assert.equal(result.complete, false); assert.match(result.failures.join(), /listing page limit/); assert.match(result.failures.join(), /HTTP 404/);
});

test("rejects off-origin redirects and does not fetch when robots is unavailable", async () => {
  const f = fixture("User-agent: *\nAllow: /", { [`${origin}/internships`]: new Response(null, { status: 302, headers: { location: "https://evil.example/" } }) });
  const result = await discoverIaesteInternships({ fetcher: f.fetcher, delayMs: 0 });
  assert.equal(result.complete, false); assert.match(result.failures[0], /outside IAESTE/); assert.equal(f.requests.length, 2);
  const unavailable = await discoverIaesteInternships({ fetcher: async () => new Response("unavailable", { status: 503 }), delayMs: 0 });
  assert.equal(unavailable.complete, false); assert.match(unavailable.failures[0], /robots.txt/);
});
