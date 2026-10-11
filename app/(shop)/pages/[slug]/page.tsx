import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import { stripHtml } from '@/lib/format';
import { inStock } from '@/lib/catalog';
import ContactForm from '@/components/shop/ContactForm';
import Composer, { type ComposerItem } from '@/components/shop/Composer';
import { FaqList } from '@/components/shop/Sections';

type Params = Promise<{ slug: string }>;

const getPage = (slug: string) => db.page.findFirst({ where: { slug, isPublished: true } });

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = await getPage((await params).slug);
  return p ? { title: p.seoTitle || p.title, description: p.seoDescription || stripHtml(p.content).slice(0, 160) || undefined } : {};
}

export default async function CmsPage({ params }: { params: Params }) {
  const page = await getPage((await params).slug);
  if (!page) notFound();
  const s = await getSettings();

  if (page.template === 'composer') {
    const prods = await db.product.findMany({
      where: { status: 'active', productType: s.composer.productType },
      include: { images: { orderBy: { position: 'asc' }, take: 1 }, variants: true },
      orderBy: { sortOrder: 'asc' },
    });
    const items: ComposerItem[] = prods.map((p) => ({
      productId: p.id,
      slug: p.slug,
      title: p.title,
      image: p.images[0]?.url || '',
      variants: Object.fromEntries(
        p.variants.filter((v) => s.composer.formats.map((x) => String(x).trim()).includes(v.title)).map((v) => [v.title, { id: v.id, price: v.price, available: inStock(v) }]),
      ),
    }));
    return (
      <Composer
        items={items}
        formats={s.composer.formats.map((x) => String(x).trim()).filter(Boolean)}
        sizes={s.composer.sizes.map(Number).filter((n) => n > 0)}
        boxPrice={Number(s.composer.boxPrice) || 0}
        labels={{ eyebrow: s.composer.eyebrow, title: s.composer.title || page.title, text: s.composer.text, cta: s.composer.ctaLabel }}
      />
    );
  }

  if (page.template === 'contact') {
    return (
      <div className="contact-wrap">
        <div className="page-head" style={{ paddingTop: 10 }}><h1>{page.title}</h1></div>
        {page.content && <div className="rte rte--center" style={{ padding: '10px 0 20px' }} dangerouslySetInnerHTML={{ __html: page.content }} />}
        <div style={{ marginTop: 30 }}><ContactForm /></div>
      </div>
    );
  }

  if (page.template === 'faq') {
    let items: { q: string; a: string }[] = [];
    try { items = JSON.parse(page.content); } catch { /* contenu libre */ }
    return (
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 0 80px' }}>
        <div className="page-head" style={{ paddingBottom: 30 }}><h1>{page.title}</h1></div>
        {items.length ? <FaqList items={items} /> : <div className="rte" dangerouslySetInnerHTML={{ __html: page.content }} />}
      </div>
    );
  }

  return (
    <div>
      <div className="page-head" style={{ textAlign: 'left', maxWidth: 760, margin: '0 auto' }}><h1>{page.title}</h1></div>
      <div className={`rte${page.template === 'policy' ? ' rte--policy' : ' rte--center'}`} dangerouslySetInnerHTML={{ __html: page.content }} />
    </div>
  );
}
