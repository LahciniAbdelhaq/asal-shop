import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),
  experimental: {
    serverActions: { bodySizeLimit: '20mb' },
    // économie de mémoire : un seul worker de build, optimisations mémoire de webpack
    cpus: 1,
    webpackMemoryOptimizations: true,
  },
  images: { unoptimized: true },
};
export default nextConfig;
