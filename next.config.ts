import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["unpdf", "mammoth"],
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
  async redirects() {
    return [
      {
        source: "/accreditation",
        destination: "/emergency-services",
        permanent: true,
      },
      {
        source: "/accreditation/:path*",
        destination: "/emergency-services/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
