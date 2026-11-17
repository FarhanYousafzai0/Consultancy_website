import assert from "node:assert/strict";
import test from "node:test";
import { scholarshipAvailability, scholarshipDeadline } from "./status";

const now = new Date("2026-11-17T12:00:00.000Z");

test("marks a confirmed cycle open", () => {
  assert.equal(
    scholarshipAvailability(
      { cycles: [{ openAt: "2026-10-01", closeAt: "2027-01-31", status: "confirmed" }] },
      now
    ),
    "open"
  );
});

test("does not keep a confirmed cycle open without a finite close", () => {
  assert.equal(
    scholarshipAvailability(
      { cycles: [{ openAt: "2026-10-01", closeAt: null, status: "confirmed" }] },
      now
    ),
    "unknown"
  );
});

test("treats a date-only close as valid through the end of that UTC day", () => {
  assert.equal(
    scholarshipAvailability(
      { cycles: [{ openAt: "2026-10-01", closeAt: "2026-11-17", status: "confirmed" }] },
      new Date("2026-11-17T23:59:59.500Z")
    ),
    "closing_soon"
  );
  assert.equal(
    scholarshipAvailability(
      { cycles: [{ openAt: "2026-10-01", closeAt: "2026-11-17", status: "confirmed" }] },
      new Date("2026-11-18T00:00:00.000Z")
    ),
    "closed"
  );
});

test("marks a deadline within fourteen days closing soon", () => {
  assert.equal(
    scholarshipAvailability(
      { cycles: [{ openAt: "2026-10-01", closeAt: "2026-11-25", status: "confirmed" }] },
      now
    ),
    "closing_soon"
  );
});

test("marks a future cycle opening soon", () => {
  assert.equal(
    scholarshipAvailability(
      { cycles: [{ openAt: "2027-01-01", closeAt: "2027-03-01", status: "confirmed" }] },
      now
    ),
    "opening_soon"
  );
});

test("does not treat a predicted future cycle as confirmed opening soon", () => {
  assert.equal(
    scholarshipAvailability(
      { cycles: [{ openAt: "2027-01-01", closeAt: "2027-03-01", status: "predicted" }] },
      now
    ),
    "unknown"
  );
});

test("invalid dates produce unknown rather than an active status", () => {
  assert.equal(
    scholarshipAvailability(
      { cycles: [{ openAt: "not-a-date", closeAt: "2027-01-01", status: "confirmed" }] },
      now
    ),
    "unknown"
  );
});

test("rejects calendar-invalid date-only values instead of normalizing them", () => {
  assert.equal(
    scholarshipAvailability(
      { cycles: [{ openAt: "2026-02-31", closeAt: "2027-01-01", status: "confirmed" }] },
      now
    ),
    "unknown"
  );
});

test("excludes reversed cycles from current and closed status", () => {
  const reversed = {
    cycles: [{ openAt: "2027-01-01", closeAt: "2026-01-01", status: "confirmed" as const }],
  };

  assert.equal(scholarshipAvailability(reversed, now), "unknown");
  assert.equal(scholarshipDeadline(reversed, now), null);
});

test("marks a past cycle closed", () => {
  assert.equal(
    scholarshipAvailability(
      { cycles: [{ openAt: "2026-01-01", closeAt: "2026-02-01", status: "confirmed" }] },
      now
    ),
    "closed"
  );
});

test("does not call an undated scholarship open", () => {
  assert.equal(scholarshipAvailability({ cycles: [] }, now), "unknown");
});

test("returns the next reachable deadline", () => {
  assert.equal(
    scholarshipDeadline(
      {
        cycles: [
          { openAt: "2026-01-01", closeAt: "2026-02-01", status: "confirmed" },
          { openAt: "2027-01-01", closeAt: "2027-03-01", status: "confirmed" },
        ],
      },
      now
    ),
    "2027-03-01"
  );
});

test("chooses the current cycle before a later cycle", () => {
  assert.equal(
    scholarshipDeadline(
      {
        cycles: [
          { openAt: "2026-10-01", closeAt: "2026-12-01", status: "confirmed" },
          { openAt: "2027-01-01", closeAt: "2027-03-01", status: "confirmed" },
        ],
      },
      now
    ),
    "2026-12-01"
  );
});

test("returns the most recent closed deadline when no current or next cycle exists", () => {
  assert.equal(
    scholarshipDeadline(
      {
        cycles: [
          { openAt: "2025-01-01", closeAt: "2025-02-01", status: "confirmed" },
          { openAt: "2026-01-01", closeAt: "2026-02-01", status: "confirmed" },
        ],
      },
      now
    ),
    "2026-02-01"
  );
});

test("honors explicit timezone offsets in timestamps", () => {
  assert.equal(
    scholarshipAvailability(
      { cycles: [{ openAt: "2026-11-17T00:00:00+05:00", closeAt: "2026-11-17T23:00:00+05:00", status: "confirmed" }] },
      new Date("2026-11-17T18:30:00Z")
    ),
    "closed"
  );
});
