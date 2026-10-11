import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { BlogCard } from '@/components/shop/Sections';

export const metadata: Metadata = { title: 'Le miel, un art de vivre', description: 'Nos conseils, recettes et découvertes autour du miel' };

export function generateStaticParams() {
  return [{ blog: 'le-miel-un-art-de-vivre' }];
}

export default async function BlogPage() {
  const posts = await db.post.findMany({ where: { isPublished: true }, orderBy: [{ publishedAt: 'desc' }, { id: 'asc' }] });
  return (
    <div className="asal-blog-page">
      <div className="asal-blog-inner">
        <p className="asal-kicker">Le blog Asal</p>
        <h1>Le miel, un art de vivre</h1>
        <p className="asal-sub">Nos conseils, recettes et découvertes autour du miel</p>
        {posts.length ? (
          <div className="asal-ma-blog-grid">{posts.map((p) => <BlogCard key={p.id} p={p} />)}</div>
        ) : (
          <p>Aucun article pour le moment.</p>
        )}
      </div>
    </div>
  );
}
