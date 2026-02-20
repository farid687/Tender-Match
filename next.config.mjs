/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ceijnukbqbrpkrhxfvym.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    // Tree-shake Chakra (and Tailwind) so only imported components end up in the bundle when deployed
    optimizePackageImports: ["@chakra-ui/react", "tailwindcss"],
  },
};

export default nextConfig;
