import { getAuth } from "@/lib/auth/auth";

async function handler(request: Request) {
  const auth = await getAuth();
  return auth.handler(request);
}

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
};
