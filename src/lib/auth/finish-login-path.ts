/** Only allow same-site paths as a post-login destination. */
export function safeNext(next: string | null | undefined) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}
