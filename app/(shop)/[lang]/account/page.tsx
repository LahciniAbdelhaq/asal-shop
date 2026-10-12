import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { getCustomer } from '@/lib/auth';
import { getSettings, getT } from '@/lib/settings';
import { frDate, money } from '@/lib/format';
import { ORDER_STATUSES } from '@/lib/defaults';
import { asLocale } from '@/lib/i18n';
import type { DictKey } from '@/lib/dict';
import { customerLogout } from '../../actions';
import { AuthForms, ProfileForm } from './AccountForms';

type Params = Promise<{ lang: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  return { title: (await getT(asLocale((await params).lang)))('account') };
}

const statusKey = (s: string) => ('status' + s.charAt(0).toUpperCase() + s.slice(1)) as DictKey;

export default async function AccountPage({ params }: { params: Params }) {
  const lang = asLocale((await params).lang);
  const c = await getCustomer();
  if (!c) return <AuthForms />;
  const [s, t, orders] = await Promise.all([
    getSettings(lang),
    getT(lang),
    db.order.findMany({ where: { OR: [{ customerId: c.id }, { email: c.email }] }, orderBy: { createdAt: 'desc' }, include: { items: true } }),
  ]);
  return (
    <div className="account-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 26 }}>
        <h1 style={{ fontSize: 38, margin: 0 }}>{t('hello', { name: c.firstName || c.email })}</h1>
        <form action={customerLogout}><input type="hidden" name="lang" value={lang} /><button className="btn btn--ghost">{t('logout')}</button></form>
      </div>
      <div className="account-grid">
        <div>
          <h2 style={{ fontSize: 20, marginBottom: 14 }}>{t('myOrders')}</h2>
          {orders.length ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="order-table">
                <thead><tr><th>{t('order')}</th><th>{t('date')}</th><th>{t('items')}</th><th>{t('status')}</th><th>{t('total')}</th></tr></thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td><strong>#{o.number}</strong></td>
                      <td>{frDate(o.createdAt, undefined, lang)}</td>
                      <td>{o.items.reduce((n, i) => n + i.quantity, 0)}</td>
                      <td><span className="status-pill" style={{ color: ORDER_STATUSES[o.status]?.color }}>{ORDER_STATUSES[o.status] ? t(statusKey(o.status)) : o.status}</span></td>
                      <td>{money(o.total, s.shop)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>{t('noOrders')}</p>
          )}
        </div>
        <aside className="summary-box">
          <h2>{t('myInfo')}</h2>
          <ProfileForm c={{ firstName: c.firstName, lastName: c.lastName, phone: c.phone, address: c.address, city: c.city, zip: c.zip, email: c.email }} />
        </aside>
      </div>
    </div>
  );
}
