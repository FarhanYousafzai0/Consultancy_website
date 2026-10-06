import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseProgramImportCsv,
  parseProgramImportJson,
  rowToDraftProgram,
} from "@/lib/admin/program-import";

describe("program import", () => {
  it("forces draft status and null lastVerifiedAt", () => {
    const p = rowToDraftProgram({
      name: "M.Sc. Data Science",
      university: "Test Uni",
      universityType: "public",
      degreeLevel: "master",
      field: "data",
      city: "Berlin",
      state: "Berlin",
      languageOfInstruction: "english",
      germanRequired: "none",
      applicationRoute: "direct",
      tuitionPerSemesterEur: 0,
      semesterFeeEur: 300,
      sourceUrl: "https://example.com/program",
      notes: "",
    });
    assert.equal(p.status, "draft");
    assert.equal(p.lastVerifiedAt, null);
  });

  it("parses JSON array", () => {
    const { programs, errors } = parseProgramImportJson(
      JSON.stringify([
        {
          name: "M.Sc. CS",
          university: "Uni A",
          city: "Hamburg",
          sourceUrl: "https://example.com/a",
        },
      ])
    );
    assert.equal(errors.length, 0);
    assert.equal(programs.length, 1);
    assert.equal(programs[0].status, "draft");
  });

  it("parses CSV with header", () => {
    const csv = `name,university,city,sourceUrl
M.Sc. EE,Uni B,Aachen,https://example.com/b`;
    const { programs, errors } = parseProgramImportCsv(csv);
    assert.equal(errors.length, 0);
    assert.equal(programs.length, 1);
    assert.equal(programs[0].university, "Uni B");
  });
});
