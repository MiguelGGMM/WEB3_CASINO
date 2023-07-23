/** @type {import('next').NextConfig} */
//const { withSentryConfig } = require('@sentry/nextjs')
const nextConfig = {
  // future: {
  //     webpack5: true
  // }
  reactStrictMode: false,
  distDir: 'build',
  // swcMinify: true,
  compiler: {
    // ssr and displayName are configured by default
    styledComponents: true,
  },
  eslint: {
    //dirs: ['src']
    ignoreDuringBuilds: false,
    dirs: [
      './app',
      './src/pages',
      './src',
      './src/services',
      './src/components',
    ],
  },
  images: { unoptimized: true } /* not working? */,
  //pageExtensions: process.env["CC_SITE_ID"] ? ["static.tsx"] : ["server.tsx"]
  //pageExtensions: ['page.js', 'page.tsx', 'page.jsx', 'page.ts', 'static.tsx', 'server.tsx']
  // output: 'export', //crash for vercel deployment!!! comment or indicate .next on vercel as build folder
}

module.exports = nextConfig //withSentryConfig(nextConfig)
