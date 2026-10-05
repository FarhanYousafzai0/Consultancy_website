import { MongoClient } from "mongodb";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("No MONGODB_URI");
    process.exit(1);
  }
  const withDb = uri.includes("/?")
    ? uri.replace("/?", "/parwaz?")
    : uri.endsWith("/")
      ? `${uri}parwaz`
      : uri;
  console.log("Connecting…");
  const client = await MongoClient.connect(withDb, {
    serverSelectionTimeoutMS: 25000,
  });
  await client.db("parwaz").command({ ping: 1 });
  console.log("OK — Atlas reachable, database parwaz");
  await client.close();
}

main().catch((error) => {
  console.error("FAIL:", error.code || error.message);
  process.exit(1);
});
