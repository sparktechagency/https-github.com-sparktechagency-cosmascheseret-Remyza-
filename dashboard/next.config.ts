import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The dashboard is accessed over the local network during development.
  // Allow the dev client to receive updated JavaScript through HMR.
  allowedDevOrigins: ["10.10.27.102"],
};

export default nextConfig;
