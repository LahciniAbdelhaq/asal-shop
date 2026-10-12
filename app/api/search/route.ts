import { NextResponse } from 'next/server';
import { cardInfo, listProducts } from '@/lib/catalog';
import { getSettings } from '@/lib/settings';
import { money } from '@/lib/format';
import { asLocale } from '@/lib/i18n';

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const q = sp.get('q')?.trim() || '';
  const lang = asLocale(sp.get('lang'));
  if (q.length < 2) return NextResponse.json([]);
  const [s, list] = await Promise.all([getSettings(lang), listProducts({ q, lang })]);
  return NextResponse.json(
    list.slice(0, 8).map((p) => ({ slug: p.slug, title: p.title, image: p.images[0]?.url || '', price: money(cardInfo(p).price, s.shop) })),
  );
}
