import Link from 'next/link';
import { notFound } from 'next/navigation';
import Icon from '@/components/Icon';
import { db } from '@/lib/db';
import { ConfirmButton } from '@/components/admin/ui';
import { deletePage } from '../../../actions';
import PageForm from './PageForm';

export default async function PageEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = id === 'new' ? null : await db.page.findUnique({ where: { id: Number(id) } });
  if (id !== 'new' && !p) notFound();
  return (
    <>
      <Link href="/admin/pages" className="back-link">← Pages</Link>
      <div className="page-title">
        <h1>{p ? p.title : 'Nouvelle page'}</h1>
        {p && (
          <div className="actions">
            <a className="btn btn-secondary" href={`/${p.template === 'policy' ? 'policies' : 'pages'}/${p.slug}`} target="_blank" rel="noreferrer"><Icon name="eye" /> Voir</a>
            <form action={deletePage}><input type="hidden" name="id" value={p.id} /><ConfirmButton className="btn btn-danger" message={`Supprimer la page « ${p.title} » ?`}>Supprimer</ConfirmButton></form>
          </div>
        )}
      </div>
      <PageForm p={p ? { id: p.id, title: p.title, slug: p.slug, content: p.content, template: p.template, isPublished: p.isPublished, seoTitle: p.seoTitle, seoDescription: p.seoDescription } : null} />
    </>
  );
}
