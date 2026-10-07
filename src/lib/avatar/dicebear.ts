/**
 * Deterministic avatars via DiceBear HTTP API (waves).
 * @see https://api.dicebear.com/10.x/waves/svg
 */

const STYLE = "waves";

/** Soft Parwaaz lime / mint backgrounds (hex without #). */
const BACKGROUNDS = ["d4f56a", "e2f79e", "c8e6c0", "b8d4a8", "f0f7e6"];

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function dicebearAvatarUrl(
  seed: string,
  options?: {
    size?: number;
  }
): string {
  const h = hashSeed(seed || "parwaaz");
  const background = BACKGROUNDS[h % BACKGROUNDS.length];
  const size = options?.size ?? 128;
  const params = new URLSearchParams({
    seed: seed || "parwaaz",
    size: String(size),
    radius: "50",
    backgroundColor: background,
  });
  return `https://api.dicebear.com/10.x/${STYLE}/svg?${params.toString()}`;
}
