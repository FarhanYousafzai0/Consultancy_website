import { redirect } from "next/navigation";

export const metadata = {
  title: "International programmes",
  description:
    "Browse programmes Parwaaz has verified for Pakistani students — English and German-taught, public and private. Full DAAD catalogue linked for everything else.",
};

export default function ProgramsPage() {
  redirect("/scholarships");
}
