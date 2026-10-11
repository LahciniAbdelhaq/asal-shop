import Link from 'next/link';
import { notFound } from 'next/navigation';
import Icon from '@/components/Icon';
import { db } from '@/lib/db';
import { frDate, frDateTime } from '@/lib/format';

export const metadata = { title: 'Détails de l’article' };

export default async function PostDetails({ params }: { params: Promise<{ id: string }> }) {
  const p = await db.post.findUnique({ where: { id: Number((await params).id) } });
  if (!p) notFound();
  const words = p.content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return (
    <>
      <Link href="/admin/blog" className="back-link">← Blog</Link>
      <div className="page-title">
        <div>
          <h1 style={{ display: 'flex', gap: 10, alignItems: 'center' }}>{p.title} {p.isPublished ? <span className="pill green">Publié</span> : <span className="pill gray">Brouillon</span>}</h1>
          <p>Publié le {frDate(p.publishedAt)} par {p.author} · modifié le {frDateTime(p.updatedAt)}</p>
        </div>
        <div className="actions"><Link className="btn" href={`/admin/blog/${p.id}`}><Icon name="edit" /> Modifier</Link></div>
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-body">
            {p.image && <img className="detail-hero" src={p.image} alt="" style={{ marginBottom: 18 }} />}
            {p.excerpt && <p style={{ fontSize: 15.5, color: '#4B4239', fontStyle: 'italic', marginTop: 0 }}>{p.excerpt}</p>}
            <div className="prose" dangerouslySetInnerHTML={{ __html: p.content }} />
          </div>
        </div>
        <div className="card">
          <div className="card-head"><h2>Informations</h2></div>
          <div className="card-body">
            <dl className="kv">
              <dt>URL</dt><dd>/blogs/le-miel-un-art-de-vivre/{p.slug}</dd>
              <dt>Auteur</dt><dd>{p.author}</dd>
              <dt>Date</dt><dd>{frDate(p.publishedAt)}</dd>
              <dt>Longueur</dt><dd>{words} mots · ~{Math.max(1, Math.round(words / 200))} min de lecture</dd>
            </dl>
          </div>
        </div>
      </div>
    </>
  );
}
