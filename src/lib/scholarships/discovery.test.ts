import assert from "node:assert/strict";
import test from "node:test";
import { canonicalizeDiscoveryUrl, discoverScholarshipLinks } from "./discovery";

test("canonicalizes URLs and removes tracking parameters", () => {
  assert.equal(
    canonicalizeDiscoveryUrl("HTTPS://Example.org/path/?utm_source=news&b=2&a=1#details"),
    "https://example.org/path?a=1&b=2"
  );
});

test("parses sitemap URLs, filters domains, deduplicates, and caps results", () => {
  const xml = `<?xml version="1.0"?><urlset>
    <url><loc>https://example.org/one?utm_campaign=x</loc><lastmod>2026-11-01</lastmod></url>
    <url><loc>https://sub.example.org/two</loc></url>
    <url><loc>https://example.org/one/</loc></url>
    <url><loc>https://not-example.org/three</loc></url>
  </urlset>`;

  assert.deepEqual(discoverScholarshipLinks({
    feedUrl: "https://example.org/sitemap.xml",
    xml,
    allowedDomains: ["example.org"],
    maxLinks: 2,
  }), [
    { url: "https://example.org/one", lastModified: "2026-11-01" },
    { url: "https://sub.example.org/two", lastModified: null },
  ]);
});

test("parses RSS links and accepts an absolute guid when link is absent", () => {
  const xml = `<rss><channel>
    <item><title>One</title><link><![CDATA[https://example.org/one?fbclid=abc]]></link><pubDate>Tue, 17 Nov 2026 00:00:00 GMT</pubDate></item>
    <item><title>Two</title><guid>https://example.org/two</guid></item>
  </channel></rss>`;

  assert.deepEqual(discoverScholarshipLinks({
    feedUrl: "https://example.org/feed.xml",
    xml,
    allowedDomains: ["example.org"],
  }), [
    { url: "https://example.org/one", lastModified: "Tue, 17 Nov 2026 00:00:00 GMT" },
    { url: "https://example.org/two", lastModified: null },
  ]);
});

test("parses Atom alternate links and ignores enclosure links", () => {
  const xml = `<feed>
    <entry><updated>2026-11-17T00:00:00Z</updated><link rel="enclosure" href="https://example.org/file.pdf"/><link rel="alternate" href="/scholarship"/></entry>
  </feed>`;

  assert.deepEqual(discoverScholarshipLinks({
    feedUrl: "https://example.org/atom.xml",
    xml,
    allowedDomains: ["example.org"],
  }), [{ url: "https://example.org/scholarship", lastModified: "2026-11-17T00:00:00Z" }]);
});

test("supports subdomains but rejects lookalike domains and honors zero cap", () => {
  const xml = `<urlset><url><loc>https://apply.example.org/a</loc></url><url><loc>https://example.org.evil.test/b</loc></url></urlset>`;
  assert.deepEqual(discoverScholarshipLinks({
    feedUrl: "https://example.org/sitemap.xml",
    xml,
    allowedDomains: ["example.org"],
    maxLinks: 0,
  }), []);
  assert.deepEqual(discoverScholarshipLinks({
    feedUrl: "https://example.org/sitemap.xml",
    xml,
    allowedDomains: ["example.org"],
  }).map((item) => item.url), ["https://apply.example.org/a"]);
});
