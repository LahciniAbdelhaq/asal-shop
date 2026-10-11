import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Icon from '@/components/Icon';
import { ProductCard } from '@/components/shop/ProductCard';
import { getCategory, listProducts, type SortKey } from '@/lib/catalog';
import { getSettings } from '@/lib/settings';

type SP = Promise<Record<string, string | undefined>>;

const SORTS: { v: SortKey; l: string }[] = [
  { v: 'manual', l: 'En vedette' },
  { v: 'price-asc', l: 'Prix croissant' },
  { v: 'price-desc', l: 'Prix décroissant' },
  { v: 'title-asc', l: 'Alphabétique, A-Z' },
  { v: 'title-desc', l: 'Alphabétique, Z-A' },
  { v: 'newest', l: 'Nouveautés' },
];

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (slug === 'all') return { title: 'Tous les produits' };
  const c = await getCategory(slug);
  return c ? { title: c.seoTitle || c.title, description: c.seoDescription || c.description.replace(/<[^>]+>/g, '') } : {};
}

export default async function CollectionPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: SP }) {
  const { slug } = await params;
  const sp = await searchParams;
  const cat = slug === 'all' ? null : await getCategory(slug);
  if (slug !== 'all' && !cat) notFound();
  const s = await getSettings();

  const sort = (sp.sort as SortKey) || 'manual';
  const available = sp.available === '1';
  const min = sp.min ? Number(sp.min) : undefined;
  const max = sp.max ? Number(sp.max) : undefined;
  const cols = sp.view === 'dense' ? 6 : 5;
  const products = await listProducts({ category: slug, sort, available, min, max });

  const url = (patch: Record<string, string | undefined>) => {
    const q = new URLSearchParams();
    const merged = { ...sp, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) q.set(k, v);
    const str = q.toString();
    return `/collections/${slug}${str ? `?${str}` : ''}`;
  };
  const hasFilters = available || min != null || max != null;

  return (
    <div>
      <div className="collection-head">
        <h1>{cat ? cat.title : 'Tous les produits'}</h1>
        {cat?.description && <div className="desc" dangerouslySetInnerHTML={{ __html: cat.description }} />}
      </div>

      <div className="facets">
        <div className="facets__left">
          <details className="facet">
            <summary>Disponibilité <Icon name="chevronDown" /></summary>
            <div className="facet__panel">
              <Link href={url({ available: available ? undefined : '1' })} className={available ? 'on' : ''}>
                {available ? '✓ ' : ''}En stock uniquement
              </Link>
            </div>
          </details>
          <details className="facet">
            <summary>Prix <Icon name="chevronDown" /></summary>
            <form className="facet__panel" action={`/collections/${slug}`}>
              {sp.sort && <input type="hidden" name="sort" value={sp.sort} />}
              {available && <input type="hidden" name="available" value="1" />}
              <div className="row">
                <input type="number" name="min" placeholder={`De (${s.shop.currency})`} defaultValue={sp.min} min={0} />
                <input type="number" name="max" placeholder={`À (${s.shop.currency})`} defaultValue={sp.max} min={0} />
              </div>
              <button className="btn btn--dark" style={{ padding: '10px 16px' }}>Appliquer</button>
            </form>
          </details>
        </div>
        <div className="facets__right">
          <span className="facet-count">{products.length} article{products.length > 1 ? 's' : ''}</span>
          <details className="facet">
            <summary>Trier <Icon name="chevronDown" /></summary>
            <div className="facet__panel">
              {SORTS.map((o) => (
                <Link key={o.v} href={url({ sort: o.v === 'manual' ? undefined : o.v })} className={sort === o.v ? 'on' : ''}>{o.l}</Link>
              ))}
            </div>
          </details>
          <div className="grid-toggle">
            <Link href={url({ view: undefined })} className={cols === 5 ? 'on' : ''} aria-label="Grandes vignettes"><Icon name="grid2" size={18} /></Link>
            <Link href={url({ view: 'dense' })} className={cols === 6 ? 'on' : ''} aria-label="Petites vignettes"><Icon name="grid4" size={18} /></Link>
          </div>
        </div>
      </div>

      {hasFilters && (
        <div className="active-filters">
          {available && <Link href={url({ available: undefined })}>En stock ✕</Link>}
          {(min != null || max != null) && <Link href={url({ min: undefined, max: undefined })}>Prix {min ?? 0} – {max ?? '∞'} ✕</Link>}
          <Link href={`/collections/${slug}`}>Tout effacer</Link>
        </div>
      )}

      {products.length ? (
        <div className="product-grid" style={{ ['--cols' as string]: cols, ['--cols-m' as string]: cols === 6 ? 3 : 2 }}>
          {products.map((p) => <ProductCard key={p.id} p={p} fmt={s.shop} />)}
        </div>
      ) : (
        <div className="empty-state">
          <h2>Aucun produit</h2>
          <p>Aucun produit ne correspond à votre sélection.</p>
          <Link href={`/collections/${slug}`} className="btn btn--dark">Réinitialiser les filtres</Link>
        </div>
      )}
    </div>
  );
}
