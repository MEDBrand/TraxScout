import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable React strict mode
  reactStrictMode: true,
  
  // Production optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        // Block source maps in production
        source: '/:path*.map',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex' },
        ],
      },
    ];
  },
  
  // Disable source maps in production for code protection
  productionBrowserSourceMaps: false,
  
  // Webpack customizations for code protection
  webpack: (config, { isServer, dev }) => {
    if (!dev && !isServer) {
      // Production client-side optimizations
      config.optimization = {
        ...config.optimization,
        // Aggressive minification
        minimize: true,
        // Mangle variable names
        mangleExports: true,
        // Split chunks for better caching
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Separate vendor code
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      };
    }
    
    return config;
  },
  
  // Turbopack config (Next.js 16 default bundler)
  turbopack: {},
  
  // Experimental features
  experimental: {
    // Server actions for sensitive operations
    serverActions: {
      allowedOrigins: ['traxscout.app', 'www.traxscout.app', 'localhost:3000'],
    },
  },
  
  // Environment variable validation
  env: {
    // Only expose NEXT_PUBLIC_ variables to client
    // All sensitive vars stay server-side
  },
  
  // Redirects for security
  async redirects() {
    return [
      // Block access to sensitive paths
      {
        source: '/.env',
        destination: '/404',
        permanent: false,
      },
      {
        source: '/.git/:path*',
        destination: '/404',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
