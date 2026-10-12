'use client';

import { useMemo, useState } from 'react';
import { useCart } from './CartProvider';
import { useI18n } from './I18n';
import { small } from '@/lib/img';

export type ComposerItem = { productId: number; slug: string; title: string; image: string; variants: Record<string, { id: number; price: number; available: boolean; label?: string }> };

export default function Composer({ items, formats, sizes, boxPrice, labels }: {
  items: ComposerItem[];
  formats: string[];
  sizes: number[];
  boxPrice: number;
  labels: { eyebrow: string; title: string; text: string; cta: string };
}) {
  const { add, fmt } = useCart();
  const { t } = useI18n();
  // un format est disponible si au moins un miel l'est
  const formatOk = (f: string) => items.some((i) => i.variants[f]?.available);
  // libellé traduit du format (titre de variante traduit sur les fiches produits)
  const fLabel = (f: string) => items.map((i) => i.variants[f]?.label).find(Boolean) || f;
  const [format, setFormat] = useState(formats.find(formatOk) || formats[0]);
  const [size, setSize] = useState(sizes[0] || 3);
  const [picks, setPicks] = useState<Record<number, number>>({});
  const [message, setMessage] = useState('');
  const [adding, setAdding] = useState(false);

  const total = useMemo(() => Object.values(picks).reduce((a, b) => a + b, 0), [picks]);
  const price = useMemo(
    () => boxPrice + items.reduce((n, it) => n + (picks[it.productId] || 0) * (it.variants[format]?.price || 0), 0),
    [picks, items, format, boxPrice],
  );

  const change = (id: number, d: number) =>
    setPicks((p) => {
      const q = (p[id] || 0) + d;
      const next = { ...p };
      if (q <= 0) delete next[id]; else next[id] = q;
      return next;
    });

  const submit = () => {
    if (adding) return;
    setAdding(true);
    setTimeout(() => { setAdding(false); doAdd(); }, 450);
  };
  const doAdd = () => {
    const chosen = items.filter((i) => picks[i.productId]);
    add({
      variantId: 0,
      productId: 0,
      slug: '',
      title: t('customBox', { n: size }),
      variantTitle: `${fLabel(format)}${message ? ` · ${t('boxMessage')} : « ${message.slice(0, 80)} »` : ''}`,
      image: small(chosen[0]?.image || ''),
      price,
      bundle: { format, items: chosen.map((i) => ({ variantId: i.variants[format].id, title: i.title, qty: picks[i.productId] })) },
    });
    setPicks({});
    setMessage('');
  };

  return (
    <div className="asal-composer-sec" style={{ marginInline: 'calc(-1 * var(--gutter))', width: 'auto' }}>
      <div className="asal-composer-inner">
        <div className="asal-composer-head">
          <div className="asal-eyebrow-amber" style={{ background: 'none', border: 0, color: 'var(--c-foreground)', letterSpacing: 0, fontWeight: 500, fontSize: 14 }}>{labels.eyebrow}</div>
          <h1 className="asal-composer-title">{labels.title}</h1>
          <p className="asal-composer-sub">{labels.text}</p>
        </div>

        <div className="asal-composer-step">
          <div className="asal-composer-steplabel"><span className="asal-composer-num">1</span> {t('step1')} <span className="asal-composer-note">{t('step1Note')}</span></div>
          <div className="asal-composer-pills">
            {formats.map((f) => (
              <button key={f} type="button" className={f === format ? 'on' : ''} disabled={!formatOk(f)} onClick={() => { setFormat(f); setPicks({}); }}>
                <bdi>{fLabel(f)}</bdi>{formatOk(f) ? '' : ` — ${t('soldOut')}`}
              </button>
            ))}
          </div>
        </div>

        <div className="asal-composer-step">
          <div className="asal-composer-steplabel"><span className="asal-composer-num">2</span> {t('step2')}</div>
          <div className="asal-composer-pills">
            {sizes.map((n) => (
              <button key={n} type="button" className={n === size ? 'on' : ''} onClick={() => { setSize(n); setPicks({}); }}>{t('pots', { n })}</button>
            ))}
          </div>
        </div>

        <div className="asal-composer-step">
          <div className="asal-composer-steplabel"><span className="asal-composer-num">3</span> {t('step3')} <span className="asal-composer-note">· {total}/{t('pots', { n: size })}</span></div>
          <div className="asal-composer-grid">
            {items.map((it) => {
              const v = it.variants[format];
              if (!v) return null;
              const q = picks[it.productId] || 0;
              return (
                <div className={`asal-composer-card${q ? ' picked' : ''}`} key={it.productId} style={v.available ? undefined : { opacity: .5 }}>
                  {it.image && <img src={small(it.image)} alt={it.title} loading="lazy" decoding="async" />}
                  <h4>{it.title}</h4>
                  <div className="asal-composer-price">{v.available ? `${fmt(v.price)} · ${fLabel(format)}` : t('soldOut')}</div>
                  <div className="asal-composer-stepper">
                    <button type="button" aria-label={t('remove')} disabled={q === 0} onClick={() => change(it.productId, -1)}>−</button>
                    <span className="q">{q}</span>
                    <button type="button" aria-label={t('add')} disabled={!v.available || total >= size} onClick={() => change(it.productId, 1)}>+</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="asal-composer-step asal-composer-msg">
          <div className="asal-composer-steplabel"><span className="asal-composer-num">4</span> {t('step4')} <span className="asal-composer-note">{t('step4Note')}</span></div>
          <textarea value={message} maxLength={300} onChange={(e) => setMessage(e.target.value)} placeholder={t('messagePlaceholder')} />
        </div>

        <div className="asal-composer-bar">
          <div className="asal-composer-totals">
            <div className="asal-composer-prog">{total}/{t('pots', { n: size })} · {fLabel(format)}</div>
            <div className="asal-composer-total">{fmt(price)}</div>
          </div>
          <button type="button" className={`asal-composer-cta${adding ? ' is-loading' : ''}`} disabled={total !== size} onClick={submit}>{labels.cta}</button>
        </div>
      </div>
    </div>
  );
}
