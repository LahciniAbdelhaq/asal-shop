import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { getT } from '@/lib/settings';
import { asLocale, localize } from '@/lib/i18n';
import { BlogCard } from '@/components/shop/Sections';

type Params = Promise<{ lang: string; blog: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const t = await getT(asLocale((await params).lang));
  return { title: t('blogTitle'), description: t('blogSub') };
}

export function generateStaticParams() {
  return [{ blog: 'le-miel-un-art-de-vivre' }];
}

export default async function BlogPage({ params }: { params: Params }) {
  const lang = asLocale((await params).lang);
  const [t, posts] = await Promise.all([
    getT(lang),
    db.post.findMany({ where: { isPublished: true }, orderBy: [{ publishedAt: 'desc' }, { id: 'asc' }] }),
  ]);
  return (
    <div className="asal-blog-page">
      <div className="asal-blog-inner">
        <p className="asal-kicker">{t('blogKicker')}</p>
        <h1>{t('blogTitle')}</h1>
        <p className="asal-sub">{t('blogSub')}</p>
        {posts.length ? (
          <div className="asal-ma-blog-grid">{posts.map((p) => <BlogCard key={p.id} p={localize(p, lang)} lang={lang} />)}</div>
        ) : (
          <p>{t('noPosts')}</p>
        )}
      </div>
    </div>
  );
}
