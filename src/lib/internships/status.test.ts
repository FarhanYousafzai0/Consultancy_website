import assert from "node:assert/strict";
import test from "node:test";
import { internshipAvailability } from "./status";

const now = new Date("2026-11-26T12:00:00.000Z");

test("marks a published confirmed internship open", () => {
  assert.equal(
    internshipAvailability(
      { deadline: "2026-12-31", deadlineStatus: "confirmed", publicationStatus: "published" },
      now
    ),
    "open"
  );
});

test("treats a date-only deadline as valid through the full UTC day", () => {
  assert.equal(
    internshipAvailability(
      { deadline: "2026-11-26", deadlineStatus: "confirmed", publicationStatus: "published" },
      new Date("2026-11-26T23:59:59.999Z")
    ),
    "closing_soon"
  );
  assert.equal(
    internshipAvailability(
      { deadline: "2026-11-26", deadlineStatus: "confirmed", publicationStatus: "published" },
      new Date("2026-11-27T00:00:00.000Z")
    ),
    "closed"
  );
});

test("marks a deadline within fourteen days as closing soon", () => {
  assert.equal(
    internshipAvailability(
      { deadline: "2026-12-09", deadlineStatus: "confirmed", publicationStatus: "published" },
      now
    ),
    "closing_soon"
  );
});

test("does not infer availability for rolling, unpublished, ambiguous, invalid, or reversed data", () => {
  for (const value of [
    { deadline: null, deadlineStatus: "rolling" as const },
    { deadline: null, deadlineStatus: "not_published" as const },
    { deadline: null, deadlineStatus: "ambiguous" as const },
    { deadline: "2026-02-31", deadlineStatus: "confirmed" as const },
  ]) {
    assert.equal(
      internshipAvailability({ ...value, publicationStatus: "published" }, now),
      "unknown"
    );
  }
});

test("returns closed for an expired or archived listing", () => {
  assert.equal(
    internshipAvailability(
      { deadline: "2027-12-31", deadlineStatus: "confirmed", publicationStatus: "expired" },
      now
    ),
    "closed"
  );
  assert.equal(
    internshipAvailability(
      { deadline: "2027-12-31", deadlineStatus: "confirmed", publicationStatus: "archived" },
      now
    ),
    "closed"
  );
});
