import mdx from "@next/mdx";

const withMDX = mdx({
  extension: /\.mdx?$/,
  options: {},
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  transpilePackages: ["next-mdx-remote"],
  // Content is read with fs at request time; bundle it into serverless functions.
  outputFileTracingIncludes: {
    "/*": ["./src/app/**/*.mdx"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.google.com",
        pathname: "**",
      },
    ],
  },
  sassOptions: {
    compiler: "modern",
    silenceDeprecations: ["legacy-js-api"],
  },
  async redirects() {
    return [
      { source: "/blog", destination: "/essay", permanent: true },
      { source: "/blog/:slug*", destination: "/essay/:slug*", permanent: true },
      { source: "/book", destination: "/chat", permanent: true },
      { source: "/book/:type(intro|chat|deep-dive)", destination: "/chat", permanent: true },
      { source: "/book/:path*", destination: "/chat/:path*", permanent: true },
    ];
  },
};

export default withMDX(nextConfig);
