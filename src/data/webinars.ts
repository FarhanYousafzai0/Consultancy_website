export type Webinar = {
  id: string;
  title: string;
  dateLabel: string;
  blurb: string;
  /** Registration URL; omit when TBA */
  registerUrl?: string;
};

/**
 * Curated upcoming sessions — edit this list; no booking backend.
 * Prefer real dates; leave registerUrl empty until a form/WhatsApp link exists.
 */
export const webinars: Webinar[] = [
  {
    id: "winter-intake-basics",
    title: "Winter intake basics for Pakistani Master's applicants",
    dateLabel: "TBA — join the community for the next date",
    blurb:
      "Deadlines, uni-assist vs direct, and what to prepare 3–6 months out. Live Q&A with a Parwaaz consultant.",
  },
  {
    id: "ausbildung-german-b1",
    title: "Ausbildung path: German level and Jobsuche",
    dateLabel: "TBA — join the community for the next date",
    blurb:
      "When Ausbildung makes sense vs university, B1/B2 expectations, and how to read official listings.",
  },
];
