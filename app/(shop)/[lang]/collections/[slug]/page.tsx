import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import CollectionView from '@/components/shop/CollectionView';
import { getCategory, listProducts } from '@/lib/catalog';
import { getSettings, getT } from '@/lib/settings';
import { asLocale } from '@/lib/i18n';
import { db } from '@/lib/db';

type Params = Promise<{ lang: string; slug: string }>;

// pages catégories générées au déploiement puis mises en cache (filtres et tri côté navigateur)
export async function generateStaticParams() {
  const cats = await db.category.findMany({ where: { isActive: true }, select: { slug: true } });
  return [{ slug: 'all' }, ...cats.map((c) => ({ slug: c.slug }))];
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug, lang: l } = await params;
  const lang = asLocale(l);
  if (slug === 'all') return { title: (await getT(lang))('allProducts') };
  const c = await getCategory(slug, lang);
  return c ? { title: c.seoTitle || c.title, description: c.seoDescription || c.description.replace(/<[^>]+>/g, '') } : {};
}

export default async function CollectionPage({ params }: { params: Params }) {
  const { slug, lang: l } = await params;
  const lang = asLocale(l);
  const cat = slug === 'all' ? null : await getCategory(slug, lang);
  if (slug !== 'all' && !cat) notFound();
  const [s, t, products] = await Promise.all([getSettings(lang), getT(lang), listProducts({ category: slug, lang })]);

  return (
    <div>
      <div className="collection-head">
        <h1>{cat ? cat.title : t('allProducts')}</h1>
        {cat?.description && <div className="desc" dangerouslySetInnerHTML={{ __html: cat.description }} />}
      </div>
      <CollectionView slug={slug} products={products} fmt={{ currency: s.shop.currency, currencyPosition: s.shop.currencyPosition }} />
    </div>
  );
}
