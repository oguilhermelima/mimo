import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);

await jiti.import("./src/env");

/** @type {import("next").NextConfig} */
const config = {
  transpilePackages: [
    "@caixa/api",
    "@caixa/db",
    "@caixa/ui",
    "@caixa/validators",
  ],
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.cloudfront.net" },
      { protocol: "https", hostname: "**.amazonaws.com" },
    ],
  },
};

export default config;
