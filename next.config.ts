import type { NextConfig } from "next";

const repositoryBasePath = process.env.WARFRAME_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath: repositoryBasePath,
  assetPrefix: repositoryBasePath,
  reactStrictMode: true,
};

export default nextConfig;
