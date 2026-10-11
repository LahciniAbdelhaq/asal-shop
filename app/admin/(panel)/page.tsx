import Link from 'next/link';
import Icon from '@/components/Icon';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import { frDateTime, money } from '@/lib/format';
import { ORDER_STATUSES } from '@/lib/defaults';
import { OrdersChart, RevenueChart } from '@/components/admin/Charts';
import { StatusPill } from '@/components/admin/StatusPill';

export const metadata = { title: 'Tableau de bord' };

const PERIODS = [
  { v: 7, l: '7 jours' },
  { v: 30, l: '30 jours' },
  { v: 90, l: '90 jours' },
  { v: 365, l: '12 mois' },
];

function Delta({ now, prev }: { now: number; prev: number }) {
  if (!prev) return <div className="delta flat">{now ? 'Nouveau sur la période' : '—'}</div>;
  const d = ((now - prev) / prev) * 100;
  const cls = Math.abs(d) < 0.5 ? 'flat' : d > 0 ? 'up' : 'down';
  return <div className={`delta ${cls}`}>{d > 0 ? '▲' : d < 0 ? '▼' : ''} {Math.abs(d).toFixed(0)} % vs période précédente</div>;
}

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const want = (await searchParams).p;
  const days = PERIODS.find((p) => String(p.v) === want)?.v || 30;
  const s = await getSettings();
  const m = (n: number) => money(n, s.shop);
  const now = new Date();
  const start = new Date(now); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - (days - 1));
  const prevStart = new Date(start); prevStart.setDate(prevStart.getDate() - days);

  const [orders, prevOrders, newCustomers, prevCustomers, statusGroups, recent, lowStock, unread, pendingReviews] = await Promise.all([
    db.order.findMany({ where: { createdAt: { gte: start } }, include: { items: true } }),
    db.order.findMany({ where: { createdAt: { gte: prevStart, lt: start }, status: { not: 'cancelled' } }, select: { total: true } }),
    db.customer.count({ where: { createdAt: { gte: start } } }),
    db.customer.count({ where: { createdAt: { gte: prevStart, lt: start } } }),
    db.order.groupBy({ by: ['status'], _count: true, where: { createdAt: { gte: start } } }),
    db.order.findMany({ orderBy: { createdAt: 'desc' }, take: 7 }),
    db.variant.findMany({ where: { trackStock: true, stock: { lte: s.shop.lowStockThreshold }, product: { status: 'active' } }, include: { product: true }, orderBy: { stock: 'asc' }, take: 8 }),
    db.message.findMany({ where: { isRead: false, archived: false }, orderBy: { createdAt: 'desc' }, take: 4 }),
    db.review.count({ where: { approved: false } }),
  ]);

  const valid = orders.filter((o) => o.status !== 'cancelled');
  const revenue = valid.reduce((t, o) => t + o.total, 0);
  const prevRevenue = prevOrders.reduce((t, o) => t + o.total, 0);
  const aov = valid.length ? revenue / valid.length : 0;
  const prevAov = prevOrders.length ? prevRevenue / prevOrders.length : 0;

  // série quotidienne (ou mensuelle sur 12 mois)
  const monthly = days > 90;
  const buckets = new Map<string, { day: string; label: string; revenue: number; orders: number }>();
  for (let i = 0; i < (monthly ? 12 : days); i++) {
    const d = new Date(start);
    if (monthly) { d.setDate(1); d.setMonth(now.getMonth() - 11 + i); } else d.setDate(start.getDate() + i);
    const key = monthly ? d.toISOString().slice(0, 7) : d.toLocaleDateString('sv-SE');
    buckets.set(key, {
      day: monthly ? d.toLocaleDateString('fr-FR', { month: 'short' }) : d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      label: monthly ? d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }),
      revenue: 0, orders: 0,
    });
  }
  for (const o of valid) {
    const key = monthly ? o.createdAt.toISOString().slice(0, 7) : o.createdAt.toLocaleDateString('sv-SE');
    const b = buckets.get(key);
    if (b) { b.revenue += o.total; b.orders += 1; }
  }
  const series = [...buckets.values()];

  // meilleures ventes & villes
  const top = new Map<string, { title: string; qty: number; revenue: number }>();
  for (const o of valid) for (const i of o.items) {
    const k = i.title;
    const t = top.get(k) || { title: i.title, qty: 0, revenue: 0 };
    t.qty += i.quantity; t.revenue += i.price * i.quantity;
    top.set(k, t);
  }
  const topProducts = [...top.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 6);
  const cityMap = new Map<string, number>();
  for (const o of valid) cityMap.set(o.city || '—', (cityMap.get(o.city || '—') || 0) + o.total);
  const cities = [...cityMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const statusTotal = statusGroups.reduce((t, g) => t + g._count, 0);

  return (
    <>
      <div className="page-title">
        <div>
          <h1>Tableau de bord</h1>
          <p>Vue d’ensemble de la boutique sur les {PERIODS.find((p) => p.v === days)?.l}.</p>
        </div>
        <div className="tabs">
          {PERIODS.map((p) => <Link key={p.v} href={`/admin?p=${p.v}`} className={p.v === days ? 'on' : ''}>{p.l}</Link>)}
        </div>
      </div>

      <div className="kpis">
        <div className="card kpi"><div className="label"><Icon name="dashboard" /> Chiffre d’affaires</div><div className="value">{m(revenue)}</div><Delta now={revenue} prev={prevRevenue} /></div>
        <div className="card kpi"><div className="label"><Icon name="receipt" /> Commandes</div><div className="value">{valid.length}</div><Delta now={valid.length} prev={prevOrders.length} /></div>
        <div className="card kpi"><div className="label"><Icon name="bag" /> Panier moyen</div><div className="value">{m(aov)}</div><Delta now={aov} prev={prevAov} /></div>
        <div className="card kpi"><div className="label"><Icon name="users" /> Nouveaux clients</div><div className="value">{newCustomers}</div><Delta now={newCustomers} prev={prevCustomers} /></div>
      </div>

      <div className="grid-2">
        <div>
          <div className="card">
            <div className="card-head"><h2>Chiffre d’affaires {monthly ? 'par mois' : 'par jour'}</h2><span className="muted">{m(revenue)}</span></div>
            <div className="card-body"><RevenueChart data={series} currency={s.shop.currency} /></div>
          </div>
          <div className="card">
            <div className="card-head"><h2>Commandes {monthly ? 'par mois' : 'par jour'}</h2><span className="muted">{valid.length} commandes</span></div>
            <div className="card-body"><OrdersChart data={series} /></div>
          </div>
          <div className="card">
            <div className="card-head"><h2>Dernières commandes</h2><Link className="link" href="/admin/orders">Tout voir →</Link></div>
            <div className="table-wrap">
              <table className="tbl">
                <thead><tr><th>N°</th><th>Client</th><th>Date</th><th>Statut</th><th className="num">Total</th></tr></thead>
                <tbody>
                  {recent.map((o) => (
                    <tr key={o.id}>
                      <td><Link className="row-link" href={`/admin/orders/${o.id}`}>#{o.number}</Link></td>
                      <td>{o.firstName} {o.lastName}<div className="muted" style={{ fontSize: 12 }}>{o.city}</div></td>
                      <td className="muted">{frDateTime(o.createdAt)}</td>
                      <td><StatusPill status={o.status} /></td>
                      <td className="num"><strong>{m(o.total)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!recent.length && <div className="empty">Aucune commande pour le moment.</div>}
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <div className="card-head"><h2>Commandes par statut</h2></div>
            <div className="card-body bar-list">
              {Object.entries(ORDER_STATUSES).map(([k, v]) => {
                const n = statusGroups.find((g) => g.status === k)?._count || 0;
                return (
                  <Link key={k} href={`/admin/orders?status=${k}`} className="row" style={{ textDecoration: 'none' }}>
                    <span style={{ color: '#1F1A15' }}>{v.label}</span><strong>{n}</strong>
                    <div className="bar"><span style={{ width: `${statusTotal ? (n / statusTotal) * 100 : 0}%`, background: v.color }} /></div>
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="card">
            <div className="card-head"><h2>Meilleures ventes</h2></div>
            <div className="card-body bar-list">
              {topProducts.map((t) => (
                <div className="row" key={t.title}>
                  <span style={{ color: '#1F1A15' }}>{t.title} <span className="muted">· {t.qty} vendus</span></span><strong>{m(t.revenue)}</strong>
                  <div className="bar"><span style={{ width: `${(t.revenue / topProducts[0].revenue) * 100}%` }} /></div>
                </div>
              ))}
              {!topProducts.length && <div className="muted">Pas encore de ventes sur la période.</div>}
            </div>
          </div>
          <div className="card">
            <div className="card-head"><h2>Ventes par ville</h2></div>
            <div className="card-body bar-list">
              {cities.map(([c, v]) => (
                <div className="row" key={c}>
                  <span style={{ color: '#1F1A15' }}>{c}</span><strong>{m(v)}</strong>
                  <div className="bar"><span style={{ width: `${(v / cities[0][1]) * 100}%`, background: '#6B7F4E' }} /></div>
                </div>
              ))}
              {!cities.length && <div className="muted">—</div>}
            </div>
          </div>
          <div className="card">
            <div className="card-head"><h2>Stock faible</h2><Link className="link" href="/admin/products?stock=low">Voir</Link></div>
            <div className="card-body" style={{ paddingTop: 8, paddingBottom: 8 }}>
              {lowStock.map((v) => (
                <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--a-border)' }}>
                  <Link href={`/admin/products/${v.productId}`} className="row-link" style={{ textDecoration: 'none', color: '#1F1A15' }}>{v.product.title} <span className="muted">{v.title !== 'Défaut' ? v.title : ''}</span></Link>
                  <span className={`pill ${v.stock === 0 ? 'red' : 'amber'}`}>{v.stock === 0 ? 'Épuisé' : `${v.stock} restant${v.stock > 1 ? 's' : ''}`}</span>
                </div>
              ))}
              {!lowStock.length && <div className="muted" style={{ padding: '8px 0' }}>Tous les stocks sont suffisants.</div>}
            </div>
          </div>
          <div className="card">
            <div className="card-head"><h2>Messages non lus</h2><Link className="link" href="/admin/messages">Boîte de réception</Link></div>
            <div className="card-body" style={{ paddingTop: 8, paddingBottom: 8 }}>
              {unread.map((msg) => (
                <Link key={msg.id} href={`/admin/messages/${msg.id}`} style={{ display: 'block', padding: '8px 0', borderBottom: '1px solid var(--a-border)', textDecoration: 'none' }}>
                  <strong style={{ color: '#1F1A15' }}>{msg.name || msg.email}</strong>
                  <div className="muted" style={{ fontSize: 12.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{msg.body}</div>
                </Link>
              ))}
              {!unread.length && <div className="muted" style={{ padding: '8px 0' }}>Aucun nouveau message.</div>}
              {pendingReviews > 0 && <Link href="/admin/reviews" className="link" style={{ display: 'block', paddingTop: 10 }}>{pendingReviews} avis à modérer →</Link>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
