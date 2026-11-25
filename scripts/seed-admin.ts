/**
 * Creates (or repairs) the admin account so it can sign in with a password
 * or an email code.
 *
 *   npm run db:seed-admin                       → first email in ADMIN_EMAILS
 *   npm run db:seed-admin -- --email=a@b.com    → a specific admin email
 *   npm run db:seed-admin -- --reset-password   → replace an existing password
 *
 * The password comes from ADMIN_SEED_PASSWORD. If it is not set, a random one
 * is generated and written to ADMIN_SEED_PASSWORD_FILE (default
 * D:\dev-cache\parwaz\admin-password.txt), never to the console or the repo.
 */
import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { adminEmails, getAuth, MIN_PASSWORD_LENGTH } from "../src/lib/auth/auth";

const arg = (name: string) =>
  process.argv.find((value) => value.startsWith(`--${name}=`))?.split("=")[1];
const resetPassword = process.argv.includes("--reset-password");

async function main() {
  const email = (arg("email") || adminEmails()[0] || "").trim().toLowerCase();
  if (!email.includes("@")) {
    throw new Error("No admin email. Set ADMIN_EMAILS or pass --email=you@example.com");
  }
  if (!adminEmails().includes(email)) {
    console.warn(
      `[seed-admin] ${email} is not in ADMIN_EMAILS. It gets the admin role in the database, but add it to ADMIN_EMAILS on every environment too.`
    );
  }

  const providedPassword = process.env.ADMIN_SEED_PASSWORD?.trim();
  if (providedPassword && providedPassword.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`ADMIN_SEED_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  const password = providedPassword || randomBytes(12).toString("base64url");

  const auth = await getAuth();
  const ctx = await auth.$context;
  const adapter = ctx.internalAdapter;

  let user = (await adapter.findUserByEmail(email))?.user;
  if (!user) {
    user = await adapter.createUser({
      email,
      name: arg("name") || "Parwaaz Admin",
      emailVerified: true,
      role: "admin",
    });
    console.info(`[seed-admin] Created admin user ${email}`);
  } else {
    await adapter.updateUser(user.id, { role: "admin", emailVerified: true });
    console.info(`[seed-admin] Found ${email}; role set to admin`);
  }

  const account = await adapter.findCredentialAccount(user.id);
  const hash = await ctx.password.hash(password);
  let passwordChanged = true;
  if (!account) {
    await adapter.linkAccount({
      userId: user.id,
      providerId: "credential",
      accountId: user.id,
      password: hash,
    });
  } else if (!account.password || resetPassword) {
    await adapter.updateAccount(account.id, { password: hash });
  } else {
    passwordChanged = false;
    console.info(
      "[seed-admin] A password is already set. Run again with --reset-password to replace it."
    );
  }

  if (passwordChanged) {
    if (providedPassword) {
      console.info("[seed-admin] Password set from ADMIN_SEED_PASSWORD.");
    } else {
      const file =
        process.env.ADMIN_SEED_PASSWORD_FILE?.trim() ||
        "D:\\dev-cache\\parwaz\\admin-password.txt";
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, `Parwaaz admin\nEmail: ${email}\nPassword: ${password}\n`, "utf8");
      console.info(`[seed-admin] Generated a password and saved it to ${file}`);
    }
  }

  console.info("[seed-admin] Done. Sign in at /admin/login with the password or an email code.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("[seed-admin] Failed:", error instanceof Error ? error.message : error);
    process.exit(1);
  });
