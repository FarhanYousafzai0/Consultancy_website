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

const fixture = {
  maxErgebnisse: 2,
  stellenangebote: [
    {
      refnr: "10001-ABC",
      titel: "Ausbildung Fachinformatiker/in",
      arbeitgeber: "Example GmbH",
      arbeitsort: { ort: "Berlin" },
      aktuelleVeroeffentlichungsdatum: "2026-10-01",
    },
    {
      referenznummer: "10002-XYZ",
      beruf: "Pflegefachmann/-frau",
      arbeitgeber: "Klinik Nord",
      arbeitsort: { region: "Bayern" },
    },
    {
      // missing id — skipped
      titel: "Broken row",
    },
  ],
};

describe("jobsuche field mapping", () => {
  it("maps Parwaz Ausbildung fields to German search keywords", () => {
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

  it("normalizes API rows and drops incomplete ones", () => {
    const result = normalizeSearchResponse(fixture, 1, 20);
    assert.equal(result.listings.length, 2);
    assert.equal(result.total, 2);
    assert.equal(result.listings[0].title, "Ausbildung Fachinformatiker/in");
    assert.equal(result.listings[0].city, "Berlin");
    assert.ok(result.listings[0].url.includes("10001-ABC"));
    assert.equal(result.listings[1].city, "Bayern");
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
