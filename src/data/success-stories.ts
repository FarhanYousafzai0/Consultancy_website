export type SuccessStory = {
  id: string;
  initials: string;
  path: string;
  field?: string;
  body: string;
};

/** Curated founder-approved stories — not user-generated. */
export const successStories: SuccessStory[] = [
  {
    id: "a-ms-cs",
    initials: "A.K.",
    path: "4-year BS → English-taught Master's (CS)",
    field: "Computer Science",
    body: "I used the eligibility check to confirm my degree and IELTS were enough before shortlisting. Parwaaz showed Reach and Match programs with sources — I still applied myself, but I stopped guessing which public unis were realistic.",
  },
  {
    id: "n-scholarship",
    initials: "N.F.",
    path: "Master's + scholarship shortlist",
    field: "Data / AI",
    body: "Saving scholarships with honest odds stopped me from chasing every DAAD rumour. Deadline alerts meant I actually opened the applications on time.",
  },
  {
    id: "m-ausbildung",
    initials: "M.H.",
    path: "FSc → Ausbildung (IT)",
    field: "Ausbildung · IT",
    body: "I needed B1 first. After the check, I used the Ausbildung listings to find Fachinformatiker offers and applied on Jobsuche. Self-serve worked; I did not need placement help.",
  },
];
