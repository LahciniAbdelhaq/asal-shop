import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from '@/components/shop/I18n';
import { db } from '@/lib/db';
import { frDate } from '@/lib/format';
import { imgProps } from '@/lib/img';
import { asLocale, localize, type Locale } from '@/lib/i18n';
import { getT } from '@/lib/settings';

type Params = Promise<{ lang: string; blog: string; slug: string }>;
const getPost = async (slug: string, lang: Locale) => {
  const p = await db.post.findFirst({ where: { slug, isPublished: true } });
  return p ? localize(p, lang) : null;
};

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug, lang } = await params;
  const p = await getPost(slug, asLocale(lang));
  return p ? { title: p.title, description: p.excerpt, openGraph: { images: p.image ? [p.image] : [] } } : {};
}

export async function generateStaticParams() {
  return (await db.post.findMany({ where: { isPublished: true }, select: { slug: true } })).map((p) => ({ blog: 'le-miel-un-art-de-vivre', slug: p.slug }));
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { blog, slug, lang: l } = await params;
  const lang = asLocale(l);
  const post = await getPost(slug, lang);
  if (!post) notFound();
  const [t, related] = await Promise.all([
    getT(lang),
    db.post.findMany({ where: { isPublished: true, id: { not: post.id } }, orderBy: { publishedAt: 'desc' }, take: 2 }),
  ]);
  const date = (d: Date) => frDate(d, { day: '2-digit', month: '2-digit', year: 'numeric' }, lang);

  return (
    <div className="asal-article-page">
      <div className="asal-article-wrap">
        <Link className="asal-back" href={`/blogs/${blog}`}>{t('allPosts')}</Link>
        <p className="asal-kicker">{t('blogKicker')}</p>
        <h1>{post.title}</h1>
        <p className="asal-meta">{date(post.publishedAt)}</p>
      </div>
      {post.image && <div className="asal-hero-wrap"><img className="asal-hero-img" {...imgProps(post.image, '(max-width: 1200px) 100vw, 1160px', true)} alt={post.title} /></div>}
      <div className="asal-article-wrap">
        <div className="asal-article-content" dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
      {related.length > 0 && (
        <div className="asal-related">
          <h2>{t('readAlso')}</h2>
          <div className="asal-rel-grid">
            {related.map((x) => localize(x, lang)).map((r) => (
              <Link key={r.id} className="asal-ma-blog-card" href={`/blogs/${blog}/${r.slug}`}>
                {r.image && <img {...imgProps(r.image, '(max-width: 760px) 100vw, 580px')} alt={r.title} style={{ height: 200 }} />}
                <div className="asal-ma-blog-body">
                  <div className="asal-ma-blog-date">{date(r.publishedAt)}</div>
                  <h3 className="asal-ma-blog-title">{r.title}</h3>
                  <p className="asal-ma-blog-ex">{r.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      <div className="asal-cta">
        <h3>{t('blogCtaTitle')}</h3>
        <p>{t('blogCtaText')}</p>
        <Link href="/collections/nos-miels">{t('blogCtaBtn')}</Link>
      </div>
    </div>
  );
}
