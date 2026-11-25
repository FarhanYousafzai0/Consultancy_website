import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import {
  buildJobsucheUrl,
  clearJobsucheCache,
  keywordForField,
  normalizeListing,
  normalizeSearchResponse,
  ANGEBOTSART_AUSBILDUNG,
} from "@/lib/ausbildung/jobsuche";

const currentApiFixture = {
  maxErgebnisse: 2,
  ergebnisliste: [
    {
      stellenangebotsTitel: "Ausbildung zum Ergotherapeuten (m/w/d)",
      firma: "Evang. Diakonissenhaus Berlin Teltow Lehnin Stiftung",
      referenznummer: "15245-2026kzygjhmb-000-S",
      stellenlokationen: [
        {
          adresse: {
            plz: "15926",
            ort: "Luckau, Niederlausitz",
            region: "BRANDENBURG",
          },
        },
      ],
      datumErsteVeroeffentlichung: "2026-11-25",
    },
    {
      stellenangebotsTitel: "Ausbildung Ergotherapeut (m/w/d)",
      firma: "Privates Bildungszentrum Oschatz gGmbH",
      referenznummer: "12781-16421307-KAL-S",
      stellenlokationen: [{ adresse: { ort: "Oschatz", region: "SACHSEN" } }],
      externeURL: "https://www.kalaydo.de/jobs/16421307/",
      datumErsteVeroeffentlichung: "2026-11-25",
    },
    {
      // missing id — skipped
      stellenangebotsTitel: "Broken row",
    },
  ],
};

describe("jobsuche field mapping", () => {
  it("maps Parwaaz Ausbildung fields to German search keywords", () => {
    assert.equal(keywordForField("it"), "Fachinformatiker");
    assert.equal(keywordForField("nursing"), "Pflegefachmann");
    assert.equal(keywordForField("mechatronics"), "Mechatroniker");
    assert.equal(keywordForField("hospitality"), "Hotelfachmann");
    assert.equal(keywordForField("trades"), "Elektroniker");
    assert.equal(keywordForField("other"), "Ausbildung");
    assert.equal(keywordForField(null), "Ausbildung");
  });
});

describe("jobsuche normalization", () => {
  beforeEach(() => clearJobsucheCache());

  it("normalizes the current Jobsuche response and drops incomplete rows", () => {
    const result = normalizeSearchResponse(currentApiFixture, 1, 20);
    assert.equal(result.listings.length, 2);
    assert.equal(result.total, 2);
    assert.equal(result.listings[0].title, "Ausbildung zum Ergotherapeuten (m/w/d)");
    assert.equal(result.listings[0].employer, "Evang. Diakonissenhaus Berlin Teltow Lehnin Stiftung");
    assert.equal(result.listings[0].city, "Luckau, Niederlausitz");
    assert.equal(result.listings[0].publishedAt, "2026-11-25");
    assert.ok(result.listings[0].url.includes("15245-2026kzygjhmb-000-S"));
    assert.equal(result.listings[1].city, "Oschatz");
    assert.equal(result.listings[1].url, "https://www.kalaydo.de/jobs/16421307/");
  });

  it("uses safe fallbacks when current API fields are missing", () => {
    const listing = normalizeListing({
      referenznummer: "fallback-1",
      stellenangebotsTitel: "Ausbildung ohne Zusatzdaten",
      stellenlokationen: [{}],
    });

    assert.deepEqual(listing, {
      id: "fallback-1",
      title: "Ausbildung ohne Zusatzdaten",
      employer: "Employer",
      city: "Germany",
      url: "https://www.arbeitsagentur.de/jobsuche/jobdetail/fallback-1",
      publishedAt: null,
    });
  });

  it("preserves an empty API response as an empty result", () => {
    const result = normalizeSearchResponse(
      { ergebnisliste: [], maxErgebnisse: 0 },
      2,
      20
    );

    assert.deepEqual(result, { listings: [], page: 2, size: 20, total: 0 });
  });

  it("builds Ausbildung-filtered search URLs", () => {
    const url = buildJobsucheUrl({ field: "it", where: "München", page: 2 });
    assert.ok(url.includes(`angebotsart=${ANGEBOTSART_AUSBILDUNG}`));
    assert.ok(url.includes("was=Fachinformatiker"));
    assert.ok(decodeURIComponent(url).includes("wo=München") || url.includes("wo="));
    assert.ok(url.includes("page=2"));
  });

  it("normalizeListing returns null without id", () => {
    assert.equal(normalizeListing({ titel: "No id" }), null);
  });
});
