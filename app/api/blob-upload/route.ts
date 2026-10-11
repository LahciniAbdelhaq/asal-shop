import { NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { getAdmin } from '@/lib/auth';

// Envoi direct navigateur → Vercel Blob (contourne la limite de 4,5 Mo des fonctions Vercel).
// Le jeton d'envoi n'est délivré qu'à un administrateur connecté.
export async function POST(req: Request) {
  const body = (await req.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => {
        if (!(await getAdmin())) throw new Error('Non autorisé');
        return {
          allowedContentTypes: ['image/*', 'video/mp4', 'video/webm'],
          maximumSizeInBytes: 100 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
    });
    return NextResponse.json(json);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

/** Indique au back-office quel mode d'envoi utiliser. */
export async function GET() {
  return NextResponse.json({ blob: Boolean(process.env.BLOB_READ_WRITE_TOKEN) });
}
