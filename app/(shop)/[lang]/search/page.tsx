import type { Metadata } from 'next';
import { listProducts } from '@/lib/catalog';
import { getSettings, getT } from '@/lib/settings';
import { asLocale, localePath } from '@/lib/i18n';
import { ProductCard } from '@/components/shop/ProductCard';

type Params = Promise<{ lang: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  return { title: (await getT(asLocale((await params).lang)))('searchTitle') };
}

export default async function SearchPage({ params, searchParams }: { params: Params; searchParams: Promise<{ q?: string }> }) {
  const lang = asLocale((await params).lang);
  const q = ((await searchParams).q || '').trim();
  const [s, t, list] = await Promise.all([getSettings(lang), getT(lang), q ? listProducts({ q, lang }) : Promise.resolve([])]);
  return (
    <div>
      <div className="collection-head">
        <h1>{t('searchTitle')}</h1>
        <form action={localePath(lang, '/search')} className="search-input" style={{ maxWidth: 560, marginTop: 24 }}>
          <input name="q" defaultValue={q} placeholder={t('searchPlaceholder')} aria-label={t('search')} />
          <button className="btn" style={{ padding: '10px 20px' }}>{t('search')}</button>
        </form>
      </div>
      {q && <p className="facet-count" style={{ margin: '10px 0 20px' }}>{t(list.length > 1 ? 'resultsMany' : 'resultsOne', { n: list.length, q })}</p>}
      <div className="product-grid">{list.map((p) => <ProductCard key={p.id} p={p} fmt={s.shop} />)}</div>
    </div>
  );
}
