import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { ConfirmButton } from '@/components/admin/ui';
import { deleteCategory } from '../../../actions';
import CategoryForm from './CategoryForm';

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const { id } = await params;
  const c = id === 'new' ? null : await db.category.findUnique({ where: { id: Number(id) }, include: { products: { select: { id: true } } } });
  if (id !== 'new' && !c) notFound();
  const products = await db.product.findMany({ orderBy: { sortOrder: 'asc' }, select: { id: true, slug: true, title: true, images: { take: 1, orderBy: { position: 'asc' } } } });
  return (
    <>
      <Link href="/admin/categories" className="back-link">← Catégories</Link>
      <div className="page-title">
        <h1>{c ? c.title : 'Nouvelle catégorie'}</h1>
        {c && (
          <div className="actions">
            <form action={deleteCategory}><input type="hidden" name="id" value={c.id} /><ConfirmButton className="btn btn-danger" message={`Supprimer la catégorie « ${c.title} » ? Les produits ne seront pas supprimés.`}>Supprimer</ConfirmButton></form>
          </div>
        )}
      </div>
      {(await searchParams).created && <div className="alert ok">Catégorie créée.</div>}
      <CategoryForm
        c={c ? { id: c.id, title: c.title, slug: c.slug, description: c.description, image: c.image, sortOrder: c.sortOrder, isActive: c.isActive, seoTitle: c.seoTitle, seoDescription: c.seoDescription, products: c.products.map((p) => p.id) } : null}
        products={products.map((p) => ({ id: p.id, slug: p.slug, title: p.title, image: p.images[0]?.url || '' }))}
      />
    </>
  );
}
