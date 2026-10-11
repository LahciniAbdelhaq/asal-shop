import Link from 'next/link';
import { notFound } from 'next/navigation';
import Icon from '@/components/Icon';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import { money } from '@/lib/format';

export const metadata = { title: 'Détails de la catégorie' };

export default async function CategoryDetails({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const [s, c] = await Promise.all([
    getSettings(),
    db.category.findUnique({
      where: { id },
      include: { products: { orderBy: { sortOrder: 'asc' }, include: { images: { take: 1, orderBy: { position: 'asc' } }, variants: true } } },
    }),
  ]);
  if (!c) notFound();
  const stock = (vs: { stock: number; trackStock: boolean }[]) => vs.filter((v) => v.trackStock).reduce((t, v) => t + v.stock, 0);

  return (
    <>
      <Link href="/admin/categories" className="back-link">← Catégories</Link>
      <div className="page-title">
        <div>
          <h1 style={{ display: 'flex', gap: 10, alignItems: 'center' }}>{c.title} {c.isActive ? <span className="pill green">Visible</span> : <span className="pill gray">Masquée</span>}</h1>
          <p>/collections/{c.slug} · ordre {c.sortOrder}</p>
        </div>
        <div className="actions"><Link className="btn" href={`/admin/categories/${c.id}`}><Icon name="edit" /> Modifier</Link></div>
      </div>
      <div className="grid-2">
        <div>
          <div className="card">
            <div className="card-head"><h2>Produits</h2><span className="muted">{c.products.length}</span></div>
            <div className="table-wrap">
              <table className="tbl">
                <thead><tr><th style={{ width: 60 }} /><th>Produit</th><th>Statut</th><th className="num">Prix</th><th className="num">Stock</th></tr></thead>
                <tbody>
                  {c.products.map((p) => {
                    const prices = p.variants.map((v) => v.price);
                    return (
                      <tr key={p.id}>
                        <td>{p.images[0] ? <img className="thumb" src={p.images[0].url} alt="" /> : <div className="thumb" />}</td>
                        <td><Link className="row-link" href={`/admin/products/${p.id}/view`}>{p.title}</Link></td>
                        <td>{p.status === 'active' ? <span className="pill green">Actif</span> : <span className="pill gray">Brouillon</span>}</td>
                        <td className="num">{prices.length ? money(Math.min(...prices), s.shop) : '—'}</td>
                        <td className="num">{stock(p.variants)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {!c.products.length && <div className="empty">Aucun produit dans cette catégorie.</div>}
            </div>
          </div>
        </div>
        <div>
          <div className="card">
            <div className="card-head"><h2>Image</h2></div>
            <div className="card-body">{c.image ? <img className="detail-hero" src={c.image} alt="" /> : <span className="muted">Aucune image.</span>}</div>
          </div>
          <div className="card">
            <div className="card-head"><h2>Description</h2></div>
            <div className="card-body prose" dangerouslySetInnerHTML={{ __html: c.description || '<p class="muted">Aucune description.</p>' }} />
          </div>
          <div className="card">
            <div className="card-head"><h2>Référencement</h2></div>
            <div className="card-body">
              <dl className="kv">
                <dt>Titre SEO</dt><dd>{c.seoTitle || <span className="muted">(nom de la catégorie)</span>}</dd>
                <dt>Description</dt><dd>{c.seoDescription || <span className="muted">—</span>}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
