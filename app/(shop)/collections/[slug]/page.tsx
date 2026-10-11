import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import CollectionView from '@/components/shop/CollectionView';
import { getCategory, listProducts } from '@/lib/catalog';
import { getSettings } from '@/lib/settings';
import { db } from '@/lib/db';

// pages catégories générées au déploiement puis mises en cache (filtres et tri côté navigateur)
export async function generateStaticParams() {
  const cats = await db.category.findMany({ where: { isActive: true }, select: { slug: true } });
  return [{ slug: 'all' }, ...cats.map((c) => ({ slug: c.slug }))];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (slug === 'all') return { title: 'Tous les produits' };
  const c = await getCategory(slug);
  return c ? { title: c.seoTitle || c.title, description: c.seoDescription || c.description.replace(/<[^>]+>/g, '') } : {};
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = slug === 'all' ? null : await getCategory(slug);
  if (slug !== 'all' && !cat) notFound();
  const [s, products] = await Promise.all([getSettings(), listProducts({ category: slug })]);

  return (
    <div>
      <div className="collection-head">
        <h1>{cat ? cat.title : 'Tous les produits'}</h1>
        {cat?.description && <div className="desc" dangerouslySetInnerHTML={{ __html: cat.description }} />}
      </div>
      <CollectionView slug={slug} products={products} fmt={{ currency: s.shop.currency, currencyPosition: s.shop.currencyPosition }} />
    </div>
  );
}
