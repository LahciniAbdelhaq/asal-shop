import Link from 'next/link';
import type { Prisma } from '@prisma/client';
import Icon from '@/components/Icon';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import { frDate, money } from '@/lib/format';
import RowActions from '@/components/admin/RowActions';
import { deleteCustomer } from '../../actions';

export const metadata = { title: 'Clients' };

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string; sort?: string }> }) {
  const sp = await searchParams;
  const where: Prisma.CustomerWhereInput = sp.q
    ? { OR: [{ email: { contains: sp.q, mode: 'insensitive' } }, { firstName: { contains: sp.q, mode: 'insensitive' } }, { lastName: { contains: sp.q, mode: 'insensitive' } }, { phone: { contains: sp.q, mode: 'insensitive' } }, { city: { contains: sp.q, mode: 'insensitive' } }] }
    : {};
  const [s, list] = await Promise.all([
    getSettings(),
    db.customer.findMany({ where, include: { orders: { select: { total: true, status: true, createdAt: true } } }, orderBy: { createdAt: 'desc' } }),
  ]);
  const rows = list.map((c) => {
    const valid = c.orders.filter((o) => o.status !== 'cancelled');
    return { ...c, count: valid.length, spent: valid.reduce((t, o) => t + o.total, 0), last: c.orders.map((o) => o.createdAt).sort((a, b) => +b - +a)[0] };
  });
  if (sp.sort === 'spent') rows.sort((a, b) => b.spent - a.spent);
  if (sp.sort === 'orders') rows.sort((a, b) => b.count - a.count);

  return (
    <>
      <div className="page-title">
        <div><h1>Clients</h1><p>{list.length} client(s)</p></div>
        <div className="actions">
          <a className="btn btn-secondary" href="/api/admin/export/customers"><Icon name="download" /> Exporter (CSV)</a>
          <Link className="btn" href="/admin/customers/new"><Icon name="plus" /> Ajouter</Link>
        </div>
      </div>
      <div className="card">
        <form className="toolbar">
          <input className="input" name="q" defaultValue={sp.q} placeholder="Nom, e-mail, téléphone, ville…" />
          <select className="input" name="sort" defaultValue={sp.sort || ''} style={{ maxWidth: 220 }}>
            <option value="">Plus récents</option><option value="spent">Meilleurs clients (montant)</option><option value="orders">Nombre de commandes</option>
          </select>
          <button className="btn btn-secondary">Appliquer</button>
        </form>
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>Client</th><th>Téléphone</th><th>Ville</th><th>Compte</th><th>Commandes</th><th>Dernière commande</th><th className="num">Total dépensé</th><th className="actions-col">Actions</th></tr></thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td><Link className="row-link" href={`/admin/customers/${c.id}`}>{c.firstName || c.lastName ? `${c.firstName} ${c.lastName}` : c.email}</Link><div className="muted" style={{ fontSize: 12 }}>{c.email}</div></td>
                  <td>{c.phone || <span className="muted">—</span>}</td>
                  <td>{c.city || <span className="muted">—</span>}</td>
                  <td>{c.passwordHash ? <span className="pill green">Inscrit</span> : <span className="pill gray">Invité</span>}{c.acceptsMarketing && <span className="pill plain amber" style={{ marginLeft: 4 }}>Newsletter</span>}</td>
                  <td>{c.count}</td>
                  <td className="muted">{c.last ? frDate(c.last) : '—'}</td>
                  <td className="num"><strong>{money(c.spent, s.shop)}</strong></td>
                  <td><RowActions id={c.id} view={`/admin/customers/${c.id}`} edit={`/admin/customers/${c.id}#coordonnees`} remove={deleteCustomer} confirm="Supprimer ce client ? Ses commandes seront conservées." /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && <div className="empty">Aucun client.</div>}
        </div>
      </div>
    </>
  );
}
