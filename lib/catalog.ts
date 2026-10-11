import { cache } from 'react';
import type { Prisma } from '@prisma/client';
import { db } from './db';

export const productInclude = {
  images: { orderBy: { position: 'asc' } },
  variants: { orderBy: { position: 'asc' } },
  categories: true,
} satisfies Prisma.ProductInclude;

export type FullProduct = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

export const inStock = (v: { stock: number; trackStock: boolean }) => !v.trackStock || v.stock > 0;

/** Carte produit : variante affichée (ex. « 250 g ») sinon la moins chère disponible. */
export function cardInfo(p: FullProduct, preferVariant?: string) {
  const vs = p.variants;
  const pref = preferVariant ? vs.find((v) => v.title.toLowerCase() === preferVariant.toLowerCase()) : undefined;
  const avail = vs.filter(inStock);
  const v = pref || [...(avail.length ? avail : vs)].sort((a, b) => a.price - b.price)[0];
  return {
    variant: v,
    price: v?.price ?? 0,
    compareAt: v?.compareAtPrice ?? null,
    label: pref ? pref.title : p.subtitle,
    image: p.images[0]?.url || '',
    image2: p.images[1]?.url || '',
    soldOut: !vs.some(inStock),
  };
}

export const getProduct = cache((slug: string) =>
  db.product.findFirst({ where: { slug, status: 'active' }, include: productInclude }),
);

export const getProductsBySlugs = cache(async (slugs: string[]) => {
  const list = await db.product.findMany({ where: { slug: { in: slugs }, status: 'active' }, include: productInclude });
  return slugs.map((s) => list.find((p) => p.slug === s)).filter(Boolean) as FullProduct[];
});

export const getCategory = cache((slug: string) => db.category.findFirst({ where: { slug, isActive: true } }));

export type SortKey = 'manual' | 'price-asc' | 'price-desc' | 'title-asc' | 'title-desc' | 'newest';

export async function listProducts(opts: { category?: string; q?: string; available?: boolean; min?: number; max?: number; sort?: SortKey }) {
  const where: Prisma.ProductWhereInput = { status: 'active' };
  if (opts.category && opts.category !== 'all') where.categories = { some: { slug: opts.category } };
  if (opts.q) where.OR = [{ title: { contains: opts.q, mode: 'insensitive' } }, { description: { contains: opts.q, mode: 'insensitive' } }, { productType: { contains: opts.q, mode: 'insensitive' } }];
  let list = await db.product.findMany({ where, include: productInclude, orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] });
  const price = (p: FullProduct) => cardInfo(p).price;
  if (opts.available) list = list.filter((p) => p.variants.some(inStock));
  if (opts.min != null) list = list.filter((p) => price(p) >= opts.min!);
  if (opts.max != null) list = list.filter((p) => price(p) <= opts.max!);
  const s = opts.sort || 'manual';
  if (s === 'price-asc') list.sort((a, b) => price(a) - price(b));
  if (s === 'price-desc') list.sort((a, b) => price(b) - price(a));
  if (s === 'title-asc') list.sort((a, b) => a.title.localeCompare(b.title, 'fr'));
  if (s === 'title-desc') list.sort((a, b) => b.title.localeCompare(a.title, 'fr'));
  if (s === 'newest') list.sort((a, b) => +b.createdAt - +a.createdAt);
  return list;
}
