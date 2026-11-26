import assert from "node:assert/strict";
import test from "node:test";
import {
  validateInternshipDates,
  validateInternshipDeadline,
  isValidDateValue,
} from "./validation";

test("accepts valid date-only and timestamp values", () => {
  assert.equal(isValidDateValue("2026-02-28"), true);
  assert.equal(isValidDateValue("2026-11-26T12:00:00.000Z"), true);
  assert.equal(isValidDateValue("2026-02-31"), false);
  assert.equal(isValidDateValue("not-a-date"), false);
});

test("rejects reversed or invalid internship periods", () => {
  assert.deepEqual(
    validateInternshipDates("2027-01-01", "2026-12-31"),
    ["startDate must be before or equal to endDate"]
  );
  assert.deepEqual(validateInternshipDates("2026-02-31", "2026-03-01"), [
    "startDate must be a valid date",
  ]);
  assert.deepEqual(validateInternshipDates(null, "2026-03-01"), []);
});

test("requires a valid deadline only for confirmed deadline status", () => {
  assert.deepEqual(validateInternshipDeadline("confirmed", "2026-12-01"), []);
  assert.deepEqual(validateInternshipDeadline("confirmed", null), [
    "confirmed deadlineStatus requires a valid deadline",
  ]);
  assert.deepEqual(validateInternshipDeadline("confirmed", "2026-02-31"), [
    "confirmed deadlineStatus requires a valid deadline",
  ]);
  assert.deepEqual(validateInternshipDeadline("rolling", null), []);
  assert.deepEqual(validateInternshipDeadline("ambiguous", "2026-12-01"), [
    "non-confirmed deadlineStatus must not carry a deadline",
  ]);
});
