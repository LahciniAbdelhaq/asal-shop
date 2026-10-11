'use client';

import Link from 'next/link';
import { useCart } from '@/components/shop/CartProvider';
import { CartLines, FreeShipping } from '@/components/shop/CartDrawer';

export default function CartPageClient() {
  const { lines, subtotal, fmt, ready, shop } = useCart();
  if (!ready) return <div className="cart-page" />;
  if (!lines.length) {
    return (
      <div className="empty-state" style={{ padding: '120px 16px' }}>
        <h1>Votre panier est vide</h1>
        <p>Découvrez nos miels d’exception et nos coffrets cadeaux.</p>
        <Link href="/collections/all" className="btn">Continuer vos achats</Link>
      </div>
    );
  }
  const shipping = subtotal >= shop.freeShippingThreshold ? 0 : shop.shippingFee;
  return (
    <div className="cart-page">
      <h1>Panier</h1>
      <div className="cart-layout">
        <div><CartLines /></div>
        <aside className="summary-box">
          <h2>Récapitulatif</h2>
          <FreeShipping subtotal={subtotal} />
          <div className="cart-totals" style={{ marginTop: 16 }}>
            <div><span>Sous-total</span><span>{fmt(subtotal)}</span></div>
            <div><span>Livraison</span><span>{shipping ? fmt(shipping) : 'Offerte'}</span></div>
            <div className="grand"><span>Total estimé</span><span>{fmt(subtotal + shipping)}</span></div>
          </div>
          <Link href="/checkout" className="btn btn--block">Passer la commande</Link>
          <p className="cart-note">Codes promo applicables à l’étape suivante.</p>
        </aside>
      </div>
    </div>
  );
}
