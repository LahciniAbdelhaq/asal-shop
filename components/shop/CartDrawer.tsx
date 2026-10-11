'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import Icon from '@/components/Icon';
import { useCart } from './CartProvider';
import { small } from '@/lib/img';

export function FreeShipping({ subtotal }: { subtotal: number }) {
  const { shop, fmt } = useCart();
  if (!shop.freeShippingThreshold) return null;
  const left = shop.freeShippingThreshold - subtotal;
  const pct = Math.min(100, (subtotal / shop.freeShippingThreshold) * 100);
  return (
    <div className="free-ship">
      {left > 0 ? (
        <>Plus que <strong>{fmt(left)}</strong> pour profiter de la livraison gratuite</>
      ) : (
        <><strong>Bravo !</strong> La livraison est offerte.</>
      )}
      <div className="free-ship__bar"><span style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

export function CartLines({ compact = false }: { compact?: boolean }) {
  const { lines, setQty, remove, fmt } = useCart();
  return (
    <div>
      {lines.map((l) => (
        <div className="cart-line" key={l.key}>
          {l.image ? <img src={small(l.image)} alt="" loading="lazy" decoding="async" /> : <div style={{ width: 76, height: 76, background: '#F6EFE2', borderRadius: 10 }} />}
          <div>
            <Link className="cart-line__title" href={l.slug ? `/products/${l.slug}` : '/pages/composez-votre-coffret'}>{l.title}</Link>
            {l.variantTitle && <div className="cart-line__meta">{l.variantTitle}</div>}
            {l.bundle && (
              <div className="cart-line__meta">{l.bundle.items.map((i) => `${i.qty}× ${i.title}`).join(', ')}</div>
            )}
            {!compact && <div className="cart-line__meta">{fmt(l.price)}</div>}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div className="qty qty--sm">
                <button type="button" aria-label="Diminuer" onClick={() => setQty(l.key, l.qty - 1)}><Icon name="minus" size={14} /></button>
                <span>{l.qty}</span>
                <button type="button" aria-label="Augmenter" onClick={() => setQty(l.key, l.qty + 1)}><Icon name="plus" size={14} /></button>
              </div>
              <button type="button" className="line-remove" onClick={() => remove(l.key)} style={{ marginTop: 10 }}>Retirer</button>
            </div>
          </div>
          <div className="cart-line__price">{fmt(l.price * l.qty)}</div>
        </div>
      ))}
    </div>
  );
}

export default function CartDrawer() {
  const { drawerOpen, closeDrawer, lines, subtotal, fmt } = useCart();

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeDrawer();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [drawerOpen, closeDrawer]);

  return (
    <>
      <div className={`drawer-backdrop${drawerOpen ? ' open' : ''}`} onClick={closeDrawer} />
      <aside className={`drawer drawer--right${drawerOpen ? ' open' : ''}`} aria-label="Panier" aria-hidden={!drawerOpen}>
        <div className="drawer-head">
          <h2>Panier{lines.length ? ` (${lines.reduce((n, l) => n + l.qty, 0)})` : ''}</h2>
          <button className="drawer-close" onClick={closeDrawer} aria-label="Fermer"><Icon name="close" size={18} /></button>
        </div>
        {lines.length === 0 ? (
          <div className="drawer-body">
            <div className="cart-empty">
              <h3>Votre panier est vide</h3>
              <p>Vous possédez un compte ? <Link href="/account" onClick={closeDrawer} className="link-amber">Connectez-vous</Link> pour payer plus vite.</p>
              <Link href="/collections/all" className="btn" onClick={closeDrawer}>Continuer vos achats</Link>
            </div>
          </div>
        ) : (
          <>
            <div className="drawer-body">
              <FreeShipping subtotal={subtotal} />
              <CartLines compact />
            </div>
            <div className="drawer-foot">
              <div className="cart-totals">
                <div className="grand"><span>Sous-total</span><span>{fmt(subtotal)}</span></div>
              </div>
              <Link href="/checkout" className="btn btn--block" onClick={closeDrawer}>Passer la commande</Link>
              <Link href="/cart" className="btn btn--ghost btn--block" style={{ marginTop: 10 }} onClick={closeDrawer}>Voir le panier</Link>
              <p className="cart-note">Paiement à la livraison · Livraison partout au Maroc</p>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
