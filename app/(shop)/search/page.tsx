import type { Metadata } from 'next';
import { listProducts } from '@/lib/catalog';
import { getSettings } from '@/lib/settings';
import { ProductCard } from '@/components/shop/ProductCard';

export const metadata: Metadata = { title: 'Recherche' };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q || '').trim();
  const [s, list] = await Promise.all([getSettings(), q ? listProducts({ q }) : Promise.resolve([])]);
  return (
    <div>
      <div className="collection-head">
        <h1>Recherche</h1>
        <form action="/search" className="search-input" style={{ maxWidth: 560, marginTop: 24 }}>
          <input name="q" defaultValue={q} placeholder="Rechercher un miel, un coffret…" aria-label="Rechercher" />
          <button className="btn" style={{ padding: '10px 20px' }}>Rechercher</button>
        </form>
      </div>
      {q && <p className="facet-count" style={{ margin: '10px 0 20px' }}>{list.length} résultat{list.length > 1 ? 's' : ''} pour « {q} »</p>}
      <div className="product-grid">{list.map((p) => <ProductCard key={p.id} p={p} fmt={s.shop} />)}</div>
    </div>
  );
}
