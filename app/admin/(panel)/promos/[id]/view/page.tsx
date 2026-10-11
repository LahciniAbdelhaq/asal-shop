import Link from 'next/link';
import { notFound } from 'next/navigation';
import Icon from '@/components/Icon';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import { frDate, frDateTime, money } from '@/lib/format';
import { StatusPill } from '@/components/admin/StatusPill';

export const metadata = { title: 'Détails du code promo' };

export default async function PromoDetails({ params }: { params: Promise<{ id: string }> }) {
  const p = await db.promoCode.findUnique({ where: { id: Number((await params).id) } });
  if (!p) notFound();
  const [s, orders] = await Promise.all([getSettings(), db.order.findMany({ where: { promoCode: p.code }, orderBy: { createdAt: 'desc' } })]);
  const m = (n: number) => money(n, s.shop);
  const valid = orders.filter((o) => o.status !== 'cancelled');
  const label = p.type === 'percent' ? `−${p.value} %` : p.type === 'fixed' ? `−${m(p.value)}` : 'Livraison offerte';
  return (
    <>
      <Link href="/admin/promos" className="back-link">← Codes promo</Link>
      <div className="page-title">
        <div>
          <h1 style={{ display: 'flex', gap: 10, alignItems: 'center', fontFamily: 'ui-monospace, monospace' }}>{p.code} {p.isActive ? <span className="pill green">Actif</span> : <span className="pill gray">Désactivé</span>}</h1>
          <p>{label} · créé le {frDate(p.createdAt)}</p>
        </div>
        <div className="actions"><Link className="btn" href={`/admin/promos/${p.id}`}><Icon name="edit" /> Modifier</Link></div>
      </div>
      <div className="stat-row">
        <div className="card"><div className="label">Utilisations</div><div className="value">{p.usedCount}{p.maxUses != null ? ` / ${p.maxUses}` : ''}</div></div>
        <div className="card"><div className="label">Ventes générées</div><div className="value">{m(valid.reduce((t, o) => t + o.total, 0))}</div></div>
        <div className="card"><div className="label">Réductions accordées</div><div className="value">{m(valid.reduce((t, o) => t + o.discount, 0))}</div></div>
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-head"><h2>Commandes avec ce code</h2></div>
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>N°</th><th>Client</th><th>Date</th><th>Statut</th><th className="num">Réduction</th><th className="num">Total</th></tr></thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td><Link className="row-link" href={`/admin/orders/${o.id}`}>#{o.number}</Link></td>
                    <td>{o.firstName} {o.lastName}</td>
                    <td className="muted">{frDateTime(o.createdAt)}</td>
                    <td><StatusPill status={o.status} /></td>
                    <td className="num">−{m(o.discount)}</td>
                    <td className="num"><strong>{m(o.total)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!orders.length && <div className="empty">Ce code n’a pas encore été utilisé.</div>}
          </div>
        </div>
        <div className="card">
          <div className="card-head"><h2>Conditions</h2></div>
          <div className="card-body">
            <dl className="kv">
              <dt>Réduction</dt><dd>{label}</dd>
              <dt>Minimum</dt><dd>{p.minSubtotal ? m(p.minSubtotal) : 'Aucun'}</dd>
              <dt>Limite</dt><dd>{p.maxUses != null ? `${p.maxUses} utilisations` : 'Illimitée'}</dd>
              <dt>Début</dt><dd>{p.startsAt ? frDateTime(p.startsAt) : 'Immédiat'}</dd>
              <dt>Fin</dt><dd>{p.endsAt ? frDateTime(p.endsAt) : 'Sans fin'}</dd>
            </dl>
          </div>
        </div>
      </div>
    </>
  );
}
