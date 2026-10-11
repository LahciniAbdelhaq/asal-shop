import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import { frDate, frDateTime, money } from '@/lib/format';
import { StatusPill } from '@/components/admin/StatusPill';
import { ConfirmButton } from '@/components/admin/ui';
import { deleteCustomer } from '../../../actions';
import CustomerForm from './CustomerForm';

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await getSettings();
  const c = id === 'new' ? null : await db.customer.findUnique({ where: { id: Number(id) }, include: { orders: { orderBy: { createdAt: 'desc' } } } });
  if (id !== 'new' && !c) notFound();
  const valid = c?.orders.filter((o) => o.status !== 'cancelled') || [];
  const spent = valid.reduce((t, o) => t + o.total, 0);
  const m = (n: number) => money(n, s.shop);

  return (
    <>
      <Link href="/admin/customers" className="back-link">← Clients</Link>
      <div className="page-title">
        <div>
          <h1>{c ? `${c.firstName} ${c.lastName}`.trim() || c.email : 'Nouveau client'}</h1>
          {c && <p>Client depuis le {frDate(c.createdAt)} · {c.passwordHash ? 'compte inscrit' : 'client invité'}</p>}
        </div>
        {c && (
          <div className="actions">
            <a className="btn btn-secondary" href={`mailto:${c.email}`}>Écrire un e-mail</a>
            <form action={deleteCustomer}><input type="hidden" name="id" value={c.id} /><ConfirmButton className="btn btn-danger" message="Supprimer ce client ? Ses commandes seront conservées.">Supprimer</ConfirmButton></form>
          </div>
        )}
      </div>
      {c && (
        <div className="kpis" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="card kpi"><div className="label">Commandes</div><div className="value">{valid.length}</div></div>
          <div className="card kpi"><div className="label">Total dépensé</div><div className="value">{m(spent)}</div></div>
          <div className="card kpi"><div className="label">Panier moyen</div><div className="value">{m(valid.length ? spent / valid.length : 0)}</div></div>
        </div>
      )}
      <div className="grid-2">
        <div>
          {c && (
            <div className="card">
              <div className="card-head"><h2>Commandes</h2></div>
              <div className="table-wrap">
                <table className="tbl">
                  <thead><tr><th>N°</th><th>Date</th><th>Statut</th><th className="num">Total</th></tr></thead>
                  <tbody>
                    {c.orders.map((o) => (
                      <tr key={o.id}>
                        <td><Link className="row-link" href={`/admin/orders/${o.id}`}>#{o.number}</Link></td>
                        <td className="muted">{frDateTime(o.createdAt)}</td>
                        <td><StatusPill status={o.status} /></td>
                        <td className="num"><strong>{m(o.total)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!c.orders.length && <div className="empty">Aucune commande.</div>}
              </div>
            </div>
          )}
        </div>
        <div>
          <CustomerForm c={c ? { id: c.id, email: c.email, firstName: c.firstName, lastName: c.lastName, phone: c.phone, address: c.address, city: c.city, zip: c.zip, country: c.country, notes: c.notes, acceptsMarketing: c.acceptsMarketing } : null} />
        </div>
      </div>
    </>
  );
}
