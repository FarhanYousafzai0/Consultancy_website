export type SuccessStory = {
  id: string;
  initials: string;
  path: string;
  field?: string;
  body: string;
};

/** Keep empty until each story has explicit publication approval and evidence. */
export const successStories: SuccessStory[] = [];
