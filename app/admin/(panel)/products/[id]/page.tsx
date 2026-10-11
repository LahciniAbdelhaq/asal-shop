import Link from 'next/link';
import { notFound } from 'next/navigation';
import Icon from '@/components/Icon';
import { db } from '@/lib/db';
import ProductForm, { type ProductData } from '@/components/admin/ProductForm';
import { ConfirmButton } from '@/components/admin/ui';
import { deleteProduct, duplicateProduct } from '../../../actions';

export default async function ProductEditPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const { id } = await params;
  const isNew = id === 'new';
  const [p, categories, typeRows] = await Promise.all([
    isNew ? null : db.product.findUnique({ where: { id: Number(id) }, include: { images: { orderBy: { position: 'asc' } }, variants: { orderBy: { position: 'asc' } }, categories: true } }),
    db.category.findMany({ orderBy: { sortOrder: 'asc' }, select: { id: true, title: true } }),
    db.product.findMany({ distinct: ['productType'], select: { productType: true } }),
  ]);
  if (!isNew && !p) notFound();
  const created = (await searchParams).created;

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
      <ProductForm key={p ? p.variants.map((v) => v.id).join('-') + ':' + p.images.length : 'new'} p={data} categories={categories} types={typeRows.map((t) => t.productType).filter(Boolean)} />
    </>
  );
}
