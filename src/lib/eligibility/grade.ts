import type { GradeBand, GradeResult, GradeSystem, PercentagePassMark } from "./types";

/**
 * Modified Bavarian formula:
 * German grade = 1 + 3 × (Nmax − Nd) / (Nmax − Nmin)
 * 1.0 = best, 4.0 = weakest pass, >4.0 = fail band.
 */
export function toGermanGrade(
  system: GradeSystem,
  value: number,
  percentagePassMark: PercentagePassMark = 40
): number {
  let nMax: number;
  let nMin: number;
  let nd: number;

  if (system === "percentage") {
    nMax = 100;
    nMin = percentagePassMark;
    nd = value;
  } else if (system === "cgpa4") {
    nMax = 4;
    nMin = 2;
    nd = value;
  } else {
    nMax = 5;
    nMin = 2;
    nd = value;
  }

  if (nMax === nMin) return 4;
  const raw = 1 + (3 * (nMax - nd)) / (nMax - nMin);
  return Math.round(Math.min(5, Math.max(1, raw)) * 100) / 100;
}

export function gradeBand(germanGrade: number): GradeBand {
  if (germanGrade <= 2.0) return "strong";
  if (germanGrade <= 2.5) return "meets_many";
  if (germanGrade <= 3.0) return "limited_public";
  return "unlikely_public";
}

const BAND_COPY: Record<GradeBand, { label: string; note: string }> = {
  strong: {
    label: "Strong",
    note: "Your converted grade is competitive for many public programs.",
  },
  meets_many: {
    label: "Meets many minimums",
    note: "Your converted grade meets the usual published minimums for many programs.",
  },
  limited_public: {
    label: "Limited public options",
    note: "Some public programs will be a stretch; private or less competitive options may fit better.",
  },
  unlikely_public: {
    label: "Public universities unlikely",
    note: "Most public programs set a higher bar. This is guidance only — each university decides.",
  },
};

export function evaluateGrade(
  system: GradeSystem,
  value: number,
  percentagePassMark: PercentagePassMark = 40
): GradeResult {
  const germanGrade = toGermanGrade(system, value, percentagePassMark);
  const band = gradeBand(germanGrade);
  const copy = BAND_COPY[band];
  return {
    germanGrade,
    band,
    bandLabel: copy.label,
    bandNote: copy.note,
  };
}
