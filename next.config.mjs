/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Remove or comment out the standalone output for now
  // output: "standalone",
  
  // Keep other optimizations
  trailingSlash: false,
  poweredByHeader: false,
  generateEtags: false,
  
  // Add experimental features that might help
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "www.google.com",
      },
      {
        protocol: "https",
        hostname: "www.gstatic.com",
      },
    ],
  },
};

export default nextConfig;
