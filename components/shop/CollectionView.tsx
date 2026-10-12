'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Icon from '@/components/Icon';
import type { FullProduct } from '@/lib/catalog';
import type { DictKey } from '@/lib/dict';
import type { MoneyFormat } from '@/lib/format';
import { cardInfo, inStock } from '@/lib/product-utils';
import Link, { useI18n } from './I18n';
import { ProductCard } from './ProductCard';

// La page catégorie est mise en cache telle quelle ; filtres et tri s'appliquent dans le navigateur.

const SORTS: { v: string; l: DictKey }[] = [
  { v: 'manual', l: 'sortManual' },
  { v: 'price-asc', l: 'sortPriceAsc' },
  { v: 'price-desc', l: 'sortPriceDesc' },
  { v: 'title-asc', l: 'sortTitleAsc' },
  { v: 'title-desc', l: 'sortTitleDesc' },
  { v: 'newest', l: 'sortNewest' },
];

type Props = { slug: string; products: FullProduct[]; fmt: MoneyFormat };

function View({ slug, products, fmt, sp }: Props & { sp: URLSearchParams }) {
  const { t, lang, href } = useI18n();
  const sort = sp.get('sort') || 'manual';
  const available = sp.get('available') === '1';
  const min = sp.get('min') ? Number(sp.get('min')) : null;
  const max = sp.get('max') ? Number(sp.get('max')) : null;
  const cols = sp.get('view') === 'dense' ? 6 : 5;

  const price = (p: FullProduct) => cardInfo(p, p.subtitle).price;
  let list = [...products];
  if (available) list = list.filter((p) => p.variants.some(inStock));
  if (min != null) list = list.filter((p) => price(p) >= min);
  if (max != null) list = list.filter((p) => price(p) <= max);
  if (sort === 'price-asc') list.sort((a, b) => price(a) - price(b));
  if (sort === 'price-desc') list.sort((a, b) => price(b) - price(a));
  if (sort === 'title-asc') list.sort((a, b) => a.title.localeCompare(b.title, lang));
  if (sort === 'title-desc') list.sort((a, b) => b.title.localeCompare(a.title, lang));
  if (sort === 'newest') list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  const url = (patch: Record<string, string | undefined>) => {
    const q = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) { if (v) q.set(k, v); else q.delete(k); }
    const s = q.toString();
    return `/collections/${slug}${s ? `?${s}` : ''}`;
  };
  const hasFilters = available || min != null || max != null;

  return (
    <>
      <div className="facets">
        <div className="facets__left">
          <details className="facet">
            <summary>{t('availability')} <Icon name="chevronDown" /></summary>
            <div className="facet__panel">
              <Link href={url({ available: available ? undefined : '1' })} className={available ? 'on' : ''} scroll={false}>
                {available ? '✓ ' : ''}{t('inStockOnly')}
              </Link>
            </div>
          </details>
          <details className="facet">
            <summary>{t('price')} <Icon name="chevronDown" /></summary>
            <form className="facet__panel" action={href(`/collections/${slug}`)}>
              {sp.get('sort') && <input type="hidden" name="sort" value={sp.get('sort')!} />}
              {available && <input type="hidden" name="available" value="1" />}
              <div className="row">
                <input type="number" name="min" placeholder={t('priceFrom', { c: fmt.currency })} defaultValue={sp.get('min') || ''} min={0} />
                <input type="number" name="max" placeholder={t('priceTo', { c: fmt.currency })} defaultValue={sp.get('max') || ''} min={0} />
              </div>
              <button className="btn btn--dark" style={{ padding: '10px 16px' }}>{t('apply')}</button>
            </form>
          </details>
        </div>
        <div className="facets__right">
          <span className="facet-count">{t(list.length > 1 ? 'countMany' : 'countOne', { n: list.length })}</span>
          <details className="facet">
            <summary>{t('sort')} <Icon name="chevronDown" /></summary>
            <div className="facet__panel">
              {SORTS.map((o) => (
                <Link key={o.v} href={url({ sort: o.v === 'manual' ? undefined : o.v })} className={sort === o.v ? 'on' : ''} scroll={false}>{t(o.l)}</Link>
              ))}
            </div>
          </details>
          <div className="grid-toggle">
            <Link href={url({ view: undefined })} className={cols === 5 ? 'on' : ''} aria-label={t('largeThumbs')} scroll={false}><Icon name="grid2" size={18} /></Link>
            <Link href={url({ view: 'dense' })} className={cols === 6 ? 'on' : ''} aria-label={t('smallThumbs')} scroll={false}><Icon name="grid4" size={18} /></Link>
          </div>
        </div>
      </div>

      {hasFilters && (
        <div className="active-filters">
          {available && <Link href={url({ available: undefined })} scroll={false}>{t('inStockChip')} ✕</Link>}
          {(min != null || max != null) && <Link href={url({ min: undefined, max: undefined })} scroll={false}>{t('price')} {min ?? 0} – {max ?? '∞'} ✕</Link>}
          <Link href={`/collections/${slug}`} scroll={false}>{t('clearAll')}</Link>
        </div>
      )}

      {list.length ? (
        <div className="product-grid" style={{ ['--cols' as string]: cols, ['--cols-m' as string]: cols === 6 ? 3 : 2 }}>
          {list.map((p) => <ProductCard key={p.id} p={p} fmt={fmt} />)}
        </div>
      ) : (
        <div className="empty-state">
          <h2>{t('noProducts')}</h2>
          <p>{t('noProductsText')}</p>
          <Link href={`/collections/${slug}`} className="btn btn--dark">{t('resetFilters')}</Link>
        </div>
      )}
    </>
  );
}

function WithParams(props: Props) {
  const sp = useSearchParams();
  return <View {...props} sp={new URLSearchParams(sp.toString())} />;
}

export default function CollectionView(props: Props) {
  // pendant l'hydratation : la grille non filtrée (identique à la version en cache)
  return (
    <Suspense fallback={<View {...props} sp={new URLSearchParams()} />}>
      <WithParams {...props} />
    </Suspense>
  );
}
