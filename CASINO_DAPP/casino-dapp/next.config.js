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
        dirs: ['src']
    }
}

module.exports = nextConfig//withSentryConfig(nextConfig)
