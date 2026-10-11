import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.join(process.cwd(), 'storage', 'uploads');
const TYPES: Record<string, string> = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif',
  '.svg': 'image/svg+xml', '.avif': 'image/avif', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.webm': 'video/webm',
};

export async function GET(_: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const parts = (await params).path;
  const file = path.normalize(path.join(ROOT, ...parts));
  if (!file.startsWith(ROOT + path.sep)) return new Response('Not found', { status: 404 });
  try {
    const s = await stat(file);
    if (!s.isFile()) throw new Error();
    const body = await readFile(file);
    const type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
    return new Response(body, {
      headers: {
        'Content-Type': type,
        'Content-Length': String(s.size),
        'Cache-Control': 'public, max-age=31536000, immutable',
        ...(type === 'image/svg+xml' ? { 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'" } : {}),
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
