export type NormalizedDegreeLevel = "bachelor" | "master" | "phd";

export type NormalizedFundingType =
  | "fully_funded"
  | "partially_funded"
  | "tuition_only"
  | "stipend"
  | "unknown";

const COUNTRY_ALIASES: Record<string, string> = {
  af: "AF",
  afghanistan: "AF",
  afg: "AF",
  ae: "AE",
  uae: "AE",
  "abu dhabi": "AE",
  "united arab emirates": "AE",
  emirates: "AE",
  al: "AL",
  albania: "AL",
  am: "AM",
  armenia: "AM",
  ar: "AR",
  argentina: "AR",
  at: "AT",
  austria: "AT",
  au: "AU",
  australia: "AU",
  az: "AZ",
  azerbaijan: "AZ",
  bd: "BD",
  bangladesh: "BD",
  bangladeshi: "BD",
  be: "BE",
  belgium: "BE",
  bg: "BG",
  bulgaria: "BG",
  br: "BR",
  brazil: "BR",
  ca: "CA",
  canada: "CA",
  canadian: "CA",
  ch: "CH",
  switzerland: "CH",
  cn: "CN",
  china: "CN",
  chinese: "CN",
  cz: "CZ",
  czechia: "CZ",
  "czech republic": "CZ",
  de: "DE",
  germany: "DE",
  german: "DE",
  dk: "DK",
  denmark: "DK",
  eg: "EG",
  egypt: "EG",
  egyptian: "EG",
  es: "ES",
  spain: "ES",
  spanish: "ES",
  fi: "FI",
  finland: "FI",
  fr: "FR",
  france: "FR",
  french: "FR",
  gb: "GB",
  uk: "GB",
  britain: "GB",
  "great britain": "GB",
  "united kingdom": "GB",
  british: "GB",
  gr: "GR",
  greece: "GR",
  hu: "HU",
  hungary: "HU",
  id: "ID",
  indonesia: "ID",
  in: "IN",
  india: "IN",
  indian: "IN",
  ie: "IE",
  ireland: "IE",
  ir: "IR",
  iran: "IR",
  iranian: "IR",
  it: "IT",
  italy: "IT",
  italian: "IT",
  jp: "JP",
  japan: "JP",
  japanese: "JP",
  ke: "KE",
  kenya: "KE",
  kr: "KR",
  "south korea": "KR",
  korea: "KR",
  korean: "KR",
  kz: "KZ",
  kazakhstan: "KZ",
  my: "MY",
  malaysia: "MY",
  mx: "MX",
  mexico: "MX",
  mn: "MN",
  mongolia: "MN",
  ng: "NG",
  nigeria: "NG",
  nigerian: "NG",
  nl: "NL",
  netherlands: "NL",
  np: "NP",
  nepal: "NP",
  nepali: "NP",
  no: "NO",
  norway: "NO",
  nz: "NZ",
  "new zealand": "NZ",
  pk: "PK",
  pakistan: "PK",
  pakistani: "PK",
  pl: "PL",
  poland: "PL",
  pt: "PT",
  portugal: "PT",
  ro: "RO",
  romania: "RO",
  ru: "RU",
  russia: "RU",
  russian: "RU",
  sa: "SA",
  "saudi arabia": "SA",
  "saudi arabian": "SA",
  se: "SE",
  sweden: "SE",
  sg: "SG",
  singapore: "SG",
  tr: "TR",
  turkey: "TR",
  turkiye: "TR",
  türkiye: "TR",
  turkish: "TR",
  ua: "UA",
  ukraine: "UA",
  us: "US",
  usa: "US",
  america: "US",
  "united states": "US",
  "united states of america": "US",
  american: "US",
  uz: "UZ",
  uzbekistan: "UZ",
  za: "ZA",
  "south africa": "ZA",
};

let displayNameCountryCodes: Map<string, string> | undefined;

function normalizedKey(value: string) {
  return value
    .trim()
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ");
}

function normalizeCountryLike(value: string | null | undefined) {
  if (!value || !value.trim()) return null;

  const key = normalizedKey(value);
  if (/^[a-z]{2}$/i.test(key)) return key.toUpperCase();
  if (COUNTRY_ALIASES[key]) return COUNTRY_ALIASES[key];

  try {
    if (!displayNameCountryCodes) {
      const names = new Intl.DisplayNames(["en"], { type: "region" });
      displayNameCountryCodes = new Map();
      for (let first = 65; first <= 90; first += 1) {
        for (let second = 65; second <= 90; second += 1) {
          const code = String.fromCharCode(first, second);
          const name = names.of(code);
          if (name) displayNameCountryCodes.set(normalizedKey(name), code);
        }
      }
    }
    return displayNameCountryCodes.get(key) ?? null;
  } catch {
    // Older runtimes may not expose region display names; aliases remain sufficient.
  }
  return null;
}

export function normalizeCountry(value: string | null | undefined) {
  return normalizeCountryLike(value);
}

export function normalizeNationality(value: string | null | undefined) {
  if (["any", "all", "international"].includes(normalizedKey(value ?? ""))) return "any";
  return normalizeCountryLike(value);
}

export function normalizeFundingType(value: string | null | undefined): NormalizedFundingType {
  const key = normalizedKey(value ?? "").replace(/\s+/g, "_");

  if (
    ["fully_funded", "full_funding", "fullyfunded", "full_scholarship"].includes(key) ||
    /full.*fund|fund.*full/.test(key)
  ) {
    return "fully_funded";
  }
  if (
    ["partially_funded", "partial_funding", "partial", "part_funding"].includes(key) ||
    /partial|part.*fund/.test(key)
  ) {
    return "partially_funded";
  }
  if (/tuition|fee.?waiver|fee.?only/.test(key)) return "tuition_only";
  if (/stipend|living.?allowance|monthly.?allowance/.test(key)) return "stipend";
  return "unknown";
}

export function normalizeDegreeLevels(value: string | readonly string[] | null | undefined) {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  const result = new Set<NormalizedDegreeLevel>();

  for (const item of values) {
    const key = normalizedKey(item);
    if (/\b(phd|ph\.d|doctorate|doctoral)\b/.test(key)) result.add("phd");
    if (/\b(master|masters|m\.a\.?|m\.sc\.?|msc|graduate)\b/.test(key)) result.add("master");
    if (/\b(bachelor|bachelors|undergraduate|b\.a\.?|b\.sc\.?|bsc)\b/.test(key)) result.add("bachelor");
  }

  return (["bachelor", "master", "phd"] as const).filter((level) => result.has(level));
}

const TRACKING_PARAMETERS = /^(utm_[\w-]+|fbclid|gclid|dclid|msclkid|mc_cid|mc_eid|ref|source|campaign)$/i;

export function normalizeOfficialUrl(value: string | null | undefined, allowedDomains?: readonly string[]) {
  if (!value?.trim()) return null;

  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    try {
      url = new URL(`https://${value.trim()}`);
    } catch {
      return null;
    }
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
  if (
    allowedDomains?.length &&
    !allowedDomains.some((domain) => {
      const normalizedDomain = domain.toLowerCase().replace(/^www\./, "");
      return hostname === normalizedDomain || hostname.endsWith(`.${normalizedDomain}`);
    })
  ) {
    return null;
  }

  url.protocol = "https:";
  url.hostname = hostname;
  url.port = "";
  url.hash = "";
  url.pathname = url.pathname.replace(/\/{2,}/g, "/").replace(/\/$/, "") || "/";

  for (const key of [...url.searchParams.keys()]) {
    if (TRACKING_PARAMETERS.test(key)) url.searchParams.delete(key);
  }

  const sortedParams = [...url.searchParams.entries()].sort(([a], [b]) => a.localeCompare(b));
  url.search = "";
  for (const [key, paramValue] of sortedParams) url.searchParams.append(key, paramValue);

  return url.toString();
}
