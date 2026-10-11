import Link from 'next/link';
import Icon from '@/components/Icon';
import { db } from '@/lib/db';
import RowActions from '@/components/admin/RowActions';
import { deleteCategory } from '../../actions';

export const metadata = { title: 'Catégories' };

export default async function CategoriesPage() {
  const cats = await db.category.findMany({ orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }], include: { _count: { select: { products: true } } } });
  return (
    <>
      <div className="page-title">
        <div><h1>Catégories</h1><p>Collections affichées sur la boutique (/collections/…)</p></div>
        <div className="actions"><Link href="/admin/categories/new" className="btn"><Icon name="plus" /> Nouvelle catégorie</Link></div>
      </div>
      <div className="card table-wrap">
        <table className="tbl">
          <thead><tr><th style={{ width: 60 }} /><th>Catégorie</th><th>URL</th><th>Produits</th><th>Ordre</th><th>Statut</th><th className="actions-col">Actions</th></tr></thead>
          <tbody>
            {cats.map((c) => (
              <tr key={c.id}>
                <td>{c.image ? <img className="thumb" src={c.image} alt="" /> : <div className="thumb" />}</td>
                <td><Link className="row-link" href={`/admin/categories/${c.id}`}>{c.title}</Link></td>
                <td className="muted">/collections/{c.slug}</td>
                <td>{c._count.products}</td>
                <td>{c.sortOrder}</td>
                <td>{c.isActive ? <span className="pill green">Visible</span> : <span className="pill gray">Masquée</span>}</td>
                <td><RowActions id={c.id} view={`/collections/${c.slug}`} viewExternal edit={`/admin/categories/${c.id}`} remove={deleteCategory} confirm={`Supprimer la catégorie « ${c.title} » ? Les produits ne seront pas supprimés.`} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!cats.length && <div className="empty">Aucune catégorie.</div>}
      </div>
    </>
  );
}
