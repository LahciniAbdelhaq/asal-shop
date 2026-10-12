import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import { stripHtml } from '@/lib/format';
import { inStock, localizeProduct, productInclude } from '@/lib/catalog';
import { asLocale, localize, type Locale } from '@/lib/i18n';
import ContactForm from '@/components/shop/ContactForm';
import Composer, { type ComposerItem } from '@/components/shop/Composer';
import { FaqList } from '@/components/shop/Sections';

type Params = Promise<{ lang: string; slug: string }>;

const getPage = async (slug: string, lang: Locale) => {
  const p = await db.page.findFirst({ where: { slug, isPublished: true } });
  return p ? localize(p, lang) : null;
};

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug, lang } = await params;
  const p = await getPage(slug, asLocale(lang));
  return p ? { title: p.seoTitle || p.title, description: p.seoDescription || stripHtml(p.content).slice(0, 160) || undefined } : {};
}

export async function generateStaticParams() {
  return (await db.page.findMany({ where: { isPublished: true, NOT: { template: 'policy' } }, select: { slug: true } })).map((p) => ({ slug: p.slug }));
}

export default async function CmsPage({ params }: { params: Params }) {
  const { slug, lang: l } = await params;
  const lang = asLocale(l);
  const page = await getPage(slug, lang);
  if (!page) notFound();
  const s = await getSettings(lang);

  if (page.template === 'composer') {
    const fr = await getSettings(); // formats et type de produit : valeurs d'origine (correspondance avec les variantes)
    const formats = fr.composer.formats.map((x) => String(x).trim()).filter(Boolean);
    const prods = (await db.product.findMany({
      where: { status: 'active', productType: fr.composer.productType },
      include: productInclude,
      orderBy: { sortOrder: 'asc' },
    })).map((p) => localizeProduct(p, lang));
    const items: ComposerItem[] = prods.map((p) => ({
      productId: p.id,
      slug: p.slug,
      title: p.title,
      image: p.images[0]?.url || '',
      variants: Object.fromEntries(
        p.variants.filter((v) => formats.includes(v.title)).map((v) => [v.title, { id: v.id, price: v.price, available: inStock(v), label: (v as { label?: string }).label }]),
      ),
    }));
    return (
      <Composer
        items={items}
        formats={formats}
        sizes={fr.composer.sizes.map(Number).filter((n) => n > 0)}
        boxPrice={Number(fr.composer.boxPrice) || 0}
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
      <div className="page-head" style={{ textAlign: 'start', maxWidth: 760, margin: '0 auto' }}><h1>{page.title}</h1></div>
      <div className={`rte${page.template === 'policy' ? ' rte--policy' : ' rte--center'}`} dangerouslySetInnerHTML={{ __html: page.content }} />
    </div>
  );
}
