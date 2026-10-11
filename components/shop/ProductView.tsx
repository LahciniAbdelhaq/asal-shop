'use client';

import { useMemo, useState } from 'react';
import Icon from '@/components/Icon';
import { useCart } from './CartProvider';

type V = { id: number; title: string; price: number; compareAtPrice: number | null; stock: number; trackStock: boolean; image: string };
type P = { id: number; slug: string; title: string; optionName: string; images: { url: string; alt: string }[]; variants: V[] };

const ok = (v: V) => !v.trackStock || v.stock > 0;

export default function ProductView({ p, labels, defaultVariant, children }: { p: P; labels: { add: string; soldOut: string }; defaultVariant?: string; children?: React.ReactNode }) {
  const { add, fmt } = useCart();
  const first = p.variants.find((x) => ok(x) && x.title === defaultVariant) || p.variants.find(ok) || p.variants[0];
  const [vid, setVid] = useState(first?.id);
  const [qty, setQty] = useState(1);
  const v = p.variants.find((x) => x.id === vid) || first;

  const images = useMemo(() => {
    const list = [...p.images];
    for (const x of p.variants) if (x.image && !list.some((i) => i.url === x.image)) list.push({ url: x.image, alt: p.title });
    return list;
  }, [p]);
  const [idx, setIdx] = useState(0);

  const pick = (x: V) => {
    setVid(x.id);
    if (x.image) {
      const i = images.findIndex((im) => im.url === x.image);
      if (i >= 0) setIdx(i);
    }
  };
  const showPicker = p.variants.length > 1 || (p.variants[0] && p.variants[0].title !== 'Défaut');
  const maxQty = v && v.trackStock ? v.stock : 99;

  return (
    <div className="product-main">
      <div className="product-gallery">
        <div className="product-gallery__main">
          {images[idx] && <img src={images[idx].url} alt={images[idx].alt || p.title} />}
          {images.length > 1 && (
            <>
              <button className="product-gallery__nav prev" aria-label="Image précédente" onClick={() => setIdx((idx - 1 + images.length) % images.length)}><Icon name="chevron" /></button>
              <button className="product-gallery__nav next" aria-label="Image suivante" onClick={() => setIdx((idx + 1) % images.length)}><Icon name="chevron" /></button>
            </>
          )}
        </div>
        {images.length > 1 && (
          <div className="product-gallery__thumbs">
            {images.map((im, i) => (
              <button key={im.url} className={i === idx ? 'on' : ''} onClick={() => setIdx(i)} aria-label={`Image ${i + 1}`}>
                <img src={im.url} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="product-info">
        <h1>{p.title}</h1>
        <div className="price">
          {v ? fmt(v.price) : ''}
          {v?.compareAtPrice && v.compareAtPrice > v.price && <s>{fmt(v.compareAtPrice)}</s>}
        </div>

        {showPicker && (
          <div className="variant-picker">
            <fieldset>
              <legend>{p.optionName || 'Option'}</legend>
              <div className="variant-pills">
                {p.variants.map((x) => (
                  <button key={x.id} type="button" className={`variant-pill${x.id === vid ? ' on' : ''}${ok(x) ? '' : ' out'}`} onClick={() => pick(x)} aria-pressed={x.id === vid}>
                    {x.title}
                    {!ok(x) && <em>{labels.soldOut}</em>}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        <div className="buy-row" style={showPicker ? undefined : { marginTop: 30 }}>
          <div className="qty">
            <button type="button" aria-label="Diminuer la quantité" disabled={qty <= 1} onClick={() => setQty(qty - 1)}><Icon name="minus" size={16} /></button>
            <input aria-label="Quantité" value={qty} inputMode="numeric" onChange={(e) => setQty(Math.max(1, Math.min(maxQty || 1, Number(e.target.value.replace(/\D/g, '')) || 1)))} />
            <button type="button" aria-label="Augmenter la quantité" disabled={qty >= maxQty} onClick={() => setQty(qty + 1)}><Icon name="plus" size={16} /></button>
          </div>
          <button
            className="add-to-cart"
            disabled={!v || !ok(v)}
            onClick={() =>
              v &&
              add({
                variantId: v.id,
                productId: p.id,
                slug: p.slug,
                title: p.title,
                variantTitle: v.title === 'Défaut' ? '' : v.title,
                image: v.image || p.images[0]?.url || '',
                price: v.price,
                qty,
              })
            }
          >
            <Icon name="cartplus" size={20} />
            {v && ok(v) ? labels.add : labels.soldOut}
          </button>
        </div>
        {v && v.trackStock && v.stock > 0 && v.stock <= 5 && <p className="added-msg">Plus que {v.stock} en stock</p>}
        {children}
      </div>
    </div>
  );
}
