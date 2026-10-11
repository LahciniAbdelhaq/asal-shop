import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Icon from '@/components/Icon';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import { money } from '@/lib/format';
import ClearCart from './ClearCart';

export const metadata: Metadata = { title: 'Merci pour votre commande' };

export default async function ThanksPage({ params, searchParams }: { params: Promise<{ number: string }>; searchParams: Promise<{ e?: string }> }) {
  const { number } = await params;
  const { e } = await searchParams;
  const order = await db.order.findUnique({ where: { number: Number(number) || 0 }, include: { items: true } });
  // la page n'est visible qu'avec l'e-mail de la commande
  if (!order || order.email !== (e || '').toLowerCase()) notFound();
  const s = await getSettings();
  const m = (n: number) => money(n, s.shop);
  return (
    <div className="thanks">
      <ClearCart />
      <div className="check"><Icon name="check" size={36} stroke={2} /></div>
      <h1>Merci {order.firstName} !</h1>
      <p>Votre commande <strong>n° {order.number}</strong> est bien enregistrée. Nous vous appelons au <strong>{order.phone}</strong> pour la confirmer.</p>
      <div className="summary-box">
        <h2>Récapitulatif</h2>
        {order.items.map((i) => (
          <div className="mini-line" key={i.id}>
            <div className="thumb">{i.image && <img src={i.image} alt="" />}<span className="badge">{i.quantity}</span></div>
            <div><div style={{ fontWeight: 600, fontSize: 14 }}>{i.title}</div><div className="cart-line__meta">{i.variantTitle}</div></div>
            <div className="cart-line__price">{m(i.price * i.quantity)}</div>
          </div>
        ))}
        <div className="cart-totals" style={{ marginTop: 14 }}>
          <div><span>Sous-total</span><span>{m(order.subtotal)}</span></div>
          {order.discount > 0 && <div><span>Réduction ({order.promoCode})</span><span>−{m(order.discount)}</span></div>}
          <div><span>Livraison</span><span>{order.shipping ? m(order.shipping) : 'Offerte'}</span></div>
          <div className="grand"><span>Total à payer à la livraison</span><span>{m(order.total)}</span></div>
        </div>
        <p className="cart-note" style={{ textAlign: 'left' }}>Livraison à : {order.firstName} {order.lastName}, {order.address}, {order.city}</p>
      </div>
      <Link href="/collections/all" className="btn" style={{ marginTop: 30 }}>Continuer vos achats</Link>
    </div>
  );
}
