import Link from 'next/link';
import Icon from '@/components/Icon';
import { db } from '@/lib/db';
import { frDate } from '@/lib/format';

export const metadata = { title: 'Blog' };

export default async function BlogAdmin() {
  const posts = await db.post.findMany({ orderBy: { publishedAt: 'desc' } });
  return (
    <>
      <div className="page-title">
        <div><h1>Blog</h1><p>Articles du blog « Le miel, un art de vivre »</p></div>
        <div className="actions"><Link className="btn" href="/admin/blog/new"><Icon name="plus" /> Nouvel article</Link></div>
      </div>
      <div className="card table-wrap">
        <table className="tbl">
          <thead><tr><th style={{ width: 60 }} /><th>Titre</th><th>Date</th><th>Statut</th><th /></tr></thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id}>
                <td>{p.image ? <img className="thumb" src={p.image} alt="" /> : <div className="thumb" />}</td>
                <td><Link className="row-link" href={`/admin/blog/${p.id}`}>{p.title}</Link><div className="muted" style={{ fontSize: 12, maxWidth: 520, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.excerpt}</div></td>
                <td className="muted">{frDate(p.publishedAt)}</td>
                <td>{p.isPublished ? <span className="pill green">Publié</span> : <span className="pill gray">Brouillon</span>}</td>
                <td className="num"><a className="btn btn-ghost btn-sm" href={`/blogs/le-miel-un-art-de-vivre/${p.slug}`} target="_blank" rel="noreferrer"><Icon name="external" /></a></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!posts.length && <div className="empty">Aucun article.</div>}
      </div>
    </>
  );
}
