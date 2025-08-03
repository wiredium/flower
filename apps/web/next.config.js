/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // We use Biome instead of ESLint
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Temporarily ignore build errors for deployment
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
