/**
 * Home page "Students who started exactly where you are" cards.
 *
 * IMPORTANT: every entry below is SAMPLE content (`sample: true`) so the design
 * can be reviewed. Each card shows a visible "Sample story" badge while `sample`
 * is true. Replace these with real students (with their permission), then set
 * `sample: false` or remove the field.
 */

export type TestimonialProof =
  /** A scan or photo of the admission letter. Without `image`, a styled letter is drawn. */
  | { kind: "letter"; image?: string }
  /** A WhatsApp screenshot. Without `image`, the `messages` are drawn as a chat. */
  | { kind: "whatsapp"; image?: string; messages: { from: "student" | "parwaaz"; text: string }[] }
  /** A YouTube video ID. Without it, a thumbnail placeholder is drawn. */
  | { kind: "video"; youtubeId?: string; duration?: string };

export type Testimonial = {
  id: string;
  firstName: string;
  bachelors: string;
  cgpa: string;
  programme: string;
  university: string;
  intake: string;
  quote: string;
  proof: TestimonialProof;
  sample?: boolean;
};

export const testimonials: Testimonial[] = [
  {
    id: "sample-letter",
    firstName: "Ayesha",
    bachelors: "BS Computer Science",
    cgpa: "3.1",
    programme: "MSc Data Science",
    university: "TU Dortmund",
    intake: "Winter 2026",
    quote:
      "I was sure a 3.1 wasn't enough for a public university. The evaluation showed me which programmes would actually take my profile.",
    proof: { kind: "letter" },
    sample: true,
  },
  {
    id: "sample-whatsapp",
    firstName: "Bilal",
    bachelors: "BE Electrical Engineering",
    cgpa: "2.9",
    programme: "MSc Electrical Engineering",
    university: "University of Siegen",
    intake: "Summer 2027",
    quote:
      "I had a two-year gap after my degree. Instead of guesses, I got a straight answer and a list I could really apply to.",
    proof: {
      kind: "whatsapp",
      messages: [
        { from: "student", text: "Sir, admission letter aa gaya! 🎉" },
        { from: "parwaaz", text: "Mubarak ho! Now the visa checklist, step by step." },
        { from: "student", text: "Thank you for the honest advice from day one 🙏" },
      ],
    },
    sample: true,
  },
  {
    id: "sample-video",
    firstName: "Mahnoor",
    bachelors: "BBA",
    cgpa: "3.4",
    programme: "MSc International Management",
    university: "Rhine-Waal University",
    intake: "Winter 2026",
    quote:
      "The motivation letter feedback alone was worth it. Every deadline was tracked, so I never had to chase anyone.",
    proof: { kind: "video", duration: "2:14" },
    sample: true,
  },
];
