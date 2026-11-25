/** Home page stories. Keep empty until each story is approved for publication. */

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

export const testimonials: Testimonial[] = [];
