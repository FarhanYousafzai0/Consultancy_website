import type { GuideInput } from "@/lib/db/types";

const verified = "2026-10-06";

export const seedGuides: GuideInput[] = [
  {
    title: "APS certificate for Pakistani students",
    slug: "aps-pakistan",
    topic: "aps",
    body: `APS (Akademische Prüfstelle) is the Academic Evaluation Centre that verifies Pakistani degrees and school certificates before many German university applications.

Who usually needs APS:
- Pakistani students applying for Bachelor's or Master's at German public universities through uni-assist or direct application, when the university requires APS.
- Always check the specific university and program page — requirements change.

What APS typically checks:
- Authenticity of your documents
- Whether your qualification meets German admission standards for your chosen path

Practical tips for Pakistani applicants:
- Start early: APS appointments and document checks can take weeks or months.
- Keep original transcripts, degree certificates, and translations ready.
- APS does not guarantee admission — universities still decide.

If a guide or program on this site lists APS as required, confirm on the official university source linked on the program page.`,
    sourceUrl: "https://aps-india.de/",
    lastVerifiedAt: verified,
    status: "published",
  },
  {
    title: "Blocked account (Sperrkonto) basics",
    slug: "blocked-account",
    topic: "blocked_account",
    body: `A blocked account (Sperrkonto) is a special German bank account used to prove you can cover living costs for a student visa.

Typical points students ask:
- You deposit a required amount (set by German authorities; amounts change — always confirm current figures on official embassy / BAMF guidance).
- Money is released monthly after you arrive.
- Providers include banks and specialised blocked-account services.

This site does not open accounts for you. We can explain the concept and point you to official requirements. Confirm the current amount and accepted providers with the German mission that will process your visa.`,
    sourceUrl: "https://www.auswaertiges-amt.de/en",
    lastVerifiedAt: verified,
    status: "published",
  },
  {
    title: "Student visa overview for Germany",
    slug: "student-visa-overview",
    topic: "visa",
    body: `Pakistani students usually need a national visa for study before entering Germany for a degree programme.

Common documents (always verify with the German embassy / consulate serving Pakistan):
- Admission letter from a German university
- Proof of funds (often blocked account)
- Health insurance
- Passport, photos, application forms
- Academic documents

We do not prepare visa files or guarantee outcomes. Use this guide for orientation, then follow the official checklist from the mission where you apply.`,
    sourceUrl: "https://pakistan.diplo.de/",
    lastVerifiedAt: verified,
    status: "published",
  },
  {
    title: "uni-assist applications",
    slug: "uni-assist",
    topic: "uni_assist",
    body: `uni-assist processes applications for many German universities for international students.

Key ideas:
- Check whether your target program uses uni-assist, VPD, or direct application — see each program page on this site.
- Deadlines are strict. Late applications are usually rejected.
- Fees apply per application / semester — confirm on uni-assist.de.

Parwaz lists the application route on each program card when we have verified it. Always click through to the university and uni-assist pages before paying.`,
    sourceUrl: "https://www.uni-assist.de/en/",
    lastVerifiedAt: verified,
    status: "published",
  },
  {
    title: "anabin and degree recognition",
    slug: "anabin-recognition",
    topic: "anabin",
    body: `anabin is the German database used to check how foreign school and university qualifications are assessed.

For Pakistani students:
- Look up your university and degree type in anabin.
- H+ status for institutions is often discussed in counselling — interpretation still depends on the university and APS.
- anabin does not replace APS or university decisions.

Use anabin as a research tool, then confirm with APS and your target university.`,
    sourceUrl: "https://anabin.kmk.org/",
    lastVerifiedAt: verified,
    status: "published",
  },
  {
    title: "Studienkolleg after FSc / HSSC",
    slug: "studienkolleg",
    topic: "studienkolleg",
    body: `Many Pakistani FSc / HSSC holders cannot enter a Bachelor's programme directly at public German universities. A common path is Studienkolleg (a one-year foundation / preparatory college) plus the Feststellungsprüfung.

Honest points:
- Not every student needs Studienkolleg — some routes include private universities, foundation years, or first completing university years in Pakistan.
- Entrance exams (Aufnahmeprüfung) and German language levels often apply.
- Places are competitive.

Our eligibility check explains which route fits your answers. Always verify the specific Studienkolleg and university requirements.`,
    sourceUrl: "https://www.studienkollegs.de/",
    lastVerifiedAt: verified,
    status: "published",
  },
  {
    title: "Do I need IELTS for Germany?",
    slug: "faq-ielts",
    topic: "faq",
    body: `It depends on the program language.

- English-taught programs often publish an IELTS or TOEFL minimum — check each program page.
- German-taught programs usually need a German certificate (TestDaF, DSH, Goethe, etc.) instead of IELTS.
- Some universities accept medium-of-instruction letters; many do not for competitive programs.

Never assume one score works everywhere. Use our program filters and confirm on the official source URL.`,
    sourceUrl: "https://www.daad.de/en/",
    lastVerifiedAt: verified,
    status: "published",
  },
  {
    title: "Public vs private universities — costs",
    slug: "faq-public-private",
    topic: "faq",
    body: `Public universities in Germany often charge little or no tuition for consecutive degree programs, but semester fees still apply. Private universities usually charge higher tuition.

On Parwaz:
- We show both, labeled with costs we have verified.
- Ranking is by fit and cost — never by commission.
- Total cost of study also includes living expenses and visa proof-of-funds.

Confirm current fees on the university website before applying.`,
    sourceUrl: "https://www.daad.de/en/",
    lastVerifiedAt: verified,
    status: "published",
  },
  {
    title: "Can I work while studying?",
    slug: "faq-student-work",
    topic: "faq",
    body: `International students in Germany usually have limited work rights (often expressed as days per year). Rules change and depend on your residence permit.

We do not give personalised immigration advice. Check official BAMF / Ausländerbehörde guidance and your visa sticker conditions.`,
    sourceUrl: "https://www.bamf.de/EN/",
    lastVerifiedAt: verified,
    status: "published",
  },
  {
    title: "Winter vs summer intake",
    slug: "faq-intakes",
    topic: "faq",
    body: `Most Master's programs admit for the winter semester (starting around October). Some also offer a summer semester (around April).

Deadlines for non-EU applicants are often months earlier than the semester start. Check the deadline on each program page and on the university site.`,
    sourceUrl: "https://www.daad.de/en/",
    lastVerifiedAt: verified,
    status: "published",
  },
  {
    title: "What is a motivation letter / SOP?",
    slug: "faq-motivation-letter",
    topic: "faq",
    body: `A motivation letter (Statement of Purpose) explains why you want this program, why this university, and how your background fits.

German universities often expect:
- Clear academic goals
- Honest fit with the curriculum
- Concrete examples from your studies or projects
- No exaggerated claims

Parwaz can review your draft for structure and Germany-specific fit after you request a paid review. We do not write a letter for you to submit as your own work.`,
    sourceUrl: "https://www.daad.de/en/",
    lastVerifiedAt: verified,
    status: "published",
  },
  {
    title: "Will you guarantee my admission?",
    slug: "faq-no-guarantee",
    topic: "faq",
    body: `No. Parwaz advises. Universities, scholarship bodies, and visa offices decide.

Our Reach / Match / Safety labels and scholarship odds are honest estimates from the data we have verified — not acceptance percentages.`,
    sourceUrl: "https://www.parwaazconsultancy.com/disclaimer",
    lastVerifiedAt: verified,
    status: "published",
  },
  {
    title: "How long does the Germany study process take?",
    slug: "faq-timeline",
    topic: "faq",
    body: `A realistic Pakistan → Germany timeline often spans 9–18 months: language tests, APS, applications, admission, blocked account, visa appointment, travel.

Rushing late in the cycle raises the risk of missing deadlines. Start with our eligibility check, then shortlist programs with reachable deadlines.`,
    sourceUrl: "https://www.daad.de/en/",
    lastVerifiedAt: verified,
    status: "published",
  },
  {
    title: "DAAD scholarships — quick facts",
    slug: "faq-daad",
    topic: "faq",
    body: `DAAD offers several scholarships for international students. Competition is high. Bachelor's funding from DAAD-style schemes is rare compared with Master's and PhD.

Use our Scholarships section for odds based on your profile, then confirm on the official DAAD portal.`,
    sourceUrl: "https://www.daad.de/en/studying-in-germany/scholarships/",
    lastVerifiedAt: verified,
    status: "published",
  },
  {
    title: "What documents do Master's applicants usually need?",
    slug: "faq-master-documents",
    topic: "faq",
    body: `Typical set (varies by university):
- Degree certificate and transcripts
- CV
- Motivation letter
- English / German language proof
- Passport copy
- Sometimes APS, recommendation letters, or GRE

Open the program detail page for the checklist we recorded, then confirm on the official source.`,
    sourceUrl: "https://www.uni-assist.de/en/",
    lastVerifiedAt: verified,
    status: "published",
  },
  {
    title: "Ausbildung vs university",
    slug: "faq-ausbildung",
    topic: "faq",
    body: `Ausbildung is dual vocational training (work + school), not a Bachelor's or Master's degree. It usually requires stronger German and follows different visa / recognition rules.

On Parwaz, Ausbildung guidance is self-serve for now — eligibility check and guides. We do not open a consultant WhatsApp handoff specifically for Ausbildung placement.`,
    sourceUrl: "https://www.make-it-in-germany.com/",
    lastVerifiedAt: verified,
    status: "published",
  },
  {
    title: "CGPA to German grade",
    slug: "faq-grade-conversion",
    topic: "faq",
    body: `We use a modified Bavarian formula for orientation:
German grade = 1 + 3 × (Nmax − Nd) / (Nmax − Nmin)

Universities may apply their own conversion. Our matching uses this as a soft signal, not a guarantee of how a selection committee will read your transcript.`,
    sourceUrl: "https://www.daad.de/en/",
    lastVerifiedAt: verified,
    status: "published",
  },
  {
    title: "What if I don't qualify yet?",
    slug: "faq-not-yet",
    topic: "faq",
    body: `Our eligibility result may say you are not ready for direct entry. Common next steps: improve language scores, complete missing years of study, consider Studienkolleg, or explore private / foundation pathways with clear costs.

Ask the AI advisor or a consultant for help interpreting your result — we still will not invent admissions.`,
    sourceUrl: "https://www.parwaazconsultancy.com/check",
    lastVerifiedAt: verified,
    status: "published",
  },
  {
    title: "How we verify program data",
    slug: "faq-how-we-verify",
    topic: "faq",
    body: `Program and scholarship facts on Parwaz are checked against official source URLs. Each card can show a last-verified date.

If something looks wrong, use Report an error (when available) or contact us. Always re-check the university page before you apply or pay fees.`,
    sourceUrl: "https://www.parwaazconsultancy.com/how-we-verify",
    lastVerifiedAt: verified,
    status: "published",
  },
  {
    title: "Saving results and signing up",
    slug: "faq-signup",
    topic: "faq",
    body: `You can run the eligibility check without an account. Sign up (email one-time code or Google) to save your profile, shortlist, scholarships, and deadline alerts.

We do not sell your data. See our privacy policy for details.`,
    sourceUrl: "https://www.parwaazconsultancy.com/privacy",
    lastVerifiedAt: verified,
    status: "published",
  },
  {
    title: "Talking to a consultant on WhatsApp",
    slug: "faq-consultant",
    topic: "faq",
    body: `WhatsApp chat for basic questions is free. Paid consultations and document packages are separate.

When you tap Ask a consultant, we prefill a short summary of your goal and shortlist so the consultant has context. Ausbildung seekers use self-serve tools instead of a placement handoff.`,
    sourceUrl: "https://www.parwaazconsultancy.com/contact",
    lastVerifiedAt: verified,
    status: "published",
  },
  {
    title: "Health insurance for students",
    slug: "faq-insurance",
    topic: "faq",
    body: `Students usually need German health insurance for enrolment and visa. Public and private options exist with age and status rules.

Confirm requirements with your university enrolment office and the visa mission. We may later list partner offers — any affiliation will be disclosed.`,
    sourceUrl: "https://www.daad.de/en/",
    lastVerifiedAt: verified,
    status: "published",
  },
  {
    title: "Housing in Germany for new students",
    slug: "faq-housing",
    topic: "faq",
    body: `Student dorms (Studentenwerk) and private flats are both common. Start looking early, especially in large cities.

We do not arrange housing in this phase. Use official Studentenwerk sites and verified listings.`,
    sourceUrl: "https://www.studentenwerke.de/en/",
    lastVerifiedAt: verified,
    status: "published",
  },
  {
    title: "English-taught Master's for CS / IT",
    slug: "faq-cs-masters",
    topic: "faq",
    body: `Germany has many English-taught Master's in Computer Science, Data, and related fields. Competition and GPA expectations vary widely.

Use Parwaz program search with field filters and the “only what I qualify for” toggle, then open each official source URL.`,
    sourceUrl: "https://www.daad.de/en/",
    lastVerifiedAt: verified,
    status: "published",
  },
  {
    title: "What is VPD?",
    slug: "faq-vpd",
    topic: "faq",
    body: `VPD (Vorprüfungsdokumentation) is a preliminary review document some universities require via uni-assist before you apply directly to the university.

Check the application route on each program page. If we mark VPD, confirm the current process on uni-assist and the university site.`,
    sourceUrl: "https://www.uni-assist.de/en/",
    lastVerifiedAt: verified,
    status: "published",
  },
];
