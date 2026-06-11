/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export — outputs to /out, ready for S3 + CloudFront
  output: "export",

  // Required for static export: image optimization via CloudFront, not Next.js server
  images: {
    unoptimized: true,
  },

  // Trailing slash ensures S3 serves folder/index.html correctly
  trailingSlash: true,
};

export default nextConfig;
