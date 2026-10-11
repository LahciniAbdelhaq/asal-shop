import { db } from '@/lib/db';
import { getAdmin } from '@/lib/auth';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '@/lib/defaults';

const csv = (rows: (string | number)[][]) =>
  '﻿' + rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(';')).join('\r\n');

export async function GET(_: Request, { params }: { params: Promise<{ type: string }> }) {
  if (!(await getAdmin())) return new Response('Non autorisé', { status: 401 });
  const { type } = await params;
  let rows: (string | number)[][] = [];

  if (type === 'orders') {
    const orders = await db.order.findMany({ orderBy: { number: 'desc' }, include: { items: true } });
    rows = [['N°', 'Date', 'Client', 'E-mail', 'Téléphone', 'Ville', 'Adresse', 'Articles', 'Sous-total', 'Réduction', 'Livraison', 'Total', 'Code promo', 'Statut', 'Paiement']];
    for (const o of orders) {
      rows.push([o.number, o.createdAt.toISOString().slice(0, 16).replace('T', ' '), `${o.firstName} ${o.lastName}`, o.email, o.phone, o.city, o.address,
        o.items.map((i) => `${i.quantity}× ${i.title}${i.variantTitle ? ` (${i.variantTitle})` : ''}`).join(' | '),
        o.subtotal, o.discount, o.shipping, o.total, o.promoCode, ORDER_STATUSES[o.status]?.label || o.status, PAYMENT_STATUSES[o.paymentStatus] || o.paymentStatus]);
    }
  } else if (type === 'customers') {
    const list = await db.customer.findMany({ include: { orders: true }, orderBy: { createdAt: 'desc' } });
    rows = [['Prénom', 'Nom', 'E-mail', 'Téléphone', 'Ville', 'Adresse', 'Commandes', 'Total dépensé', 'Newsletter', 'Inscrit le']];
    for (const c of list) {
      const valid = c.orders.filter((o) => o.status !== 'cancelled');
      rows.push([c.firstName, c.lastName, c.email, c.phone, c.city, c.address, valid.length, valid.reduce((t, o) => t + o.total, 0), c.acceptsMarketing ? 'oui' : 'non', c.createdAt.toISOString().slice(0, 10)]);
    }
  } else if (type === 'subscribers') {
    const list = await db.subscriber.findMany({ orderBy: { createdAt: 'desc' } });
    rows = [['E-mail', 'Inscrit le'], ...list.map((s) => [s.email, s.createdAt.toISOString().slice(0, 10)])];
  } else if (type === 'messages') {
    const list = await db.message.findMany({ orderBy: { createdAt: 'desc' } });
    rows = [['Date', 'Nom', 'E-mail', 'Téléphone', 'Sujet', 'Message'], ...list.map((m) => [m.createdAt.toISOString().slice(0, 16).replace('T', ' '), m.name, m.email, m.phone, m.subject, m.body])];
  } else {
    return new Response('Export inconnu', { status: 404 });
  }

  return new Response(csv(rows), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="asal-${type}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
