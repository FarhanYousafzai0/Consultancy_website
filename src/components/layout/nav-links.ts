import type { Icon } from "@phosphor-icons/react";
import {
  Bank,
  BookOpenText,
  Briefcase,
  ChartLineUp,
  ChatsCircle,
  Code,
  CurrencyEur,
  Exam,
  FileText,
  Gear,
  GraduationCap,
  Handshake,
  IdentificationCard,
  ListMagnifyingGlass,
  Medal,
  PenNib,
  Percent,
  SealCheck,
  Sparkle,
  Star,
  Target,
  UsersThree,
  VideoCamera,
  Wrench,
} from "@phosphor-icons/react";

export type NavLink = {
  href: string;
  label: string;
  description?: string;
  icon: Icon;
};

export type NavGroup = {
  label: string;
  /** Highlighted card on the left of the panel. */
  feature?: { href: string; title: string; text: string; cta: string };
  /** Shown as a numbered, connected journey instead of a grid. */
  journey?: boolean;
  links: NavLink[];
  footer?: { href: string; label: string };
};

/** Master's-first order: what students look for first comes first. */
export const navGroups: NavGroup[] = [
  {
    label: "Programmes",
    feature: {
      href: "/check",
      title: "Which master's can you get into?",
      text: "Answer 5 questions and see programmes matched to your CGPA and IELTS.",
      cta: "Check eligibility",
    },
    links: [
      { href: "/programs", label: "All master's programmes", description: "Verified, with sources and deadlines", icon: ListMagnifyingGlass },
      { href: "/study/computer-science", label: "Computer Science", description: "CS, IT and software", icon: Code },
      { href: "/study/data", label: "Data Science & AI", description: "Data, ML and analytics", icon: ChartLineUp },
      { href: "/study/engineering", label: "Engineering", description: "Electrical, mechanical, civil…", icon: Gear },
      { href: "/study/business", label: "Business & MBA", description: "Management and marketing", icon: Briefcase },
      { href: "/study/economics", label: "Economics & Finance", description: "Economics, finance, policy", icon: Bank },
    ],
  },
  {
    label: "Scholarships",
    feature: {
      href: "/scholarships",
      title: "Funding you can actually win",
      text: "DAAD and university awards with honest odds for your profile.",
      cta: "Browse scholarships",
    },
    links: [
      { href: "/scholarships", label: "All scholarships", description: "Matched to Pakistani master's applicants", icon: Medal },
      { href: "/guides/faq-daad", label: "DAAD quick facts", description: "Who wins and what it covers", icon: Star },
      { href: "/tools/cost-calculator", label: "Cost calculator", description: "Tuition, rent and blocked account", icon: CurrencyEur },
      { href: "/guides/faq-public-private", label: "Public vs private", description: "What you'll really pay", icon: Bank },
    ],
  },
  {
    label: "Plan & apply",
    journey: true,
    links: [
      { href: "/check", label: "Check eligibility", description: "16 years, CGPA, English", icon: Target },
      { href: "/tools/grade-converter", label: "Convert your CGPA", description: "To the German 1.0–4.0 scale", icon: Percent },
      { href: "/guides/uni-assist", label: "Apply via uni-assist", description: "Or directly to the university", icon: FileText },
      { href: "/guides/faq-motivation-letter", label: "Motivation letter", description: "What German admissions want", icon: PenNib },
      { href: "/guides/blocked-account", label: "Blocked account", description: "Proof of funds for the visa", icon: CurrencyEur },
      { href: "/guides/student-visa-overview", label: "Student visa", description: "Appointment to arrival", icon: IdentificationCard },
    ],
    footer: { href: "/guides", label: "All guides" },
  },
  {
    label: "Services",
    feature: {
      href: "/consultation",
      title: "Talk to a consultant",
      text: "Share your profile once. We reply within 1 business day.",
      cta: "Request consultation",
    },
    links: [
      { href: "/services", label: "Services & packages", description: "Free profile evaluation to applications", icon: Handshake },
      { href: "/how-we-verify", label: "How we verify", description: "Sources and check dates", icon: SealCheck },
      { href: "/stories", label: "Student stories", description: "Pakistan to Germany", icon: Sparkle },
      { href: "/contact", label: "Contact", description: "WhatsApp and email", icon: ChatsCircle },
    ],
  },
  {
    label: "More",
    links: [
      { href: "/guides", label: "Guides", description: "Plain-English answers", icon: BookOpenText },
      { href: "/webinars", label: "Webinars", description: "Live Q&A sessions", icon: VideoCamera },
      { href: "/community", label: "Community", description: "Students on the same path", icon: UsersThree },
      { href: "/ausbildung", label: "Ausbildung", description: "Vocational training route", icon: Wrench },
      { href: "/about", label: "About us", description: "Who we are", icon: GraduationCap },
      { href: "/guides/faq-ielts", label: "IELTS & English", description: "Scores German unis ask for", icon: Exam },
    ],
  },
];
