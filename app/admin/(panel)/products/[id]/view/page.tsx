import Link from 'next/link';
import { notFound } from 'next/navigation';
import Icon from '@/components/Icon';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import { frDate, frDateTime, money } from '@/lib/format';
import { StatusPill } from '@/components/admin/StatusPill';

export const metadata = { title: 'Détails du produit' };

export default async function ProductDetails({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const [s, p] = await Promise.all([
    getSettings(),
    db.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { position: 'asc' } },
        variants: { orderBy: { position: 'asc' } },
        categories: true,
        reviews: { orderBy: { createdAt: 'desc' } },
        orderItems: { include: { order: true }, orderBy: { id: 'desc' } },
      },
    }),
  ]);
  if (!p) notFound();
  const m = (n: number) => money(n, s.shop);
  const sold = p.orderItems.filter((i) => i.order.status !== 'cancelled');
  const units = sold.reduce((t, i) => t + i.quantity, 0);
  const revenue = sold.reduce((t, i) => t + i.price * i.quantity, 0);
  const stock = p.variants.filter((v) => v.trackStock).reduce((t, v) => t + v.stock, 0);
  const rating = p.reviews.filter((r) => r.approved);
  const avg = rating.length ? rating.reduce((t, r) => t + r.rating, 0) / rating.length : 0;
  const recent = p.orderItems.slice(0, 8);

  return (
    <>
      <Link href="/admin/products" className="back-link">← Produits</Link>
      <div className="page-title">
        <div>
          <h1 style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {p.title} {p.status === 'active' ? <span className="pill green">Actif</span> : <span className="pill gray">Brouillon</span>}
          </h1>
          <p>/products/{p.slug} · créé le {frDate(p.createdAt)} · modifié le {frDateTime(p.updatedAt)}</p>
        </div>
        <div className="actions">
          <Link className="btn" href={`/admin/products/${p.id}`}><Icon name="edit" /> Modifier</Link>
        </div>
      </div>

      <div className="stat-row">
        <div className="card"><div className="label">Unités vendues</div><div className="value">{units}</div></div>
        <div className="card"><div className="label">Chiffre d’affaires</div><div className="value">{m(revenue)}</div></div>
        <div className="card"><div className="label">Stock total</div><div className="value">{stock}</div></div>
        <div className="card"><div className="label">Note moyenne</div><div className="value">{rating.length ? `${avg.toFixed(1)} / 5` : '—'}</div></div>
      </div>

      <div className="grid-2">
        <div>
          <div className="card">
            <div className="card-head"><h2>Variantes, prix &amp; stock</h2><span className="muted">{p.optionName || 'Produit simple'}</span></div>
            <div className="table-wrap">
              <table className="tbl">
                <thead><tr><th>Variante</th><th>SKU</th><th className="num">Prix</th><th className="num">Prix barré</th><th className="num">Stock</th></tr></thead>
                <tbody>
                  {p.variants.map((v) => (
                    <tr key={v.id}>
                      <td><strong style={{ color: '#1F1A15' }}>{v.title}</strong></td>
                      <td className="muted">{v.sku || '—'}</td>
                      <td className="num"><strong>{m(v.price)}</strong></td>
                      <td className="num muted">{v.compareAtPrice ? m(v.compareAtPrice) : '—'}</td>
                      <td className="num">
                        {!v.trackStock ? <span className="pill gray">Illimité</span>
                          : v.stock === 0 ? <span className="pill red">Épuisé</span>
                          : v.stock <= s.shop.lowStockThreshold ? <span className="pill amber">{v.stock}</span>
                          : <span className="pill green">{v.stock}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-head"><h2>Description</h2></div>
            <div className="card-body prose" dangerouslySetInnerHTML={{ __html: p.description || '<p class="muted">Aucune description.</p>' }} />
          </div>

          <div className="card">
            <div className="card-head"><h2>Dernières commandes</h2><span className="muted">{p.orderItems.length} ligne(s)</span></div>
            <div className="table-wrap">
              <table className="tbl">
                <thead><tr><th>Commande</th><th>Date</th><th>Variante</th><th className="num">Qté</th><th>Statut</th></tr></thead>
                <tbody>
                  {recent.map((i) => (
                    <tr key={i.id}>
                      <td><Link className="row-link" href={`/admin/orders/${i.orderId}`}>#{i.order.number}</Link></td>
                      <td className="muted">{frDateTime(i.order.createdAt)}</td>
                      <td>{i.variantTitle || '—'}</td>
                      <td className="num">{i.quantity}</td>
                      <td><StatusPill status={i.order.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!recent.length && <div className="empty">Ce produit n’a pas encore été commandé.</div>}
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <div className="card-head"><h2>Images</h2><span className="muted">{p.images.length}</span></div>
            <div className="card-body">
              {p.images.length ? (
                <div className="detail-media">{p.images.map((im) => <img key={im.id} src={im.url} alt={im.alt} />)}</div>
              ) : <span className="muted">Aucune image.</span>}
            </div>
          </div>
          <div className="card">
            <div className="card-head"><h2>Informations</h2></div>
            <div className="card-body">
              <dl className="kv">
                <dt>Catégories</dt><dd>{p.categories.length ? p.categories.map((c) => <Link key={c.id} className="link" href={`/admin/categories/${c.id}/view`} style={{ marginRight: 8 }}>{c.title}</Link>) : '—'}</dd>
                <dt>Type</dt><dd>{p.productType || '—'}</dd>
                <dt>Marque</dt><dd>{p.vendor || '—'}</dd>
                <dt>Sous-titre</dt><dd>{p.subtitle || '—'}</dd>
                <dt>Pastille</dt><dd>{p.badge || '—'}</dd>
                <dt>Mis en avant</dt><dd>{p.featured ? 'Oui' : 'Non'}</dd>
                <dt>Ordre</dt><dd>{p.sortOrder}</dd>
              </dl>
            </div>
          </div>
          <div className="card">
            <div className="card-head"><h2>Référencement</h2></div>
            <div className="card-body">
              <dl className="kv">
                <dt>Titre SEO</dt><dd>{p.seoTitle || <span className="muted">(titre du produit)</span>}</dd>
                <dt>Description</dt><dd>{p.seoDescription || <span className="muted">(extrait de la description)</span>}</dd>
              </dl>
            </div>
          </div>
          <div className="card">
            <div className="card-head"><h2>Avis</h2><Link className="link" href="/admin/reviews?tab=all">Gérer</Link></div>
            <div className="card-body" style={{ display: 'grid', gap: 10 }}>
              {p.reviews.slice(0, 5).map((r) => (
                <div key={r.id}>
                  <span style={{ color: '#C8861A' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span> <strong style={{ color: '#1F1A15' }}>{r.name}</strong>
                  {!r.approved && <span className="pill amber" style={{ marginLeft: 6 }}>À modérer</span>}
                  <div className="muted" style={{ fontSize: 13 }}>{r.comment}</div>
                </div>
              ))}
              {!p.reviews.length && <span className="muted">Aucun avis.</span>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
