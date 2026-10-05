import { ProgramsBrowser } from "@/components/programs/programs-browser";

export const metadata = {
  title: "Programs",
  description:
    "Search verified German university programs with filters and an only-what-I-qualify-for toggle.",
};

export default function ProgramsPage() {
  return <ProgramsBrowser />;
}
