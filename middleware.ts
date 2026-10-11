import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Protège tout /admin (sauf la page de connexion) : vérification du jeton de session.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === '/admin/login') return NextResponse.next();
  const token = req.cookies.get('asal_admin')?.value;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET || 'dev-secret-change-me'));
      if (payload.kind === 'admin') return NextResponse.next();
    } catch { /* jeton invalide ou expiré */ }
  }
  if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const url = req.nextUrl.clone();
  url.pathname = '/admin/login';
  url.search = '';
  return NextResponse.redirect(url);
}

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] };
