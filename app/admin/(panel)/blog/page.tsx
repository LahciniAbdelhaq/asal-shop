import Link from 'next/link';
import Icon from '@/components/Icon';
import { db } from '@/lib/db';
import { frDate } from '@/lib/format';
import RowActions from '@/components/admin/RowActions';
import { deletePost } from '../../actions';

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
          <thead><tr><th style={{ width: 60 }} /><th>Titre</th><th>Date</th><th>Statut</th><th className="actions-col">Actions</th></tr></thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id}>
                <td>{p.image ? <img className="thumb" src={p.image} alt="" /> : <div className="thumb" />}</td>
                <td><Link className="row-link" href={`/admin/blog/${p.id}`}>{p.title}</Link><div className="muted" style={{ fontSize: 12, maxWidth: 520, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.excerpt}</div></td>
                <td className="muted">{frDate(p.publishedAt)}</td>
                <td>{p.isPublished ? <span className="pill green">Publié</span> : <span className="pill gray">Brouillon</span>}</td>
                <td><RowActions id={p.id} view={`/blogs/le-miel-un-art-de-vivre/${p.slug}`} viewExternal edit={`/admin/blog/${p.id}`} remove={deletePost} confirm={`Supprimer l’article « ${p.title} » ?`} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!posts.length && <div className="empty">Aucun article.</div>}
      </div>
    </>
  );
}
