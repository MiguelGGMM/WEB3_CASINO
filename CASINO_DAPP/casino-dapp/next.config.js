/** @type {import('next').NextConfig} */
//const { withSentryConfig } = require('@sentry/nextjs')
const nextConfig = {
    // future: {
    //     webpack5: true
    // }
    eslint: {
        dirs: ['src']
    }
}

module.exports = nextConfig//withSentryConfig(nextConfig)
