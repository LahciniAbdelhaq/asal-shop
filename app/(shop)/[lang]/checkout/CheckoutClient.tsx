'use client';

import { useActionState, useCallback, useEffect, useState } from 'react';
import Link, { useI18n } from '@/components/shop/I18n';
import { useCart } from '@/components/shop/CartProvider';
import { placeOrder, quoteCart } from '../../actions';
import type { PricedCart } from '@/lib/cart-types';
import { small } from '@/lib/img';
import { rich } from '@/lib/rich';

type Customer = { email: string; phone: string; firstName: string; lastName: string; address: string; city: string; zip: string } | null;

export default function CheckoutClient({ customer, cities, cod }: { customer: Customer; cities: string[]; cod: { title: string; text: string } }) {
  const { lines, ready, fmt } = useCart();
  const { t, lang } = useI18n();
  const [state, action, pending] = useActionState(placeOrder, null);
  const [promo, setPromo] = useState('');
  const [applied, setApplied] = useState('');
  const [quote, setQuote] = useState<PricedCart | null>(null);

  const refresh = useCallback(async (code: string) => {
    if (!lines.length) return setQuote(null);
    setQuote(await quoteCart(lines, code, lang));
  }, [lines, lang]);

  useEffect(() => { if (ready) refresh(applied); }, [ready, applied, refresh]);

  if (!ready) return <div className="checkout" />;
  if (!lines.length) {
    return (
      <div className="empty-state" style={{ padding: '120px 16px' }}>
        <h1>{t('cartEmpty')}</h1>
        <Link href="/collections/all" className="btn">{t('continueShopping')}</Link>
      </div>
    );
  }

  const f = state?.fields || {};
  const v = (k: string) => f[k] ?? (customer as Record<string, string> | null)?.[k] ?? '';

  return (
    <form action={action} className="checkout">
      <input type="hidden" name="cart" value={JSON.stringify(lines)} />
      <input type="hidden" name="promo" value={applied} />
      <input type="hidden" name="lang" value={lang} />
      <div>
        <h1>{t('checkoutTitle')}</h1>
        <p className="muted">{t('cartNote')}</p>
        {state?.error && <p className="form-error" style={{ marginTop: 16 }}>{state.error}</p>}

        <h2>{t('contact')}</h2>
        <div className="form-grid">
          <div className="field field--rounded"><label htmlFor="email">{t('email')}</label><input id="email" name="email" type="email" required defaultValue={v('email')} autoComplete="email" /></div>
          <div className="field field--rounded"><label htmlFor="phone">{t('phone')}</label><input id="phone" name="phone" type="tel" dir="ltr" required defaultValue={v('phone')} autoComplete="tel" placeholder="06 00 00 00 00" /></div>
        </div>

        <h2>{t('shipping')}</h2>
        <div className="form-grid">
          <div className="two">
            <div className="field field--rounded"><label htmlFor="firstName">{t('firstName')}</label><input id="firstName" name="firstName" required defaultValue={v('firstName')} autoComplete="given-name" /></div>
            <div className="field field--rounded"><label htmlFor="lastName">{t('lastName')}</label><input id="lastName" name="lastName" required defaultValue={v('lastName')} autoComplete="family-name" /></div>
          </div>
          <div className="field field--rounded"><label htmlFor="address">{t('address')}</label><input id="address" name="address" required defaultValue={v('address')} autoComplete="street-address" /></div>
          <div className="two">
            <div className="field field--rounded">
              <label htmlFor="city">{t('city')}</label>
              <input id="city" name="city" list="cities" required defaultValue={v('city')} autoComplete="address-level2" />
              <datalist id="cities">{cities.map((c) => <option key={c} value={c} />)}</datalist>
            </div>
            <div className="field field--rounded"><label htmlFor="zip">{t('zipOptional')}</label><input id="zip" name="zip" defaultValue={v('zip')} autoComplete="postal-code" /></div>
          </div>
          <div className="field field--rounded"><label htmlFor="giftMessage">{t('giftMessage')}</label><textarea id="giftMessage" name="giftMessage" defaultValue={v('giftMessage')} maxLength={500} /></div>
          <div className="field field--rounded"><label htmlFor="note">{t('orderNote')}</label><textarea id="note" name="note" defaultValue={v('note')} maxLength={1000} /></div>
        </div>

        <h2>{t('payment')}</h2>
        <div className="pay-option">
          <input type="radio" checked readOnly aria-label={cod.title} style={{ marginTop: 4, accentColor: 'var(--c-primary)' }} />
          <div><strong>{cod.title}</strong><span>{cod.text}</span></div>
        </div>
        <button className="btn btn--block" style={{ marginTop: 24, padding: 18, fontSize: 16 }} disabled={pending || !quote || quote.lines.some((l) => !l.ok)}>
          {pending ? t('validating') : `${t('placeOrder')}${quote ? ` · ${fmt(quote.total)}` : ''}`}
        </button>
        <p className="cart-note">{rich(t('acceptTerms'), { link: <Link href="/policies/terms-of-service" className="link-amber">{t('termsLink')}</Link> })}</p>
      </div>

      <aside className="summary-box">
        <h2>{t('yourOrder')}</h2>
        {(quote?.lines || lines.map((l) => ({ ...l, ok: true, error: undefined }))).map((l) => (
          <div className="mini-line" key={l.key}>
            <div className="thumb">{l.image && <img src={small(l.image)} alt="" />}<span className="badge">{l.qty}</span></div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{l.title}</div>
              <div className="cart-line__meta">{l.bundle ? l.bundle.items.map((i) => `${i.qty}× ${i.title}`).join(', ') : l.variantTitle}</div>
              {!l.ok && <div className="cart-line__err">{l.error}</div>}
            </div>
            <div className="cart-line__price">{fmt(l.price * l.qty)}</div>
          </div>
        ))}
        <div className="promo-row">
          <input value={promo} onChange={(e) => setPromo(e.target.value)} placeholder={t('promoCode')} aria-label={t('promoCode')} />
          <button type="button" onClick={() => setApplied(promo.trim())}>{t('apply')}</button>
        </div>
        {quote?.promo && (
          <p className="promo-ok">
            {t('promoApplied', { code: quote.promo.code, label: quote.promo.label })} ·{' '}
            <button type="button" className="line-remove" style={{ margin: 0 }} onClick={() => { setApplied(''); setPromo(''); }}>{t('removePromo')}</button>
          </p>
        )}
        {quote?.promoError && <p className="promo-err">{quote.promoError}</p>}
        {quote && (
          <div className="cart-totals" style={{ marginTop: 14 }}>
            <div><span>{t('subtotal')}</span><span>{fmt(quote.subtotal)}</span></div>
            {quote.discount > 0 && <div><span>{t('discount')}</span><span>−{fmt(quote.discount)}</span></div>}
            <div><span>{t('shipping')}</span><span>{quote.shipping ? fmt(quote.shipping) : t('free')}</span></div>
            <div className="grand"><span>{t('total')}</span><span>{fmt(quote.total)}</span></div>
          </div>
        )}
      </aside>
    </form>
  );
}
