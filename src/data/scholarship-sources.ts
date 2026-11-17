export type ScholarshipSource = {
  id: string;
  name: string;
  domain: string;
  url: string;
  country: string;
  levels: ("bachelor" | "master" | "phd")[];
  sitemapUrl?: string;
  rssUrl?: string;
  urls?: string[];
  allowedDomains?: string[];
  maxPages?: number;
  /** Accept application links found on the fetched page even outside the domain allowlist. */
  trustPageLinks?: boolean;
};

/** Official sources only. Add sources here after checking their public terms and structure. */
export const scholarshipSources: ScholarshipSource[] = [
  {
    id: "berlin-mathematical-school",
    name: "Berlin Mathematical School Phase I Scholarships",
    domain: "daad.de",
    url: "https://www2.daad.de/deutschland/studienangebote/international-programmes/en/detail/4007/",
    urls: ["https://www.math-berlin.de/students/scholarships"],
    allowedDomains: ["math-berlin.de"],
    country: "DE",
    levels: ["master"],
    maxPages: 4,
  },
  // DAAD database and Erasmus Mundus catalogue entries come from src/lib/scholarships/catalogues.ts.
  { id: "hec", name: "Higher Education Commission Pakistan", domain: "hec.gov.pk", url: "https://www.hec.gov.pk/english/scholarshipsgrants/Pages/default.aspx", country: "PK", levels: ["bachelor", "master", "phd"], maxPages: 5 },
  {
    id: "chevening",
    name: "Chevening Scholarships",
    domain: "chevening.org",
    url: "https://www.chevening.org/scholarships/",
    country: "GB",
    levels: ["master"],
    urls: [
      "https://www.chevening.org/scholarships/",
      "https://www.chevening.org/scholarships/application-timeline/",
    ],
    allowedDomains: ["chevening.org", "asams.chevening.org"],
  },
  {
    id: "fulbright",
    name: "Fulbright Foreign Student Program",
    domain: "foreign.fulbrightonline.org",
    url: "https://foreign.fulbrightonline.org/",
    country: "US",
    levels: ["master", "phd"],
    urls: [
      "https://foreign.fulbrightonline.org/about/foreign-student-program",
      "https://foreign.fulbrightonline.org/apply",
    ],
    allowedDomains: ["foreign.fulbrightonline.org"],
  },
  {
    id: "global-korea-scholarship",
    name: "Global Korea Scholarship (GKS)",
    domain: "studyinkorea.go.kr",
    url: "https://www.studyinkorea.go.kr/en/plan/gksNoticeRead.do?bbsId=BBSMSTR_000000000461&nttId=4527",
    country: "KR",
    levels: ["bachelor", "master", "phd"],
    urls: [
      "https://www.studyinkorea.go.kr/ko/why/diverseGovSpprt.do",
      "https://www.studyinkorea.go.kr/ko/plan/scholarship.do?tab=gks-tab1",
      "https://www.studyinkorea.go.kr/en/plan/gksNoticeRead.do?bbsId=BBSMSTR_000000000461&nttId=4527",
      "https://www.studyinkorea.go.kr/ko/plan/gksNoticeRead.do?amp=&bbsId=BBSMSTR_000000000461&nttId=4522",
    ],
    allowedDomains: ["studyinkorea.go.kr", "was3.studyinkorea.go.kr", "cdn.studyinkorea.go.kr"],
    maxPages: 6,
  },
  {
    id: "mbzuai",
    name: "MBZUAI Scholarships and Admissions",
    domain: "mbzuai.ac.ae",
    url: "https://mbzuai.ac.ae/study-artificial-intelligence",
    country: "AE",
    levels: ["bachelor", "master", "phd"],
    urls: [
      "https://mbzuai.ac.ae/study-artificial-intelligence",
      "https://mbzuai.ac.ae/admissions/undergraduate-admissions",
      "https://mbzuai.ac.ae/admissions/graduate-masters-admissions/",
    ],
    maxPages: 5,
  },
  {
    id: "turkiye-scholarships",
    name: "Türkiye Scholarships",
    domain: "turkiyeburslari.gov.tr",
    url: "https://www.turkiyeburslari.gov.tr/",
    country: "TR",
    levels: ["bachelor", "master", "phd"],
    urls: [
      "https://www.turkiyeburslari.gov.tr/calendar",
      "https://www.turkiyeburslari.gov.tr/fulltimeprograms",
      "https://www.turkiyeburslari.gov.tr/applysteps",
      "https://www.turkiyeburslari.gov.tr/announcements/turkiye-scholarships-2026-applications-121",
    ],
    maxPages: 6,
  },
  {
    id: "chinese-government-scholarship",
    name: "Chinese Government Scholarship",
    domain: "campuschina.org",
    url: "https://www.campuschina.org/",
    country: "CN",
    levels: ["bachelor", "master", "phd"],
    urls: [
      "https://www.campuschina.org/index.html",
      "https://studyinchina.csc.edu.cn/#/login",
      "https://en.moe.gov.cn/cooperation_exchanges/201506/t20150626_191373.html",
    ],
    allowedDomains: ["campuschina.org", "studyinchina.csc.edu.cn", "en.moe.gov.cn"],
    maxPages: 6,
  },
  {
    id: "australia-awards",
    name: "Australia Awards Scholarships",
    domain: "dfat.gov.au",
    url: "https://www.dfat.gov.au/people-to-people/australia-awards/australia-awards-scholarships",
    country: "AU",
    levels: ["bachelor", "master", "phd"],
    urls: [
      "https://www.dfat.gov.au/people-to-people/australia-awards/australia-awards-scholarships",
      "https://www.dfat.gov.au/people-to-people/australia-awards/australia-awards-scholarships-opening-and-closing-dates",
      "https://www.dfat.gov.au/people-to-people/australia-awards/how-to-apply-for-an-australia-awards-scholarship",
      "https://oasis.dfat.gov.au/",
    ],
    allowedDomains: ["dfat.gov.au", "oasis.dfat.gov.au"],
    maxPages: 6,
  },
  {
    id: "mext",
    name: "Japanese Government MEXT Scholarship",
    domain: "mext.go.jp",
    url: "https://www.mext.go.jp/a_menu/koutou/ryugaku/06032818.htm",
    country: "JP",
    levels: ["bachelor", "master", "phd"],
    urls: [
      "https://www.mext.go.jp/a_menu/koutou/ryugaku/06032818.htm",
      "https://www.mext.go.jp/a_menu/koutou/ryugaku/boshu/1415354_00010.htm",
    ],
    maxPages: 5,
  },
  {
    id: "nus-international-scholarship",
    name: "NUS International Undergraduate Scholarship",
    domain: "nus.edu.sg",
    url: "https://www.nus.edu.sg/oam/scholarships/scholarships-for-freshmen-international-students/nus-international-undergraduate-scholarship",
    country: "SG",
    levels: ["bachelor"],
    urls: [
      "https://www.nus.edu.sg/oam/scholarships/scholarships-for-freshmen-international-students/nus-international-undergraduate-scholarship",
      "https://nus.edu.sg/oam/scholarships/important-dates-and-application",
      "https://nus.edu.sg/oam/undergraduate-programmes/academic-programmes",
    ],
    allowedDomains: ["nus.edu.sg", "admissions.nus.edu.sg"],
    maxPages: 5,
  },
  {
    id: "oxford-clarendon",
    name: "Oxford Clarendon Fund",
    domain: "ox.ac.uk",
    url: "https://www.ox.ac.uk/admissions/graduate/fees-and-funding/funding/clarendon",
    country: "GB",
    levels: ["master", "phd"],
    urls: [
      "https://www.ox.ac.uk/admissions/graduate/fees-and-funding/funding/clarendon",
      "https://www.ox.ac.uk/admissions/graduate/fees-and-funding/funding/clarendon/applicants",
      "https://www.ox.ac.uk/admissions/graduate/courses",
    ],
    maxPages: 6,
  },
  {
    id: "manaaki-new-zealand",
    name: "Manaaki New Zealand Scholarships",
    domain: "nzscholarships.govt.nz",
    url: "https://www.nzscholarships.govt.nz/",
    country: "NZ",
    levels: ["bachelor", "master", "phd"],
    urls: [
      "https://www.nzscholarships.govt.nz/",
      "https://www.nzscholarships.govt.nz/how-to-apply-for-a-scholarship/",
      "https://www.nzscholarships.govt.nz/check-eligibility-criteria/",
    ],
    maxPages: 5,
  },
  {
    id: "government-of-ireland-ies",
    name: "Government of Ireland International Education Scholarship",
    domain: "hea.ie",
    url: "https://hea.ie/policy/internationalisation/goi-ies/",
    country: "IE",
    levels: ["master", "phd"],
    urls: [
      "https://hea.ie/policy/internationalisation/goi-ies/",
      "https://hea.ie/assets/uploads/2025/12/2026-GOI-IES-Call-Document.pdf",
    ],
    maxPages: 5,
  },
  {
    id: "kaist-international-undergraduate",
    name: "KAIST International Undergraduate Admission and Scholarship",
    domain: "admission.kaist.ac.kr",
    url: "https://admission.kaist.ac.kr/intl-undergraduate/application/ApplicationGuide/ApplicationTimeline",
    country: "KR",
    levels: ["bachelor"],
    urls: [
      "https://admission.kaist.ac.kr/intl-undergraduate/application/ApplicationGuide/ApplicationTimeline",
      "https://admission.kaist.ac.kr/intl-undergraduate/support/scholarships/kaist",
      "https://admission.kaist.ac.kr/intl-undergraduate/application/apply",
    ],
    allowedDomains: ["admission.kaist.ac.kr", "univapply.kaist.ac.kr"],
    maxPages: 5,
  },
  {
    id: "melbourne-graduate-research-scholarships",
    name: "University of Melbourne Graduate Research Scholarships",
    domain: "mdhs.unimelb.edu.au",
    url: "https://mdhs.unimelb.edu.au/research/research-training/future-students/when-should-i-apply",
    country: "AU",
    levels: ["master", "phd"],
    urls: [
      "https://mdhs.unimelb.edu.au/research/research-training/future-students/when-should-i-apply",
      "https://scholarships.unimelb.edu.au/awards/graduate-research-scholarships",
      "https://study.unimelb.edu.au/how-to-apply/graduate-research",
      "https://study.unimelb.edu.au/how-to-apply/graduate-research/international-applications/applications",
    ],
    allowedDomains: ["mdhs.unimelb.edu.au", "scholarships.unimelb.edu.au", "study.unimelb.edu.au", "gradresearch.unimelb.edu.au"],
    maxPages: 5,
  },
  {
    id: "ucas-cas-anso-2027",
    name: "CAS-ANSO Scholarship 2027 at UCAS",
    domain: "english.ucas.ac.cn",
    url: "https://english.ucas.ac.cn/index.php/admission/international-students/financial-aid/6825-cas-anso-scholarship-2027-call-for-applications-to-study-at-ucas",
    country: "CN",
    levels: ["master", "phd"],
    urls: [
      "https://english.ucas.ac.cn/index.php/admission/international-students/financial-aid/6825-cas-anso-scholarship-2027-call-for-applications-to-study-at-ucas",
      "https://english.ucas.ac.cn/index.php/admission/international-students/financial-aid/6827-ucas-scholarship-for-international-students-2027-call-for-applications",
      "https://english.ucas.ac.cn/index.php/admission/international-students/notice/6821-call-for-2027-master-s-doctoral-degree-programs-for-international-students",
      "https://english.ucas.ac.cn/index.php/admission/international-students/deadline",
    ],
    allowedDomains: ["english.ucas.ac.cn", "is.ucas.ac.cn", "studyinchina.csc.edu.cn"],
    maxPages: 5,
  },
  {
    id: "daad-epos-development-economics-goettingen",
    name: "DAAD EPOS MSc Development Economics — University of Göttingen",
    domain: "uni-goettingen.de",
    url: "https://www.uni-goettingen.de/en/572462.html",
    country: "DE",
    levels: ["master"],
    urls: [
      "https://www.uni-goettingen.de/en/572462.html",
      "https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database?detail=50076777",
    ],
    allowedDomains: ["uni-goettingen.de", "ecampus.uni-goettingen.de", "www2.daad.de"],
    maxPages: 5,
  },
];
