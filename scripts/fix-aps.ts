/**
 * Removes the incorrect APS requirement from data already in MongoDB.
 * (Seed files are fixed in code; this updates the live collections.)
 *
 *   npm run db:fix-aps            # dry run — shows what would change
 *   npm run db:fix-aps -- --apply # writes the changes
 *
 * Programmes: pulls "aps_certificate" from requiredDocuments.
 * Guides: replaces title/body/sourceUrl of the guides whose APS wording changed,
 * but only when the stored body still matches an APS claim — admin edits that
 * already removed APS are left alone.
 */
import mongoose from "mongoose";
import { seedGuides } from "@/data/seed-guides";
import { connectMongo } from "@/lib/db/connect";
import { GuideModel } from "@/lib/db/guide-model";
import { ProgramModel } from "@/lib/db/program-model";

const APPLY = process.argv.includes("--apply");
const GUIDE_SLUGS = ["aps-pakistan", "anabin-recognition", "faq-timeline", "faq-master-documents"];
const APS_CLAIM = /\bAPS\b/;

async function main() {
  await connectMongo();
  console.log(APPLY ? "APPLY mode — writing changes" : "Dry run — nothing will be written");

  const programmes = await ProgramModel.countDocuments({ requiredDocuments: "aps_certificate" });
  console.log(`Programmes listing aps_certificate: ${programmes}`);
  if (APPLY && programmes > 0) {
    const res = await ProgramModel.updateMany(
      { requiredDocuments: "aps_certificate" },
      { $pull: { requiredDocuments: "aps_certificate" } }
    );
    console.log(`  updated ${res.modifiedCount}`);
  }

  for (const slug of GUIDE_SLUGS) {
    const seed = seedGuides.find((g) => g.slug === slug);
    if (!seed) continue;
    const doc = await GuideModel.findOne({ slug }).lean<{ title: string; body: string }>();
    if (!doc) {
      console.log(`Guide ${slug}: not in database (will be seeded from code if the collection is empty)`);
      continue;
    }
    // The old aps-pakistan guide must be replaced even though the new one also says "APS".
    const needs =
      slug === "aps-pakistan"
        ? !doc.body.startsWith("Short answer: no.")
        : APS_CLAIM.test(doc.body.replace(/No APS certificate[^\n]*/g, ""));
    console.log(`Guide ${slug}: ${needs ? "needs update" : "ok"} — "${doc.title}"`);
    if (APPLY && needs) {
      await GuideModel.updateOne(
        { slug },
        {
          $set: {
            title: seed.title,
            body: seed.body,
            sourceUrl: seed.sourceUrl,
            lastVerifiedAt: seed.lastVerifiedAt,
          },
        }
      );
      console.log("  updated");
    }
  }

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
