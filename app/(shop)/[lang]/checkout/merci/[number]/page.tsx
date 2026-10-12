import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Icon from '@/components/Icon';
import Link from '@/components/shop/I18n';
import { db } from '@/lib/db';
import { getSettings, getT } from '@/lib/settings';
import { money } from '@/lib/format';
import { asLocale } from '@/lib/i18n';
import { rich } from '@/lib/rich';
import ClearCart from './ClearCart';

type Params = Promise<{ lang: string; number: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  return { title: (await getT(asLocale((await params).lang)))('thanksMeta') };
}

export default async function ThanksPage({ params, searchParams }: { params: Params; searchParams: Promise<{ e?: string }> }) {
  const { number, lang: l } = await params;
  const lang = asLocale(l);
  const { e } = await searchParams;
  const order = await db.order.findUnique({ where: { number: Number(number) || 0 }, include: { items: true } });
  // la page n'est visible qu'avec l'e-mail de la commande
  if (!order || order.email !== (e || '').toLowerCase()) notFound();
  const [s, t] = await Promise.all([getSettings(lang), getT(lang)]);
  const m = (n: number) => money(n, s.shop);
  return (
    <div className="thanks">
      <ClearCart />
      <div className="check"><Icon name="check" size={36} stroke={2} /></div>
      <h1>{t('thanksTitle', { name: order.firstName })}</h1>
      <p>{rich(t('thanksText'), { number: <strong>{t('orderNo', { n: order.number })}</strong>, phone: <strong dir="ltr">{order.phone}</strong> })}</p>
      <div className="summary-box">
        <h2>{t('summary')}</h2>
        {order.items.map((i) => (
          <div className="mini-line" key={i.id}>
            <div className="thumb">{i.image && <img src={i.image} alt="" />}<span className="badge">{i.quantity}</span></div>
            <div><div style={{ fontWeight: 600, fontSize: 14 }}>{i.title}</div><div className="cart-line__meta">{i.variantTitle}</div></div>
            <div className="cart-line__price">{m(i.price * i.quantity)}</div>
          </div>
        ))}
        <div className="cart-totals" style={{ marginTop: 14 }}>
          <div><span>{t('subtotal')}</span><span>{m(order.subtotal)}</span></div>
          {order.discount > 0 && <div><span>{t('discount')} ({order.promoCode})</span><span>−{m(order.discount)}</span></div>}
          <div><span>{t('shipping')}</span><span>{order.shipping ? m(order.shipping) : t('free')}</span></div>
          <div className="grand"><span>{t('totalCod')}</span><span>{m(order.total)}</span></div>
        </div>
        <p className="cart-note" style={{ textAlign: 'start' }}>{t('deliverTo')} {order.firstName} {order.lastName}, {order.address}, {order.city}</p>
      </div>
      <Link href="/collections/all" className="btn" style={{ marginTop: 30 }}>{t('continueShopping')}</Link>
    </div>
  );
}
