import Link from 'next/link';
import type { Prisma } from '@prisma/client';
import Icon from '@/components/Icon';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import { money } from '@/lib/format';
import RowActions from '@/components/admin/RowActions';
import { deleteProduct, quickStock } from '../../actions';

export const metadata = { title: 'Produits' };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string; status?: string; stock?: string }> }) {
  const sp = await searchParams;
  const s = await getSettings();
  const where: Prisma.ProductWhereInput = {};
  if (sp.q) where.OR = [{ title: { contains: sp.q, mode: 'insensitive' } }, { slug: { contains: sp.q, mode: 'insensitive' } }, { variants: { some: { sku: { contains: sp.q, mode: 'insensitive' } } } }];
  if (sp.cat) where.categories = { some: { slug: sp.cat } };
  if (sp.status) where.status = sp.status;
  if (sp.stock === 'low') where.variants = { some: { trackStock: true, stock: { lte: s.shop.lowStockThreshold } } };
  const [products, cats] = await Promise.all([
    db.product.findMany({ where, include: { images: { orderBy: { position: 'asc' }, take: 1 }, variants: { orderBy: { position: 'asc' } }, categories: true }, orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] }),
    db.category.findMany({ orderBy: { sortOrder: 'asc' } }),
  ]);

  return (
    <>
      <div className="page-title">
        <div><h1>Produits</h1><p>{products.length} produit(s)</p></div>
        <div className="actions"><Link href="/admin/products/new" className="btn"><Icon name="plus" /> Ajouter un produit</Link></div>
      </div>
      <div className="card">
        <form className="toolbar">
          <input className="input" name="q" defaultValue={sp.q} placeholder="Nom, URL, SKU…" />
          <select className="input" name="cat" defaultValue={sp.cat || ''} style={{ maxWidth: 200 }}>
            <option value="">Toutes les catégories</option>
            {cats.map((c) => <option key={c.id} value={c.slug}>{c.title}</option>)}
          </select>
          <select className="input" name="status" defaultValue={sp.status || ''} style={{ maxWidth: 160 }}>
            <option value="">Tous les statuts</option><option value="active">Actif</option><option value="draft">Brouillon</option>
          </select>
          <label className="check"><input type="checkbox" name="stock" value="low" defaultChecked={sp.stock === 'low'} /> Stock faible</label>
          <button className="btn btn-secondary">Filtrer</button>
          {(sp.q || sp.cat || sp.status || sp.stock) && <Link href="/admin/products" className="btn btn-ghost">Réinitialiser</Link>}
        </form>
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th style={{ width: 60 }} /><th>Produit</th><th>Statut</th><th>Catégories</th><th>Variantes &amp; stock</th><th className="num">Prix</th><th className="actions-col">Actions</th></tr></thead>
            <tbody>
              {products.map((p) => {
                const prices = p.variants.map((v) => v.price);
                const min = Math.min(...prices), max = Math.max(...prices);
                return (
                  <tr key={p.id}>
                    <td>{p.images[0] ? <img className="thumb" src={p.images[0].url} alt="" /> : <div className="thumb" />}</td>
                    <td><Link className="row-link" href={`/admin/products/${p.id}`}>{p.title}</Link><div className="muted" style={{ fontSize: 12 }}>/{p.slug}</div></td>
                    <td>{p.status === 'active' ? <span className="pill green">Actif</span> : <span className="pill gray">Brouillon</span>}</td>
                    <td style={{ maxWidth: 220 }}>{p.categories.map((c) => c.title).join(', ') || <span className="muted">—</span>}</td>
                    <td>
                      <div style={{ display: 'grid', gap: 4 }}>
                        {p.variants.map((v) => (
                          <form key={v.id} action={quickStock} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <input type="hidden" name="variantId" value={v.id} />
                            <span style={{ minWidth: 64, fontSize: 12.5 }}>{v.title === 'Défaut' ? 'Stock' : v.title}</span>
                            <input className="input" name="stock" type="number" min={0} defaultValue={v.stock} style={{ width: 70, padding: '4px 8px', borderColor: v.trackStock && v.stock <= s.shop.lowStockThreshold ? '#E9A9A9' : undefined }} />
                            <button className="btn btn-ghost btn-sm" title="Mettre à jour le stock">OK</button>
                          </form>
                        ))}
                      </div>
                    </td>
                    <td className="num"><strong>{min === max ? money(min, s.shop) : `${money(min, s.shop)} – ${money(max, s.shop)}`}</strong></td>
                    <td><RowActions id={p.id} view={`/products/${p.slug}`} viewExternal edit={`/admin/products/${p.id}`} remove={deleteProduct} confirm={`Supprimer le produit « ${p.title} » ?`} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!products.length && <div className="empty">Aucun produit.</div>}
        </div>
      </div>
    </>
  );
}
