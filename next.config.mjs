/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true, // ✅ Ensure this is enabled for Next.js 14 App Router
  },
};

export default nextConfig;
