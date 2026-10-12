'use client';

import Link, { useI18n } from '@/components/shop/I18n';
import { useCart } from '@/components/shop/CartProvider';
import { CartLines, FreeShipping } from '@/components/shop/CartDrawer';

export default function CartPageClient() {
  const { lines, subtotal, fmt, ready, shop } = useCart();
  const { t } = useI18n();
  if (!ready) return <div className="cart-page" />;
  if (!lines.length) {
    return (
      <div className="empty-state" style={{ padding: '120px 16px' }}>
        <h1>{t('cartEmpty')}</h1>
        <p>{t('cartEmptyText')}</p>
        <Link href="/collections/all" className="btn">{t('continueShopping')}</Link>
      </div>
    );
  }
  const shipping = subtotal >= shop.freeShippingThreshold ? 0 : shop.shippingFee;
  return (
    <div className="cart-page">
      <h1>{t('cart')}</h1>
      <div className="cart-layout">
        <div><CartLines /></div>
        <aside className="summary-box">
          <h2>{t('summary')}</h2>
          <FreeShipping subtotal={subtotal} />
          <div className="cart-totals" style={{ marginTop: 16 }}>
            <div><span>{t('subtotal')}</span><span>{fmt(subtotal)}</span></div>
            <div><span>{t('shipping')}</span><span>{shipping ? fmt(shipping) : t('free')}</span></div>
            <div className="grand"><span>{t('estimatedTotal')}</span><span>{fmt(subtotal + shipping)}</span></div>
          </div>
          <Link href="/checkout" className="btn btn--block">{t('goCheckout')}</Link>
          <p className="cart-note">{t('promoNextStep')}</p>
        </aside>
      </div>
    </div>
  );
}
