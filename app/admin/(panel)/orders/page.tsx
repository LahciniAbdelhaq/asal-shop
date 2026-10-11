import Link from 'next/link';
import type { Prisma } from '@prisma/client';
import Icon from '@/components/Icon';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import { frDateTime, money } from '@/lib/format';
import { ORDER_STATUSES } from '@/lib/defaults';
import { PaymentPill, StatusPill } from '@/components/admin/StatusPill';
import RowActions from '@/components/admin/RowActions';
import { deleteOrder } from '../../actions';

export const metadata = { title: 'Commandes' };
const PER = 25;

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; page?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const where: Prisma.OrderWhereInput = {};
  if (sp.status && ORDER_STATUSES[sp.status]) where.status = sp.status;
  if (sp.q) {
    const n = Number(sp.q.replace('#', ''));
    where.OR = [
      { email: { contains: sp.q, mode: 'insensitive' } }, { phone: { contains: sp.q, mode: 'insensitive' } }, { firstName: { contains: sp.q, mode: 'insensitive' } }, { lastName: { contains: sp.q, mode: 'insensitive' } }, { city: { contains: sp.q, mode: 'insensitive' } },
      ...(n ? [{ number: n }] : []),
    ];
  }
  const [s, total, orders, counts] = await Promise.all([
    getSettings(),
    db.order.count({ where }),
    db.order.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * PER, take: PER, include: { items: true } }),
    db.order.groupBy({ by: ['status'], _count: true }),
  ]);
  const all = counts.reduce((t, c) => t + c._count, 0);
  const qs = (p: Record<string, string | undefined>) => {
    const q = new URLSearchParams(Object.entries({ ...sp, ...p }).filter(([, v]) => v) as [string, string][]);
    return `/admin/orders${q.size ? `?${q}` : ''}`;
  };
  const pages = Math.ceil(total / PER);

  return (
    <>
      <div className="page-title">
        <div><h1>Commandes</h1><p>{all} commandes au total</p></div>
        <div className="actions"><a className="btn btn-secondary" href="/api/admin/export/orders"><Icon name="download" /> Exporter (CSV)</a></div>
      </div>
      <div className="card">
        <div className="toolbar">
          <div className="tabs">
            <Link href={qs({ status: undefined, page: undefined })} className={!sp.status ? 'on' : ''}>Toutes ({all})</Link>
            {Object.entries(ORDER_STATUSES).map(([k, v]) => (
              <Link key={k} href={qs({ status: k, page: undefined })} className={sp.status === k ? 'on' : ''}>{v.label} ({counts.find((c) => c.status === k)?._count || 0})</Link>
            ))}
          </div>
          <form style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            {sp.status && <input type="hidden" name="status" value={sp.status} />}
            <input className="input" name="q" defaultValue={sp.q} placeholder="N°, nom, e-mail, téléphone, ville…" />
            <button className="btn btn-secondary">Rechercher</button>
          </form>
        </div>
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>N°</th><th>Date</th><th>Client</th><th>Ville</th><th>Articles</th><th>Paiement</th><th>Statut</th><th className="num">Total</th><th className="actions-col">Actions</th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td><Link className="row-link" href={`/admin/orders/${o.id}`}>#{o.number}</Link></td>
                  <td className="muted">{frDateTime(o.createdAt)}</td>
                  <td>{o.firstName} {o.lastName}<div className="muted" style={{ fontSize: 12 }}>{o.phone}</div></td>
                  <td>{o.city}</td>
                  <td>{o.items.reduce((n, i) => n + i.quantity, 0)}</td>
                  <td><PaymentPill status={o.paymentStatus} /></td>
                  <td><StatusPill status={o.status} /></td>
                  <td className="num"><strong>{money(o.total, s.shop)}</strong></td>
                  <td><RowActions id={o.id} view={`/admin/orders/${o.id}`} edit={`/admin/orders/${o.id}#traitement`} remove={deleteOrder} confirm={`Supprimer définitivement la commande #${o.number} ? (préférez le statut « Annulée » pour garder l’historique)`} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!orders.length && <div className="empty">Aucune commande trouvée.</div>}
        </div>
        {pages > 1 && (
          <div className="pager">
            <span>Page {page} / {pages} · {total} résultats</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {page > 1 && <Link className="btn btn-secondary btn-sm" href={qs({ page: String(page - 1) })}>← Précédent</Link>}
              {page < pages && <Link className="btn btn-secondary btn-sm" href={qs({ page: String(page + 1) })}>Suivant →</Link>}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
