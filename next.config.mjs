/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactStrictMode: true,
  reactCompiler: true,
  experimental: {
    optimizePackageImports: ["@chakra-ui/react" , "tailwindcss"],
  },
};

export default nextConfig;
