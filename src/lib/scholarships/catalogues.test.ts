import assert from "node:assert/strict";
import test from "node:test";
import {
  DAAD_ORIGIN_PAKISTAN,
  daadSources,
  distinctScholarshipName,
  erasmusMundusLastPage,
  erasmusMundusSources,
  parseErasmusMundusCatalogue,
} from "./catalogues";
import { supportsDeadline } from "./research";

const daadScript = `var scholarships = TAFFY(${JSON.stringify([
  { sapProgid: 57135739, nameEn: "Study Scholarships - Master Studies", status: [3], origin: [DAAD_ORIGIN_PAKISTAN, 7], intentions: [1] },
  { sapProgid: 1, nameEn: "Research Grants - Doctoral Programmes", status: [4], origin: [DAAD_ORIGIN_PAKISTAN], intentions: [2] },
  { sapProgid: 2, nameEn: "Regional programme", status: [3], origin: [7], intentions: [1] },
])});`;

test("daadSources keeps master's study funding open to Pakistani graduates", () => {
  const sources = daadSources(daadScript);
  assert.equal(sources.length, 1);
  assert.equal(sources[0].id, "daad-57135739");
  assert.equal(sources[0].maxPages, 3);
  assert.equal(sources[0].trustPageLinks, true);
  assert.match(sources[0].url, /detail=57135739/);
  assert.match(sources[0].url, /origin=194/);
});

test("daadSources rejects data that is not a TAFFY wrapper", () => {
  assert.throws(() => daadSources("<html>maintenance</html>"));
});

const emPage = `
  <a href="https://www.quanteem.eu/" class="ecl-link" data-ecl-title-link ><span class="ecl-link__label">Quantum Technologies &amp; Engineering</span></a>
  <p><a href="https://erasmus-plus.ec.europa.eu/projects/search/details/1">overview</a></p>
  <a href="http://emildai.eu" class="ecl-link" data-ecl-title-link ><span>European Master in Law, Data and AI</span></a>
  <a href="?page=1">2</a><a href="?page=9">Last</a>`;

test("parseErasmusMundusCatalogue reads programme cards only and upgrades to HTTPS", () => {
  const programmes = parseErasmusMundusCatalogue(emPage);
  assert.deepEqual(programmes, [
    { name: "Quantum Technologies & Engineering", url: "https://www.quanteem.eu/" },
    { name: "European Master in Law, Data and AI", url: "https://emildai.eu/" },
  ]);
  assert.equal(erasmusMundusLastPage(emPage), 9);
});

test("erasmusMundusSources gives each programme its own domain and a stable id", () => {
  const sources = erasmusMundusSources([
    { name: "QuanTEEM", url: "https://www.quanteem.eu/" },
    { name: "QuanTEEM again", url: "https://quanteem.eu" },
    { name: "Bio", url: "https://www.up.pt/minder/web/" },
  ]);
  assert.deepEqual(sources.map((source) => [source.id, source.domain]), [
    ["em-quanteem-eu", "quanteem.eu"],
    ["em-up-pt-minder-web", "up.pt"],
  ]);
});

test("distinctScholarshipName names generic Erasmus awards after their programme", () => {
  const source = { id: "em-emildai-eu", name: "European Master in Law, Data and AI (Erasmus Mundus Joint Master)" };
  assert.equal(distinctScholarshipName(source, "Erasmus Mundus Scholarship"), "European Master in Law, Data and AI: Erasmus Mundus Scholarship");
  assert.equal(distinctScholarshipName(source, "Erasmus Mundus Joint Master Scholarship"), "European Master in Law, Data and AI: Erasmus Mundus Scholarship");
  assert.equal(distinctScholarshipName(source, "EMILDAI Erasmus Mundus Scholarship"), "EMILDAI Erasmus Mundus Scholarship");
  assert.equal(distinctScholarshipName({ id: "daad-1", name: "X" }, "Erasmus Mundus Scholarship"), "Erasmus Mundus Scholarship");
});

test("supportsDeadline accepts European numeric dates quoted from the source", () => {
  const text = "You can find the current dates here: 31.08.2026 Selection date in February 2027";
  assert.equal(supportsDeadline("2026-08-31", "31.08.2026 Selection date in February 2027", text), true);
  assert.equal(supportsDeadline("2026-08-13", "31.08.2026 Selection date in February 2027", text), false);
});
