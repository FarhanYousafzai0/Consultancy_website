/** Home page FAQ — wording from the content brief (Germany PDF). */

export type Faq = {
  question: string;
  answer: string;
  /** Optional link shown after the answer. */
  link?: { href: string; label: string };
};

export const homeFaqs: Faq[] = [
  {
    question: "Is studying in Germany really free?",
    answer:
      "At most public universities, yes: no tuition fees, only a small semester contribution. A few states and universities do charge non-EU students, so your shortlist marks which ones are truly tuition-free. Living costs are separate.",
  },
  {
    question: "If tuition is free, what money do I need?",
    answer:
      "Mainly living costs. For the visa, you show about €11,904 in a blocked account for your first year (2026 figure). It's your own money, released to you monthly once you arrive. Your evaluation includes a rough budget.",
  },
  {
    question: "Is the profile evaluation really free?",
    answer:
      "Yes. No payment, no card, no call. I do it because students who get an honest evaluation tend to come back when they're ready to apply. The ones who don't still leave knowing where they stand.",
  },
  {
    question: "My CGPA is under 3.0, or I have a study gap. Should I bother?",
    answer:
      "Send it. Cut-offs differ from programme to programme, and subject match often matters more than the number. If your options are limited, I'll tell you which ones are real.",
  },
  {
    question: "I have a 2-year BA or BSc. Can I apply for a Master's?",
    answer:
      "Usually not directly. Most German universities expect a 4-year Bachelor's, or 16 years of education. Send your profile and I'll tell you which route exists for you.",
  },
  {
    question: "I'm in my final semester and don't have IELTS or TOEFL yet.",
    answer:
      "That's a good time to send it. I'll work from your transcript so far and tell you which test your target programmes need and what score.",
    link: { href: "/guides", label: "Read the free IELTS and TOEFL guides" },
  },
  {
    question: "What does the full process cost if I hire you?",
    answer:
      "It's one fixed fee, and you get it in writing before you pay anything. Start with the free evaluation, then ask on WhatsApp if you want me to handle the rest.",
  },
  {
    question: "Do you help with Bachelor's or Ausbildung?",
    answer:
      "No. Master's in Germany only. It's the one thing I do, which is why the evaluation is quick and specific.",
  },
];
