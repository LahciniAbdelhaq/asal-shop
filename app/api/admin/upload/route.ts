import { NextResponse } from 'next/server';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { getAdmin } from '@/lib/auth';

// Les fichiers envoyés depuis le back-office sont stockés dans storage/uploads
// (hors de /public pour fonctionner aussi après un `next build`) et servis par /uploads/...
const UPLOAD_DIR =path.join(process.cwd(), 'storage', 'uploads');
const ALLOWED = /^(image\/(png|jpe?g|webp|gif|svg\+xml|avif|x-icon|vnd\.microsoft\.icon)|video\/(mp4|webm))$/;

export async function POST(req: Request) {
  if (!(await getAdmin())) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const form = await req.formData();
  const files = form.getAll('file').filter((f): f is File => f instanceof File);
  if (!files.length) return NextResponse.json({ error: 'Aucun fichier' }, { status: 400 });

  const month = new Date().toISOString().slice(0, 7);
  const dir = path.join(UPLOAD_DIR, month);
  await mkdir(dir, { recursive: true });
  const urls: string[] = [];
  for (const file of files) {
    if (!ALLOWED.test(file.type)) return NextResponse.json({ error: `Type non autorisé : ${file.type || 'inconnu'}` }, { status: 400 });
    if (file.size > 60 * 1024 * 1024) return NextResponse.json({ error: 'Fichier trop volumineux (60 Mo max)' }, { status: 400 });
    const ext = path.extname(file.name).toLowerCase().replace(/[^.a-z0-9]/g, '') || '.bin';
    const base = path.basename(file.name, path.extname(file.name)).normalize('NFD').replace(/[^\w-]+/g, '-').slice(0, 40) || 'fichier';
    const name = `${base}-${crypto.randomBytes(4).toString('hex')}${ext}`;
    await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
    urls.push(`/uploads/${month}/${name}`);
  }
  return NextResponse.json({ urls });
}
