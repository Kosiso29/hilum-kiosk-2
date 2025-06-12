declare module 'next-pwa' {
    import { NextConfig } from 'next'
    const withPWA: (config: { dest: string; disable?: boolean }) => (nextConfig: NextConfig) => NextConfig
    export default withPWA
} 