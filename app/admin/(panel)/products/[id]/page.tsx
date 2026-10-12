import Link from 'next/link';
import { notFound } from 'next/navigation';
import Icon from '@/components/Icon';
import { db } from '@/lib/db';
import ProductForm, { type ProductData } from '@/components/admin/ProductForm';
import { ConfirmButton } from '@/components/admin/ui';
import { LangTabs, TranslateForm } from '@/components/admin/Translate';
import { asLocale, parseI18n } from '@/lib/i18n';
import { deleteProduct, duplicateProduct } from '../../../actions';

export default async function ProductEditPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string; lang?: string }> }) {
  const { id } = await params;
  const isNew = id === 'new';
  const [p, categories, typeRows] = await Promise.all([
    isNew ? null : db.product.findUnique({ where: { id: Number(id) }, include: { images: { orderBy: { position: 'asc' } }, variants: { orderBy: { position: 'asc' } }, categories: true } }),
    db.category.findMany({ orderBy: { sortOrder: 'asc' }, select: { id: true, title: true } }),
    db.product.findMany({ distinct: ['productType'], select: { productType: true } }),
  ]);
  if (!isNew && !p) notFound();
  const sp = await searchParams;
  const created = sp.created;
  const lang = p ? asLocale(sp.lang) : 'fr';

  const data: ProductData = p
    ? {
        id: p.id, title: p.title, slug: p.slug, subtitle: p.subtitle, description: p.description, productType: p.productType, vendor: p.vendor,
        status: p.status, badge: p.badge, optionName: p.optionName, featured: p.featured, sortOrder: p.sortOrder, seoTitle: p.seoTitle, seoDescription: p.seoDescription,
        images: p.images.map((i) => ({ url: i.url, alt: i.alt })),
        variants: p.variants.map((v) => ({ id: v.id, title: v.title, sku: v.sku, price: v.price, compareAtPrice: v.compareAtPrice, stock: v.stock, trackStock: v.trackStock, image: v.image })),
        categories: p.categories.map((c) => c.id),
      }
    : { title: '', slug: '', subtitle: '', description: '', productType: '', vendor: 'ASAL', status: 'active', badge: '', optionName: '', featured: false, sortOrder: 0, seoTitle: '', seoDescription: '', images: [], variants: [], categories: [] };

  return (
    <>
      <Link href="/admin/products" className="back-link">← Produits</Link>
      <div className="page-title">
        <h1>{p ? p.title : 'Nouveau produit'}</h1>
        {p && (
          <div className="actions">
            <a className="btn btn-secondary" href={`/products/${p.slug}`} target="_blank" rel="noreferrer"><Icon name="eye" /> Voir</a>
            <form action={duplicateProduct}><input type="hidden" name="id" value={p.id} /><button className="btn btn-secondary"><Icon name="copy" /> Dupliquer</button></form>
            <form action={deleteProduct}><input type="hidden" name="id" value={p.id} /><ConfirmButton message={`Supprimer « ${p.title} » ?`} className="btn btn-danger"><Icon name="trash" /> Supprimer</ConfirmButton></form>
          </div>
        )}
      </div>
      {created && <div className="alert ok">Produit créé.</div>}
      {p && <LangTabs current={lang} note={lang === 'fr' ? undefined : 'Prix, stock, images et catégories se modifient dans l’onglet Français.'} />}
      {p && lang !== 'fr' ? (() => {
        const tr = parseI18n(p.i18n)[lang] || {};
        const val = (k: 'title' | 'description' | 'optionName' | 'badge' | 'seoTitle' | 'seoDescription') => (typeof tr[k] === 'string' && tr[k] ? tr[k] : p[k]) as string;
        return (
          <TranslateForm key={lang} entity="product" id={p.id} lang={lang} title="Fiche produit"
            fields={[
              { key: 'title', label: 'Titre', type: 'text' },
              { key: 'description', label: 'Description', type: 'html' },
              { key: 'optionName', label: 'Nom de l’option (ex. « Poids »)', type: 'text' },
              { key: 'badge', label: 'Pastille', type: 'text' },
              { key: 'variants', label: 'Libellés des variantes', type: 'list', itemLabel: 'fr', fields: [{ key: 'title', label: 'Libellé traduit', type: 'text' }] },
              { key: 'seoTitle', label: 'Titre SEO', type: 'text' },
              { key: 'seoDescription', label: 'Description SEO', type: 'textarea' },
            ]}
            initial={{
              title: val('title'), description: val('description'), optionName: val('optionName'), badge: val('badge'), seoTitle: val('seoTitle'), seoDescription: val('seoDescription'),
              variants: p.variants.map((v) => ({ id: v.id, fr: v.title, title: tr.variants?.[v.id] || v.title })),
            }}
          />
        );
      })() : <ProductForm key={p ? p.variants.map((v) => v.id).join('-') + ':' + p.images.length : 'new'} p={data} categories={categories} types={typeRows.map((t) => t.productType).filter(Boolean)} />}
    </>
  );
}
