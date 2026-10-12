import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { ConfirmButton } from '@/components/admin/ui';
import { LangTabs, TranslateForm } from '@/components/admin/Translate';
import { asLocale, parseI18n } from '@/lib/i18n';
import { deleteCategory } from '../../../actions';
import CategoryForm from './CategoryForm';

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string; lang?: string }> }) {
  const { id } = await params;
  const c = id === 'new' ? null : await db.category.findUnique({ where: { id: Number(id) }, include: { products: { select: { id: true } } } });
  if (id !== 'new' && !c) notFound();
  const sp = await searchParams;
  const lang = c ? asLocale(sp.lang) : 'fr';
  const tr = c ? parseI18n(c.i18n)[lang] || {} : {};
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
      {sp.created && <div className="alert ok">Catégorie créée.</div>}
      {c && <LangTabs current={lang} />}
      {c && lang !== 'fr' ? (
        <TranslateForm key={lang} entity="category" id={c.id} lang={lang} title="Catégorie"
          fields={[
            { key: 'title', label: 'Nom', type: 'text' },
            { key: 'description', label: 'Description', type: 'html' },
            { key: 'seoTitle', label: 'Titre SEO', type: 'text' },
            { key: 'seoDescription', label: 'Description SEO', type: 'textarea' },
          ]}
          initial={{ title: tr.title || c.title, description: tr.description || c.description, seoTitle: tr.seoTitle || c.seoTitle, seoDescription: tr.seoDescription || c.seoDescription }}
        />
      ) : <CategoryForm
        c={c ? { id: c.id, title: c.title, slug: c.slug, description: c.description, image: c.image, sortOrder: c.sortOrder, isActive: c.isActive, seoTitle: c.seoTitle, seoDescription: c.seoDescription, products: c.products.map((p) => p.id) } : null}
        products={products.map((p) => ({ id: p.id, slug: p.slug, title: p.title, image: p.images[0]?.url || '' }))}
      />}
    </>
  );
}
