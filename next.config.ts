import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mongodb", "mongoose", "mongodb-memory-server"],
};

export default nextConfig;
