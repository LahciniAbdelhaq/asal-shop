import Link from 'next/link';
import { db } from '@/lib/db';
import { frDate } from '@/lib/format';
import { moderateReview } from '../../actions';

export const metadata = { title: 'Avis clients' };

export default async function ReviewsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const tab = (await searchParams).tab || 'pending';
  const reviews = await db.review.findMany({ where: tab === 'all' ? {} : { approved: tab === 'approved' }, include: { product: true }, orderBy: { createdAt: 'desc' } });
  const Btn = ({ id, op, label, cls = 'btn btn-secondary btn-sm' }: { id: number; op: string; label: string; cls?: string }) => (
    <form action={moderateReview}><input type="hidden" name="id" value={id} /><input type="hidden" name="op" value={op} /><button className={cls}>{label}</button></form>
  );
  return (
    <>
      <div className="page-title"><div><h1>Avis clients</h1><p>Les avis ne sont publiés sur la fiche produit qu’après validation.</p></div></div>
      <div className="card">
        <div className="toolbar">
          <div className="tabs">
            <Link href="/admin/reviews" className={tab === 'pending' ? 'on' : ''}>À modérer</Link>
            <Link href="/admin/reviews?tab=approved" className={tab === 'approved' ? 'on' : ''}>Publiés</Link>
            <Link href="/admin/reviews?tab=all" className={tab === 'all' ? 'on' : ''}>Tous</Link>
          </div>
        </div>
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>Note</th><th>Avis</th><th>Produit</th><th>Date</th><th /></tr></thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id}>
                  <td style={{ color: '#C8861A', whiteSpace: 'nowrap', letterSpacing: 2 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</td>
                  <td style={{ maxWidth: 480 }}><strong style={{ color: '#1F1A15' }}>{r.name}</strong><div>{r.comment}</div></td>
                  <td><Link className="link" href={`/admin/products/${r.productId}`}>{r.product.title}</Link></td>
                  <td className="muted">{frDate(r.createdAt)}</td>
                  <td className="num">
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      {r.approved ? <Btn id={r.id} op="hide" label="Masquer" /> : <Btn id={r.id} op="approve" label="Publier" cls="btn btn-sm" />}
                      <Btn id={r.id} op="delete" label="Supprimer" cls="btn btn-danger btn-sm" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!reviews.length && <div className="empty">Aucun avis ici.</div>}
        </div>
      </div>
    </>
  );
}
