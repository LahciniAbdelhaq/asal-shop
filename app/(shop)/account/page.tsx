import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { getCustomer } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { frDate, money } from '@/lib/format';
import { ORDER_STATUSES } from '@/lib/defaults';
import { customerLogout } from '../actions';
import { AuthForms, ProfileForm } from './AccountForms';

export const metadata: Metadata = { title: 'Mon compte' };

export default async function AccountPage() {
  const c = await getCustomer();
  if (!c) return <AuthForms />;
  const [s, orders] = await Promise.all([
    getSettings(),
    db.order.findMany({ where: { OR: [{ customerId: c.id }, { email: c.email }] }, orderBy: { createdAt: 'desc' }, include: { items: true } }),
  ]);
  return (
    <div className="account-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 26 }}>
        <h1 style={{ fontSize: 38, margin: 0 }}>Bonjour {c.firstName || c.email}</h1>
        <form action={customerLogout}><button className="btn btn--ghost">Se déconnecter</button></form>
      </div>
      <div className="account-grid">
        <div>
          <h2 style={{ fontSize: 20, marginBottom: 14 }}>Mes commandes</h2>
          {orders.length ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="order-table">
                <thead><tr><th>Commande</th><th>Date</th><th>Articles</th><th>Statut</th><th>Total</th></tr></thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td><strong>#{o.number}</strong></td>
                      <td>{frDate(o.createdAt)}</td>
                      <td>{o.items.reduce((n, i) => n + i.quantity, 0)}</td>
                      <td><span className="status-pill" style={{ color: ORDER_STATUSES[o.status]?.color }}>{ORDER_STATUSES[o.status]?.label || o.status}</span></td>
                      <td>{money(o.total, s.shop)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Vous n’avez pas encore passé de commande.</p>
          )}
        </div>
        <aside className="summary-box">
          <h2>Mes informations</h2>
          <ProfileForm c={{ firstName: c.firstName, lastName: c.lastName, phone: c.phone, address: c.address, city: c.city, zip: c.zip, email: c.email }} />
        </aside>
      </div>
    </div>
  );
}
