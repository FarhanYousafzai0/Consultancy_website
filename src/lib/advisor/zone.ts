export type AdvisorIntent = "greeting" | "in_zone" | "off_topic";

export const ADVISOR_GREETING_REPLY =
  "Hi — I'm Parwaaz Advisor. Ask about programs, scholarships, APS, visa basics, Ausbildung, or deadlines for studying in Germany.";

export const ADVISOR_OFF_TOPIC_REPLY =
  "I only help with studying in Germany through Parwaaz — programs, scholarships, APS, visa basics, Ausbildung, and our guides.";

/** Study-in-Germany / Parwaaz domain tokens. Mixed messages with any of these stay in zone. */
const IN_ZONE_PATTERN =
  /\b(?:aps|anabin|ausbildung|uni[\s-]?assist|studienkolleg|blocked\s+account|sperrkonto|visa|ielts|toefl|daad|hec|scholarship|scholarships|program|programs|university|universities|master'?s?|bachelor'?s?|deadline|deadlines|intake|intakes|semester|eligibility|eligible|motivation\s+letter|sop|document|documents|checklist|admission|apply|application|applications|germany|german|pakistan|pakistani|fsc|hssc|a[\s-]?levels?|hzb|parwaz|parwaaz|consultant|reach|match|safety|tuition|public\s+vs\s+private|private\s+university|public\s+university|tum|saarland|grade|gpa|cs|computer\s+science|engineering|winter|summer)\b/i;

/** Strong Germany / Parwaaz signals — used so "UK universities" does not leak in via the word university. */
const GERMANY_SIGNAL =
  /\b(?:germany|german|parwaz|parwaaz|aps|anabin|ausbildung|uni[\s-]?assist|studienkolleg|daad|hec|sperrkonto|blocked\s+account|pakistan|pakistani|fsc|hssc|hzb|tum|saarland)\b/i;

const OTHER_COUNTRY =
  /\b(?:uk|u\.?k\.?|united\s+kingdom|britain|british|usa|u\.?s\.?a\.?|united\s+states|america|american|canada|canadian|australia|australian|france|french|italy|spain|netherlands|dubai|uae|china|japan|korea)\b/i;

const GREETING_ONLY =
  /^(?:hi|hello|hey|salam|assalam(?:u)?\s*alaikum|asalam(?:u)?\s*alaikum|hola|yo|sup|thanks|thank\s*you|thx|ok|okay|bye|good\s*(?:morning|afternoon|evening|night)|how\s+are\s+you(?:\s+doing)?|what'?s\s+up)[!?.\s]*$/i;

export function classifyAdvisorIntent(text: string): AdvisorIntent {
  const trimmed = text.trim();
  if (!trimmed) return "off_topic";

  const germanySignal = GERMANY_SIGNAL.test(trimmed);
  const otherCountry = OTHER_COUNTRY.test(trimmed);

  // Other-country ask without Germany/Parwaaz signal → out of zone (even if "university" matched).
  if (otherCountry && !germanySignal) return "off_topic";

  // Mixed messages with any domain token stay in zone (never drop a real question).
  if (IN_ZONE_PATTERN.test(trimmed)) return "in_zone";

  if (GREETING_ONLY.test(trimmed)) return "greeting";

  return "off_topic";
}

export function cannedReplyForIntent(
  intent: Exclude<AdvisorIntent, "in_zone">
): string {
  return intent === "greeting"
    ? ADVISOR_GREETING_REPLY
    : ADVISOR_OFF_TOPIC_REPLY;
}
