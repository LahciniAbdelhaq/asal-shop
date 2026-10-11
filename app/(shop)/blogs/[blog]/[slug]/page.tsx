import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { frDate } from '@/lib/format';
import { imgProps } from '@/lib/img';

type Params = Promise<{ blog: string; slug: string }>;
const getPost = (slug: string) => db.post.findFirst({ where: { slug, isPublished: true } });

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = await getPost((await params).slug);
  return p ? { title: p.title, description: p.excerpt, openGraph: { images: p.image ? [p.image] : [] } } : {};
}

export async function generateStaticParams() {
  return (await db.post.findMany({ where: { isPublished: true }, select: { slug: true } })).map((p) => ({ blog: 'le-miel-un-art-de-vivre', slug: p.slug }));
}

export default async function ArticlePage({ params }: { params: Params }) {
  const { blog, slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const related = await db.post.findMany({ where: { isPublished: true, id: { not: post.id } }, orderBy: { publishedAt: 'desc' }, take: 2 });

  return (
    <div className="asal-article-page">
      <div className="asal-article-wrap">
        <Link className="asal-back" href={`/blogs/${blog}`}>‹ Tous les articles</Link>
        <p className="asal-kicker">Le blog Asal</p>
        <h1>{post.title}</h1>
        <p className="asal-meta">{frDate(post.publishedAt, { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
      </div>
      {post.image && <div className="asal-hero-wrap"><img className="asal-hero-img" {...imgProps(post.image, '(max-width: 1200px) 100vw, 1160px', true)} alt={post.title} /></div>}
      <div className="asal-article-wrap">
        <div className="asal-article-content" dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
      {related.length > 0 && (
        <div className="asal-related">
          <h2>À lire aussi</h2>
          <div className="asal-rel-grid">
            {related.map((r) => (
              <Link key={r.id} className="asal-ma-blog-card" href={`/blogs/${blog}/${r.slug}`}>
                {r.image && <img {...imgProps(r.image, '(max-width: 760px) 100vw, 580px')} alt={r.title} style={{ height: 200 }} />}
                <div className="asal-ma-blog-body">
                  <div className="asal-ma-blog-date">{frDate(r.publishedAt, { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
                  <h3 className="asal-ma-blog-title">{r.title}</h3>
                  <p className="asal-ma-blog-ex">{r.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      <div className="asal-cta">
        <h3>Découvrez nos miels d&apos;exception</h3>
        <p>Des miels bruts du Maroc, récoltés à froid et non chauffés.</p>
        <Link href="/collections/nos-miels">Voir nos miels</Link>
      </div>
    </div>
  );
}
