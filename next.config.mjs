/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  domains: ["www.google.com", "www.gstatic.com"],
  serverComponentsExternalPackages: ["winston"],
};
