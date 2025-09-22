/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },     // ignore ESLint on Vercel
  typescript: { ignoreBuildErrors: true },  // ignore TS errors on Vercel
};
export default nextConfig;
