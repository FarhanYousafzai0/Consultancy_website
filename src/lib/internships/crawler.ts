import { createHash } from "node:crypto";
import { allowedSourceUrl, fetchOfficialPage, pageLinks } from "@/lib/scholarships/crawler";
import { htmlToText } from "@/lib/scholarships/research";
import type { InternshipSource } from "@/data/internship-sources";

export { allowedSourceUrl, pageLinks };

export type InternshipFetchedPage = Awaited<ReturnType<typeof fetchOfficialPage>>;

export function internshipDomains(source: InternshipSource) {
  return [source.domain, ...(source.allowedDomains ?? [])];
}

export async function fetchInternshipPage(
  url: string,
  source: InternshipSource,
  fetcher: typeof fetch = fetch
) {
  return fetchOfficialPage(url, internshipDomains(source), fetcher, false, true);
}

export function combineInternshipPages(pages: readonly InternshipFetchedPage[]) {
  return pages
    .map((page) =>
      [
        `PAGE URL: ${page.url}`,
        page.text.slice(0, 30000),
        "OFFICIAL LINKS:",
        page.links.map((link) => `${link.label}: ${link.url}`).join("\n"),
      ].join("\n")
    )
    .join("\n\n");
}

export function internshipContentHash(pages: readonly InternshipFetchedPage[]) {
  return createHash("sha256")
    .update("internship-evidence-v1")
    .update(pages.map((page) => `${page.url}|${page.hash}`).sort().join("\n"))
    .digest("hex");
}

export function safeHtmlToText(html: string) {
  return htmlToText(html);
}
