import path from 'node:path';
import { fileURLToPath } from 'node:url';

const longCache = [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }];

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),
  compress: true,
  poweredByHeader: false,
  experimental: {
    serverActions: { bodySizeLimit: '20mb' },
    // économie de mémoire : un seul worker de build, optimisations mémoire de webpack
    cpus: 1,
    webpackMemoryOptimizations: true,
  },
  images: { unoptimized: true },
  // fichiers statiques (noms uniques) : mis en cache 1 an par les navigateurs et le CDN
  async headers() {
    return [
      { source: '/media/:path*', headers: longCache },
      { source: '/fonts/:path*', headers: longCache },
      { source: '/brand/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }] },
    ];
  },
};
export default nextConfig;
