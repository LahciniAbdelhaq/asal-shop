import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { LANG_COOKIE } from '@/lib/i18n';

// 1) Back-office : tout /admin (sauf la connexion) et /api/admin exigent une session administrateur.
// 2) Boutique : le français est servi sans préfixe (« /products/x » → page interne « /fr/products/x »),
//    l'anglais et l'arabe sous « /en/… » et « /ar/… ». Un visiteur qui a choisi une langue y est renvoyé.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) return guardAdmin(req);

  const first = pathname.split('/')[1];
  if (first === 'en' || first === 'ar') return NextResponse.next();

  if (first === 'fr') {
    // /fr/… n'est pas une adresse publique : version sans préfixe
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(3) || '/';
    return NextResponse.redirect(url, 308);
  }

  const pref = req.cookies.get(LANG_COOKIE)?.value;
  if (pref === 'en' || pref === 'ar') {
    const url = req.nextUrl.clone();
    url.pathname = `/${pref}${pathname === '/' ? '' : pathname}`;
    return NextResponse.redirect(url, 307);
  }

  const url = req.nextUrl.clone();
  url.pathname = `/fr${pathname === '/' ? '' : pathname}`;
  return NextResponse.rewrite(url);
}

async function guardAdmin(req: NextRequest) {
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

export const config = {
  // tout sauf les fichiers (chemins avec une extension), les ressources Next et les API publiques
  matcher: ['/((?!api/|_next/|media/|fonts/|brand/|uploads/|.*\\.\\w+$).*)', '/api/admin/:path*'],
};
