import Link from 'next/link';
import Icon from '@/components/Icon';
import { db } from '@/lib/db';
import { frDateTime } from '@/lib/format';
import { PAGE_TEMPLATES } from '@/lib/defaults';

export const metadata = { title: 'Pages' };

export default async function PagesPage() {
  const pages = await db.page.findMany({ orderBy: { title: 'asc' } });
  return (
    <>
      <div className="page-title">
        <div><h1>Pages</h1><p>Pages de contenu, légales, contact, FAQ…</p></div>
        <div className="actions"><Link className="btn" href="/admin/pages/new"><Icon name="plus" /> Nouvelle page</Link></div>
      </div>
      <div className="card table-wrap">
        <table className="tbl">
          <thead><tr><th>Titre</th><th>URL</th><th>Modèle</th><th>Statut</th><th>Modifiée</th><th /></tr></thead>
          <tbody>
            {pages.map((p) => {
              const url = `/${p.template === 'policy' ? 'policies' : 'pages'}/${p.slug}`;
              return (
                <tr key={p.id}>
                  <td><Link className="row-link" href={`/admin/pages/${p.id}`}>{p.title}</Link></td>
                  <td className="muted">{url}</td>
                  <td>{PAGE_TEMPLATES[p.template] || p.template}</td>
                  <td>{p.isPublished ? <span className="pill green">Publiée</span> : <span className="pill gray">Brouillon</span>}</td>
                  <td className="muted">{frDateTime(p.updatedAt)}</td>
                  <td className="num"><a className="btn btn-ghost btn-sm" href={url} target="_blank" rel="noreferrer"><Icon name="external" /></a></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
