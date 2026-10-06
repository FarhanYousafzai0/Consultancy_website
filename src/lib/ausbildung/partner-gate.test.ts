import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isAusbildungPartnerUnlocked } from "@/lib/ausbildung/partner-gate";
import type { AusbildungEventType } from "@/lib/ausbildung/demand";

function totals(
  partial: Partial<Record<AusbildungEventType, number>>
): Record<AusbildungEventType, number> {
  return {
    ausbildung_check_completed: 0,
    ausbildung_listing_view: 0,
    ausbildung_apply_click: 0,
    ...partial,
  };
}

describe("ausbildung partner gate", () => {
  it("stays locked below default thresholds", () => {
    assert.equal(
      isAusbildungPartnerUnlocked(totals({ ausbildung_check_completed: 10 })),
      false
    );
  });

  it("unlocks when checks meet default min", () => {
    assert.equal(
      isAusbildungPartnerUnlocked(totals({ ausbildung_check_completed: 50 })),
      true
    );
  });

  it("unlocks when apply clicks meet default min", () => {
    assert.equal(
      isAusbildungPartnerUnlocked(totals({ ausbildung_apply_click: 25 })),
      true
    );
  });
});
