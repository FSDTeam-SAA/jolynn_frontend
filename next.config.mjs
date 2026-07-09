const nextConfig = {
  images: {
    domains: ["example.com", "res.cloudinary.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  reactStrictMode: true,
};

export default nextConfig;
