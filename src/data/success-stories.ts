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
    body: "I used the eligibility check to confirm APS and IELTS before shortlisting. Parwaz showed Reach and Match programs with sources — I still applied myself, but I stopped guessing which public unis were realistic.",
  },
  {
    id: "s-fsc",
    initials: "S.R.",
    path: "FSc → Studienkolleg route",
    field: "Engineering",
    body: "I thought a private Bachelor's was my only option. The check explained Studienkolleg clearly and linked guides. A consultant call later helped with documents — the free tools got me started.",
  },
  {
    id: "m-ausbildung",
    initials: "M.H.",
    path: "FSc → Ausbildung (IT)",
    field: "Ausbildung · IT",
    body: "I needed B1 first. After the check, I used the Ausbildung listings to find Fachinformatiker offers and applied on Jobsuche. Self-serve worked; I did not need placement help.",
  },
  {
    id: "n-scholarship",
    initials: "N.F.",
    path: "Master's + scholarship shortlist",
    field: "Data / AI",
    body: "Saving scholarships with honest odds stopped me from chasing every DAAD rumour. Deadline alerts meant I actually opened the applications on time.",
  },
];
