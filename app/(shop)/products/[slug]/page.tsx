import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Icon from '@/components/Icon';
import ProductView from '@/components/shop/ProductView';
import ReviewForm from '@/components/shop/ReviewForm';
import { ProductCard } from '@/components/shop/ProductCard';
import { db } from '@/lib/db';
import { getProduct, productInclude } from '@/lib/catalog';
import { getSettings } from '@/lib/settings';
import { stripHtml } from '@/lib/format';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = await getProduct((await params).slug);
  if (!p) return {};
  return {
    title: p.seoTitle || p.title,
    description: p.seoDescription || stripHtml(p.description).slice(0, 160),
    openGraph: { images: p.images[0]?.url ? [p.images[0].url] : [] },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const p = await getProduct((await params).slug);
  if (!p) notFound();
  const s = await getSettings();

  const cat = p.categories.find((c) => c.isActive);
  const [reviews, related] = await Promise.all([
    db.review.findMany({ where: { productId: p.id, approved: true }, orderBy: { createdAt: 'desc' } }),
    db.product.findMany({
      where: { status: 'active', id: { not: p.id }, ...(cat ? { categories: { some: { id: cat.id } } } : {}) },
      include: productInclude,
      take: 4,
      orderBy: { sortOrder: 'asc' },
    }),
  ]);
  const avg = reviews.length ? reviews.reduce((t, r) => t + r.rating, 0) / reviews.length : 0;
  const stars = (n: number) => '★★★★★'.slice(0, Math.round(n)) + '☆☆☆☆☆'.slice(0, 5 - Math.round(n));

  return (
    <>
      <nav className="asal-crumb" aria-label="Fil d’Ariane">
        <Link href="/">Accueil</Link>
        <span className="sep">/</span>
        {cat && (<><Link href={`/collections/${cat.slug}`}>{cat.title}</Link><span className="sep">/</span></>)}
        <span className="here">{p.title}</span>
      </nav>

      <ProductView
        p={{ id: p.id, slug: p.slug, title: p.title, optionName: p.optionName, images: p.images.map((i) => ({ url: i.url, alt: i.alt })), variants: p.variants }}
        labels={{ add: s.product.addToCartLabel, soldOut: s.product.soldOutLabel }}
        defaultVariant={p.subtitle}
      >
        <div className="product-desc" dangerouslySetInnerHTML={{ __html: p.description }} />
      </ProductView>

      {s.product.reviewsEnabled && (
        <section className="asal-avis" style={{ marginInline: 'calc(-1 * var(--gutter))' }}>
          <div className="asal-avis__inner">
            <p className="asal-avis__eyebrow">{s.product.reviewsEyebrow}</p>
            <h2 className="asal-avis__title">{s.product.reviewsTitle}</h2>
            <div className="asal-avis__stars" aria-hidden="true">{stars(avg)}</div>
            {reviews.length ? (
              <>
                <p><strong>{avg.toFixed(1)}/5</strong> · {reviews.length} avis</p>
                <div className="review-list">
                  {reviews.map((r) => (
                    <div className="review" key={r.id}>
                      <span className="stars">{stars(r.rating)}</span> <strong>{r.name}</strong>
                      <p>{r.comment}</p>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 20 }}><ReviewForm productId={p.id} /></div>
              </>
            ) : (
              <div className="asal-avis__empty">
                <p><strong>Aucun avis pour le moment.</strong></p>
                <p>Soyez la première personne à partager votre expérience avec ce produit.</p>
                <ReviewForm productId={p.id} />
                <p className="asal-avis__note">
                  Une question ? <Link href="/pages/contact" className="link-amber">Contactez-nous</Link>
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {s.product.trustItems.length > 0 && (
        <div className="ptrust">
          <div className="ptrust__inner">
            {s.product.trustItems.map((t, i) => (
              <div className="ptrust__item" key={i}><Icon name={t.icon} size={20} stroke={1.8} />{t.label}</div>
            ))}
          </div>
        </div>
      )}

      {related.length > 0 && (
        <section className="related">
          <h2>{s.product.relatedTitle}</h2>
          <div className="product-grid">{related.map((r) => <ProductCard key={r.id} p={r} fmt={s.shop} />)}</div>
        </section>
      )}
    </>
  );
}
