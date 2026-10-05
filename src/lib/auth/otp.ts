import { randomInt } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type OtpRecord = {
  email: string;
  otp: string;
  expiresAt: number;
};

function otpFile() {
  return (
    process.env.DEV_OTP_FILE?.trim() || "D:\\dev-cache\\parwaz\\last-otp.txt"
  );
}

function storeFile() {
  return path.join(path.dirname(otpFile()), "otp-store.json");
}

async function readStore(): Promise<OtpRecord[]> {
  try {
    const raw = await readFile(storeFile(), "utf8");
    return JSON.parse(raw) as OtpRecord[];
  } catch {
    return [];
  }
}

async function writeStore(records: OtpRecord[]) {
  const file = storeFile();
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(records, null, 2), "utf8");
}

export async function issueAdminOtp(email: string) {
  const otp = String(randomInt(100000, 999999));
  const record: OtpRecord = {
    email: email.toLowerCase(),
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000,
  };
  const others = (await readStore()).filter(
    (r) => r.email !== record.email && r.expiresAt > Date.now()
  );
  await writeStore([...others, record]);

  const out = otpFile();
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(
    out,
    `Parwaz admin OTP for ${record.email}: ${otp}\nExpires in 10 minutes.\n`,
    "utf8"
  );
  console.info(`[auth] Admin OTP for ${record.email}: ${otp}`);
  return { ok: true as const };
}

export async function verifyAdminOtp(email: string, otp: string) {
  const records = await readStore();
  const match = records.find(
    (r) =>
      r.email === email.toLowerCase() &&
      r.otp === otp.trim() &&
      r.expiresAt > Date.now()
  );
  if (!match) return false;
  await writeStore(records.filter((r) => r.email !== match.email));
  return true;
}
