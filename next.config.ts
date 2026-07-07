import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    // Firebase Hosting serves the static export directly, so Next's
    // on-demand image optimizer isn't available.
    unoptimized: true,
  },
};

export default nextConfig;
