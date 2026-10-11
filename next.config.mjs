import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),
  experimental: { serverActions: { bodySizeLimit: '20mb' } },
  images: { unoptimized: true },
};
export default nextConfig;
