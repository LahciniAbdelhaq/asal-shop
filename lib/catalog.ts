import { cache } from 'react';
import type { Prisma } from '@prisma/client';
import { db } from './db';
import { DEFAULT_LOCALE, localize, parseI18n, type Locale } from './i18n';

export const productInclude = {
  images: { orderBy: { position: 'asc' } },
  variants: { orderBy: { position: 'asc' } },
  categories: true,
} satisfies Prisma.ProductInclude;

export type FullProduct = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

export { inStock, cardInfo, vLabel } from './product-utils';
import { cardInfo, inStock } from './product-utils';

/** Produit dans la langue demandée : textes traduits, libellés de variantes (`label`) et catégories.
 *  Les titres de variantes d'origine restent intacts (ils servent aux correspondances : coffrets, variante affichée…). */
export function localizeProduct(p: FullProduct, lang: Locale): FullProduct {
  if (lang === DEFAULT_LOCALE) return p;
  const vmap: Record<string, string> = parseI18n(p.i18n)[lang]?.variants || {};
  return {
    ...localize(p, lang),
    variants: p.variants.map((v) => (vmap[v.id]?.trim() ? { ...v, label: vmap[v.id] } : v)),
    categories: p.categories.map((c) => localize(c, lang)),
  };
}

export const getProduct = cache(async (slug: string, lang: Locale = DEFAULT_LOCALE) => {
  const p = await db.product.findFirst({ where: { slug, status: 'active' }, include: productInclude });
  return p ? localizeProduct(p, lang) : null;
});

export const getProductsBySlugs = cache(async (slugs: string[], lang: Locale = DEFAULT_LOCALE) => {
  const list = await db.product.findMany({ where: { slug: { in: slugs }, status: 'active' }, include: productInclude });
  return slugs.map((s) => list.find((p) => p.slug === s)).filter(Boolean).map((p) => localizeProduct(p!, lang));
});

export const getCategory = cache(async (slug: string, lang: Locale = DEFAULT_LOCALE) => {
  const c = await db.category.findFirst({ where: { slug, isActive: true } });
  return c ? localize(c, lang) : null;
});

export type SortKey = 'manual' | 'price-asc' | 'price-desc' | 'title-asc' | 'title-desc' | 'newest';

export async function listProducts(opts: { category?: string; q?: string; available?: boolean; min?: number; max?: number; sort?: SortKey; lang?: Locale }) {
  const lang = opts.lang || DEFAULT_LOCALE;
  const where: Prisma.ProductWhereInput = { status: 'active' };
  if (opts.category && opts.category !== 'all') where.categories = { some: { slug: opts.category } };
  if (opts.q) {
    const q = { contains: opts.q, mode: 'insensitive' as const };
    // recherche aussi dans les traductions
    where.OR = [{ title: q }, { description: q }, { productType: q }, { i18n: q }];
  }
  let list = (await db.product.findMany({ where, include: productInclude, orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] })).map((p) => localizeProduct(p, lang));
  const price = (p: FullProduct) => cardInfo(p).price;
  if (opts.available) list = list.filter((p) => p.variants.some(inStock));
  if (opts.min != null) list = list.filter((p) => price(p) >= opts.min!);
  if (opts.max != null) list = list.filter((p) => price(p) <= opts.max!);
  const s = opts.sort || 'manual';
  if (s === 'price-asc') list.sort((a, b) => price(a) - price(b));
  if (s === 'price-desc') list.sort((a, b) => price(b) - price(a));
  if (s === 'title-asc') list.sort((a, b) => a.title.localeCompare(b.title, lang));
  if (s === 'title-desc') list.sort((a, b) => b.title.localeCompare(a.title, lang));
  if (s === 'newest') list.sort((a, b) => +b.createdAt - +a.createdAt);
  return list;
}
