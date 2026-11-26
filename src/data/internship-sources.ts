export type InternshipSource = {
  id: string;
  name: string;
  domain: string;
  url: string;
  organizationType: "government" | "international_organization" | "university" | "research_institute" | "company" | "exchange_program" | "other";
  country: string;
  urls?: string[];
  allowedDomains?: string[];
  applicationDomains?: string[];
  maxPages?: number;
  verificationBasis: string;
};

/** Curated official sources only. These URLs are discovery pages, not claims of current vacancies. */
export const internshipSources: InternshipSource[] = [
  {
    id: "cern-internships",
    name: "CERN internships and student programmes",
    domain: "careers.cern",
    url: "https://careers.cern/jobs/",
    organizationType: "international_organization",
    country: "CH",
    applicationDomains: ["jobs.smartrecruiters.com"],
    urls: ["https://careers.cern/jobs/?tid=96&tid_1=All&title=Internships"],
    maxPages: 6,
    verificationBasis: "Official CERN careers listings expose internship vacancies and student programmes.",
  },
  {
    id: "esa-student-internships",
    name: "ESA Student Internships",
    domain: "www.esa.int",
    url: "https://www.esa.int/About_Us/Careers_at_ESA/Student_Internships2",
    organizationType: "international_organization",
    country: "NL",
    urls: [
      "https://www.esa.int/About_Us/Careers_at_ESA/Student_Internships2",
      "https://jobs.esa.int/",
    ],
    allowedDomains: ["esa.int", "jobs.esa.int"],
    maxPages: 5,
    verificationBasis: "Official ESA student-internships page describes placements, eligibility, duration, allowance, and application flow.",
  },
  {
    id: "oecd-internships",
    name: "OECD Internship Programme",
    domain: "www.oecd.org",
    url: "https://www.oecd.org/en/about/careers/internships.html",
    organizationType: "international_organization",
    country: "FR",
    urls: [
      "https://www.oecd.org/en/about/careers/internships.html",
      "https://www.oecd.org/en/about/careers/apply.html",
    ],
    allowedDomains: ["oecd.org", "careers.oecd.org"],
    maxPages: 5,
    verificationBasis: "Official OECD internship page and careers application page describe the internship programme and application process.",
  },
  {
    id: "world-bank-internships",
    name: "World Bank Group Pioneers Internship Programme",
    domain: "www.worldbank.org",
    url: "https://www.worldbank.org/ext/en/careers/talent-programs/wbg-pioneers",
    organizationType: "international_organization",
    country: "US",
    urls: [
      "https://www.worldbank.org/ext/en/careers/talent-programs/wbg-pioneers",
      "https://www.worldbank.org/ext/en/careers/faqs",
    ],
    allowedDomains: ["worldbank.org", "worldbankgroup.csod.com"],
    maxPages: 5,
    verificationBasis: "Official World Bank Group Pioneers page describes the internship programme for undergraduate and postgraduate students.",
  },
  {
    id: "us-state-department-internships",
    name: "U.S. Department of State Student Internship Program",
    domain: "careers.state.gov",
    url: "https://careers.state.gov/interns-fellows/student-internship-program/",
    organizationType: "government",
    country: "US",
    urls: [
      "https://careers.state.gov/interns-fellows/student-internship-program/",
      "https://careers.state.gov/interns-fellows/pathways-programs/student-programs-overview-text-version/",
    ],
    allowedDomains: ["careers.state.gov", "usajobs.gov"],
    maxPages: 5,
    verificationBasis: "Official State Department careers page describes paid student internships, including embassy and overseas assignments, eligibility, and USAJOBS application steps.",
  },
  {
    id: "mit-urop",
    name: "MIT Undergraduate Research Opportunities Program",
    domain: "urop.mit.edu",
    url: "https://urop.mit.edu/",
    organizationType: "university",
    country: "US",
    urls: ["https://urop.mit.edu/", "https://urop.mit.edu/guidelines/"],
    maxPages: 5,
    verificationBasis: "Official MIT UROP page describes undergraduate research placements, project discovery, application, funding, credit, and volunteer options.",
  },
  {
    id: "microsoft-university-internships",
    name: "Microsoft Global University Internships",
    domain: "careers.microsoft.com",
    url: "https://careers.microsoft.com/v2/global/en/universityinternship",
    organizationType: "company",
    country: "US",
    urls: [
      "https://careers.microsoft.com/v2/global/en/universityinternship",
      "https://careers.microsoft.com/v2/global/en/internship_eligibility",
    ],
    maxPages: 5,
    verificationBasis: "Official Microsoft Careers university-internship page describes Discovery, Explore, PhD, MBA, and JD internship pathways and benefits.",
  },
  {
    id: "iaeste-exchange-internships",
    name: "IAESTE Exchange Internships",
    domain: "iaeste.org",
    url: "https://iaeste.org/students",
    organizationType: "exchange_program",
    country: "BE",
    urls: ["https://iaeste.org/internships", "https://iaeste.org/students"],
    allowedDomains: ["iaeste.org", "iaeste.net"],
    maxPages: 5,
    verificationBasis: "Official IAESTE student page describes the global exchange platform, available internships, registration, committee contact, and employer selection process.",
  },
];

export function getInternshipSource(id: string) {
  return internshipSources.find((source) => source.id === id);
}
