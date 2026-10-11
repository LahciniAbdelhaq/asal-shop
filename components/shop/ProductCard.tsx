import Link from 'next/link';
import { cardInfo, type FullProduct } from '@/lib/catalog';
import { money, type MoneyFormat } from '@/lib/format';

/** Carte « collection » (grille sobre du thème d'origine). */
export function ProductCard({ p, fmt }: { p: FullProduct; fmt: MoneyFormat }) {
  const c = cardInfo(p, p.subtitle);
  return (
    <Link href={`/products/${p.slug}`} className="product-card">
      <div className="product-card__media">
        {c.soldOut ? <span className="product-card__badge product-card__badge--out">Épuisé</span> : c.compareAt && c.compareAt > c.price ? <span className="product-card__badge">Promo</span> : null}
        {c.image && <img src={c.image} alt={p.title} loading="lazy" />}
        {c.image2 && <img className="alt" src={c.image2} alt="" loading="lazy" />}
      </div>
      <div className="product-card__title">{p.title}</div>
      <div className="product-card__price">
        {money(c.price, fmt)}
        {c.compareAt && c.compareAt > c.price && <s>{money(c.compareAt, fmt)}</s>}
      </div>
    </Link>
  );
}

/** Carte « accueil » (cartes blanches arrondies, prix ambre). */
export function HomeCard({ p, fmt, variant, badge }: { p: FullProduct; fmt: MoneyFormat; variant?: string; badge?: string }) {
  const c = cardInfo(p, variant);
  return (
    <Link href={`/products/${p.slug}`}>
      <div className="pcard__img" style={{ backgroundImage: c.image ? `url('${c.image}')` : undefined }}>
        {badge && <div className="pcard__badge">{badge}</div>}
      </div>
      <div className="pcard__body">
        <div className="pcard__title">{p.title}</div>
        {c.label && <div className="pcard__sub">{c.label}</div>}
        <div className="pcard__price">
          {money(c.price, fmt)}
          {c.compareAt && c.compareAt > c.price && <s>{money(c.compareAt, fmt)}</s>}
        </div>
      </div>
    </Link>
  );
}
