import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  degreeForCourseType,
  isInternationalProgramme,
  isSupportedCourseType,
  relatedScholarships,
  scholarshipPurposeOf,
} from "./catalog";

describe("daad catalog", () => {
  it("maps DAAD course types we can search", () => {
    assert.equal(degreeForCourseType("master"), "master");
    assert.equal(degreeForCourseType("bachelor"), "bachelor");
    assert.equal(degreeForCourseType("phd"), null);
    assert.equal(isSupportedCourseType("language"), false);
  });

  it("treats English and bilingual programmes as international", () => {
    assert.equal(isInternationalProgramme("english"), true);
    assert.equal(isInternationalProgramme("both"), true);
    assert.equal(isInternationalProgramme("german"), false);
  });

  it("lists DAAD scholarships before other funders", () => {
    const related = relatedScholarships("master", "computer_science", [
      {
        id: "hec",
        name: "HEC",
        provider: "Higher Education Commission (Pakistan)",
        levels: ["master"],
        fields: ["computer_science"],
      },
      {
        id: "daad",
        name: "DAAD Study Scholarships",
        provider: "DAAD",
        levels: ["master"],
        fields: ["computer_science"],
      },
    ]);
    assert.equal(related[0]?.id, "daad");
    assert.equal(related[0]?.daad, true);
  });

  it("classifies scholarship purpose from the record", () => {
    assert.equal(
      scholarshipPurposeOf({
        name: "DAAD Study Scholarships — Master's",
        coverage: "Living costs",
        levels: ["master"],
      }),
      "study"
    );
    assert.equal(
      scholarshipPurposeOf({
        name: "Research stay",
        coverage: "Doctoral research grant",
        levels: ["master"],
      }),
      "research"
    );
    assert.equal(
      scholarshipPurposeOf({
        name: "University summer language course",
        coverage: "Course fee",
        levels: ["bachelor"],
      }),
      "language"
    );
  });
});
