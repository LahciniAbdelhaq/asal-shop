'use client';

import type { FullProduct } from '@/lib/catalog';
import { cardInfo } from '@/lib/product-utils';
import { money, type MoneyFormat } from '@/lib/format';
import { imgProps } from '@/lib/img';
import Link, { useI18n } from './I18n';

/** Carte « collection » (grille sobre du thème d'origine). */
export function ProductCard({ p, fmt }: { p: FullProduct; fmt: MoneyFormat }) {
  const { t } = useI18n();
  const c = cardInfo(p, p.subtitle);
  return (
    <Link href={`/products/${p.slug}`} className="product-card">
      <div className="product-card__media">
        {c.soldOut ? <span className="product-card__badge product-card__badge--out">{t('soldOut')}</span> : c.compareAt && c.compareAt > c.price ? <span className="product-card__badge">{t('sale')}</span> : null}
        {c.image && <img {...imgProps(c.image, '(max-width: 749px) 50vw, (max-width: 989px) 33vw, 20vw')} alt={p.title} />}
        {c.image2 && <img className="alt" {...imgProps(c.image2, '(max-width: 749px) 50vw, (max-width: 989px) 33vw, 20vw')} alt="" />}
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
      <div className="pcard__img">
        {c.image && <img {...imgProps(c.image, '(max-width: 860px) 70vw, 380px')} alt={p.title} />}
        {badge && <div className="pcard__badge">{badge}</div>}
      </div>
      <div className="pcard__body">
        <div className="pcard__title">{p.title}</div>
        {c.label && <div className="pcard__sub"><bdi>{c.label}</bdi></div>}
        <div className="pcard__price">
          {money(c.price, fmt)}
          {c.compareAt && c.compareAt > c.price && <s>{money(c.compareAt, fmt)}</s>}
        </div>
      </div>
    </Link>
  );
}
