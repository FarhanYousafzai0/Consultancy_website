import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { translateAusbildungTitle } from "./title";

describe("translateAusbildungTitle", () => {
  it("translates common healthcare titles and gender markers", () => {
    assert.equal(
      translateAusbildungTitle("Ausbildung zum Ergotherapeuten (m/w/d)"),
      "Vocational training as Occupational therapist (m/f/d)"
    );
    assert.equal(
      translateAusbildungTitle("Pflegefachfrau / Pflegefachmann (m/w/d)"),
      "Nursing specialist (m/f/d)"
    );
    assert.equal(
      translateAusbildungTitle("Ausbildung zur Pflegefachfrau / zum Pflegefachmann (w/m/d)"),
      "Vocational training as Nursing specialist (m/f/d)"
    );
  });

  it("translates common technical titles", () => {
    assert.equal(
      translateAusbildungTitle("Ausbildung Fachinformatiker (m/w/d)"),
      "Vocational training IT specialist (m/f/d)"
    );
  });

  it("preserves already-English titles", () => {
    assert.equal(
      translateAusbildungTitle("IT Support Specialist (m/w/d)"),
      "IT Support Specialist (m/f/d)"
    );
  });
});
