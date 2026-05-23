import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    // Para versiones experimentales o nuevas de Next
    allowedDevOrigins: ["192.168.1.46", "localhost"],
  },
  // Por si tu versión lo pide en la raíz
  allowedDevOrigins: ["192.168.1.46", "localhost"],
} as any;

export default nextConfig;
