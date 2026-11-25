const TITLE_PHRASES: Array<[RegExp, string]> = [
  [/\bAusbildung\s+(?:zur\s+)?Pflegefachfrau\s*\/\s*(?:zum\s+)?Pflegefachmann\b/gi, "Vocational training as Nursing specialist"],
  [/\bPflegefachfrau\s*\/\s*(?:zum\s+)?Pflegefachmann\b/gi, "Nursing specialist"],
  [/\bPflegefachmann:frau\b/gi, "Nursing specialist"],
  [/\bPflegefachfrau\s*\/\s*Pflegefachmann\b/gi, "Nursing specialist"],
  [/\bAusbildung\s+zum\/zur\s+([A-Za-zÄÖÜäöüß-]+)/gi, "Vocational training as $1"],
  [/\bAusbildung\s+zur\s+([A-Za-zÄÖÜäöüß-]+)/gi, "Vocational training as $1"],
  [/\bAusbildung\s+zum\s+([A-Za-zÄÖÜäöüß-]+)/gi, "Vocational training as $1"],
  [/\bAusbildung\s+als\s+/gi, "Vocational training as "],
  [/\bAusbildung\b/gi, "Vocational training"],
  [/\bPflegefachmann(?:\/-frau|\/frau)?\b/gi, "Nursing specialist"],
  [/\bPflegefachkraft\b/gi, "Nursing professional"],
  [/\bErgotherapeut(?:en)?\b/gi, "Occupational therapist"],
  [/\bErgotherapie\b/gi, "Occupational therapy"],
  [/\bMechatroniker(?:in)?\b/gi, "Mechatronics technician"],
  [/\bElektroniker(?:in)?\b/gi, "Electronics technician"],
  [/\bFachinformatiker(?:in)?\b/gi, "IT specialist"],
  [/\bHotelfachmann(?:\/-frau|\/frau)?\b/gi, "Hotel specialist"],
  [/\b(m\/w\/d|w\/m\/d|m\/f\/d|m\/w|w\/m)\b/gi, "m/f/d"],
];

/**
 * Translate common German Ausbildung titles for the English-facing UI.
 * The original source title remains available through the official listing link.
 */
export function translateAusbildungTitle(title: string): string {
  let translated = title.trim();
  for (const [pattern, replacement] of TITLE_PHRASES) {
    translated = translated.replace(pattern, replacement);
  }
  return translated
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([/)])/g, "$1")
    .trim();
}
