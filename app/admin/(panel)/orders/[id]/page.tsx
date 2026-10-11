import Link from 'next/link';
import { notFound } from 'next/navigation';
import Icon from '@/components/Icon';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import { frDateTime, money } from '@/lib/format';
import { ORDER_STATUSES } from '@/lib/defaults';
import { PaymentPill, StatusPill } from '@/components/admin/StatusPill';
import { ConfirmButton } from '@/components/admin/ui';
import { deleteOrder, setOrderStatus } from '../../../actions';
import OrderForm from './OrderForm';
import PrintButton from './PrintButton';

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const [s, o] = await Promise.all([getSettings(), db.order.findUnique({ where: { id }, include: { items: { include: { product: { select: { id: true } } } }, customer: { include: { _count: { select: { orders: true } } } } } })]);
  if (!o) notFound();
  const m = (n: number) => money(n, s.shop);
  const flow = ['pending', 'confirmed', 'shipped', 'delivered'];
  const next = flow[flow.indexOf(o.status) + 1];
  const wa = o.phone.replace(/\D/g, '').replace(/^0/, '212');

  return (
    <>
      <Link href="/admin/orders" className="back-link no-print">← Commandes</Link>
      <div className="page-title">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>Commande #{o.number} <StatusPill status={o.status} /> <PaymentPill status={o.paymentStatus} /></h1>
          <p>{frDateTime(o.createdAt)} · {s.brand.name}</p>
        </div>
        <div className="actions no-print">
          {next && (
            <form action={setOrderStatus}>
              <input type="hidden" name="id" value={o.id} /><input type="hidden" name="status" value={next} />
              <button className="btn"><Icon name="check" /> Marquer « {ORDER_STATUSES[next].label} »</button>
            </form>
          )}
          <PrintButton />
          {wa && <a className="btn btn-secondary" href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer"><Icon name="whatsapp" /> WhatsApp</a>}
        </div>
      </div>

      <div className="grid-2">
        <div>
          <div className="card">
            <div className="card-head"><h2>Articles</h2><span className="muted">{o.items.reduce((n, i) => n + i.quantity, 0)} article(s)</span></div>
            <div className="card-body" style={{ paddingTop: 4 }}>
              {o.items.map((i) => {
                let bundle: { items: { title: string; qty: number }[] } | null = null;
                try { bundle = i.meta ? JSON.parse(i.meta) : null; } catch { /* */ }
                return (
                  <div className="order-line" key={i.id}>
                    {i.image ? <img src={i.image} alt="" /> : <div />}
                    <div>
                      {i.product ? <Link className="link" href={`/admin/products/${i.product.id}`} style={{ color: '#1F1A15' }}>{i.title}</Link> : <strong style={{ color: '#1F1A15' }}>{i.title}</strong>}
                      {i.variantTitle && <div className="muted" style={{ fontSize: 12.5 }}>{i.variantTitle}</div>}
                      {bundle && <div className="muted" style={{ fontSize: 12.5 }}>{bundle.items.map((b) => `${b.qty}× ${b.title}`).join(', ')}</div>}
                    </div>
                    <span className="muted">{m(i.price)} × {i.quantity}</span>
                    <strong>{m(i.price * i.quantity)}</strong>
                  </div>
                );
              })}
              <div className="totals">
                <div><span>Sous-total</span><span>{m(o.subtotal)}</span></div>
                {o.discount > 0 && <div><span>Réduction {o.promoCode && <span className="pill plain amber">{o.promoCode}</span>}</span><span>−{m(o.discount)}</span></div>}
                <div><span>Livraison</span><span>{o.shipping ? m(o.shipping) : 'Offerte'}</span></div>
                <div className="grand"><span>Total ({o.paymentMethod === 'cod' ? 'paiement à la livraison' : o.paymentMethod})</span><span>{m(o.total)}</span></div>
              </div>
            </div>
          </div>
          {(o.giftMessage || o.note) && (
            <div className="card">
              <div className="card-head"><h2>Notes du client</h2></div>
              <div className="card-body">
                {o.giftMessage && <p style={{ marginTop: 0 }}><strong>Message carte cadeau :</strong><br />{o.giftMessage}</p>}
                {o.note && <p style={{ margin: 0 }}><strong>Note :</strong><br />{o.note}</p>}
              </div>
            </div>
          )}
          <div className="no-print"><OrderForm order={{ id: o.id, status: o.status, paymentStatus: o.paymentStatus, adminNote: o.adminNote, firstName: o.firstName, lastName: o.lastName, email: o.email, phone: o.phone, address: o.address, city: o.city, zip: o.zip }} /></div>
        </div>

        <div>
          <div className="card">
            <div className="card-head"><h2>Client</h2></div>
            <div className="card-body">
              <dl className="kv">
                <dt>Nom</dt><dd>{o.firstName} {o.lastName}</dd>
                <dt>E-mail</dt><dd><a className="link" href={`mailto:${o.email}`}>{o.email}</a></dd>
                <dt>Téléphone</dt><dd><a className="link" href={`tel:${o.phone}`}>{o.phone}</a></dd>
                <dt>Adresse</dt><dd>{o.address}<br />{o.zip} {o.city}<br />{o.country}</dd>
              </dl>
              {o.customer && <p style={{ marginBottom: 0 }}><Link className="link" href={`/admin/customers/${o.customer.id}`}>Fiche client · {o.customer._count.orders} commande(s) →</Link></p>}
            </div>
          </div>
          <div className="card no-print">
            <div className="card-head"><h2>Zone sensible</h2></div>
            <div className="card-body">
              <form action={deleteOrder}>
                <input type="hidden" name="id" value={o.id} />
                <ConfirmButton message={`Supprimer définitivement la commande #${o.number} ?`}>Supprimer la commande</ConfirmButton>
              </form>
              <p className="help muted" style={{ fontSize: 12, marginBottom: 0 }}>Pour garder l’historique, préférez le statut « Annulée » (le stock est alors restitué).</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
