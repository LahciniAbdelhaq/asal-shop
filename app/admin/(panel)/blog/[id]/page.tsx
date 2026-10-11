import Link from 'next/link';
import { notFound } from 'next/navigation';
import Icon from '@/components/Icon';
import { db } from '@/lib/db';
import { ConfirmButton } from '@/components/admin/ui';
import { deletePost } from '../../../actions';
import PostForm from './PostForm';

export default async function PostEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = id === 'new' ? null : await db.post.findUnique({ where: { id: Number(id) } });
  if (id !== 'new' && !p) notFound();
  return (
    <>
      <Link href="/admin/blog" className="back-link">← Blog</Link>
      <div className="page-title">
        <h1>{p ? p.title : 'Nouvel article'}</h1>
        {p && (
          <div className="actions">
            <a className="btn btn-secondary" href={`/blogs/le-miel-un-art-de-vivre/${p.slug}`} target="_blank" rel="noreferrer"><Icon name="eye" /> Voir</a>
            <form action={deletePost}><input type="hidden" name="id" value={p.id} /><ConfirmButton className="btn btn-danger" message="Supprimer cet article ?">Supprimer</ConfirmButton></form>
          </div>
        )}
      </div>
      <PostForm p={p ? { id: p.id, title: p.title, slug: p.slug, excerpt: p.excerpt, content: p.content, image: p.image, author: p.author, isPublished: p.isPublished, publishedAt: p.publishedAt.toISOString().slice(0, 10) } : null} />
    </>
  );
}
