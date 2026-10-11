import { NextResponse } from 'next/server';
import { cardInfo, listProducts } from '@/lib/catalog';
import { getSettings } from '@/lib/settings';
import { money } from '@/lib/format';

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get('q')?.trim() || '';
  if (q.length < 2) return NextResponse.json([]);
  const [s, list] = await Promise.all([getSettings(), listProducts({ q })]);
  return NextResponse.json(
    list.slice(0, 8).map((p) => ({ slug: p.slug, title: p.title, image: p.images[0]?.url || '', price: money(cardInfo(p).price, s.shop) })),
  );
}
