import { setServers } from "node:dns";
import { tmpdir } from "node:os";
import path from "node:path";
import { MongoClient, type Db } from "mongodb";
import mongoose from "mongoose";

const globalForMongo = globalThis as typeof globalThis & {
  mongoosePromise?: Promise<typeof mongoose>;
  memoryMongoUri?: string;
  memoryMongoStarting?: Promise<string>;
  nativeClientPromise?: Promise<MongoClient>;
  dnsServersPinned?: boolean;
};

/** Some Windows/router DNS refuse SRV lookups for mongodb+srv:// — use public resolvers. */
function ensurePublicDnsForSrv(uri: string) {
  if (globalForMongo.dnsServersPinned) return;
  if (!uri.startsWith("mongodb+srv://")) return;
  try {
    setServers(["8.8.8.8", "1.1.1.1"]);
    globalForMongo.dnsServersPinned = true;
  } catch {
    // ignore — direct host URI still works
  }
}

export function getMongoUri() {
  return process.env.MONGODB_URI?.trim() || "";
}

async function resolveUri(): Promise<string> {
  const configured = getMongoUri();
  if (!configured) {
    throw new Error(
      "MONGODB_URI is not set. See docs/ENV_SETUP.md (Atlas Frankfurt or MONGODB_URI=memory)."
    );
  }
  if (configured !== "memory") {
    ensurePublicDnsForSrv(configured);
    // Ensure a database name is present on mongodb+srv URIs.
    if (configured.includes("mongodb+srv://") && configured.includes("/?")) {
      return configured.replace("/?", "/parwaz?");
    }
    return configured;
  }

  if (globalForMongo.memoryMongoUri) {
    return globalForMongo.memoryMongoUri;
  }

  if (!globalForMongo.memoryMongoStarting) {
    globalForMongo.memoryMongoStarting = (async () => {
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      const server = await MongoMemoryServer.create({
        binary: {
          downloadDir: path.join(tmpdir(), "parwaz-mongodb-binaries"),
        },
        instance: {
          dbName: "parwaz",
        },
      });
      const uri = server.getUri("parwaz");
      globalForMongo.memoryMongoUri = uri;
      console.info("[db] In-process MongoDB ready (MONGODB_URI=memory)");
      return uri;
    })();
  }

  return globalForMongo.memoryMongoStarting;
}

export async function connectMongo(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!globalForMongo.mongoosePromise) {
    globalForMongo.mongoosePromise = (async () => {
      const uri = await resolveUri();
      await mongoose.connect(uri, { bufferCommands: false });
      return mongoose;
    })().catch((error) => {
      globalForMongo.mongoosePromise = undefined;
      console.error("[db] MongoDB connection failed:", error);
      throw error;
    });
  }

  return globalForMongo.mongoosePromise;
}

/** Native MongoDB client/db for Better Auth (top-level `mongodb` package). */
export async function getNativeDb(): Promise<Db> {
  const uri = await resolveUri();
  if (!globalForMongo.nativeClientPromise) {
    const client = new MongoClient(uri);
    globalForMongo.nativeClientPromise = client.connect().catch((error) => {
      globalForMongo.nativeClientPromise = undefined;
      throw error;
    });
  }
  const client = await globalForMongo.nativeClientPromise;
  return client.db();
}

export function isMongoReady() {
  return mongoose.connection.readyState === 1;
}
