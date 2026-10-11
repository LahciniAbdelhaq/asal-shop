import Link from 'next/link';
import { notFound } from 'next/navigation';
import Icon from '@/components/Icon';
import { db } from '@/lib/db';
import { frDateTime } from '@/lib/format';
import { PAGE_TEMPLATES } from '@/lib/defaults';

export const metadata = { title: 'Détails de la page' };

export default async function PageDetails({ params }: { params: Promise<{ id: string }> }) {
  const p = await db.page.findUnique({ where: { id: Number((await params).id) } });
  if (!p) notFound();
  let faq: { q: string; a: string }[] | null = null;
  if (p.template === 'faq') { try { faq = JSON.parse(p.content); } catch { /* contenu libre */ } }
  const url = `/${p.template === 'policy' ? 'policies' : 'pages'}/${p.slug}`;

  return (
    <>
      <Link href="/admin/pages" className="back-link">← Pages</Link>
      <div className="page-title">
        <div>
          <h1 style={{ display: 'flex', gap: 10, alignItems: 'center' }}>{p.title} {p.isPublished ? <span className="pill green">Publiée</span> : <span className="pill gray">Brouillon</span>}</h1>
          <p>{url} · {PAGE_TEMPLATES[p.template] || p.template} · modifiée le {frDateTime(p.updatedAt)}</p>
        </div>
        <div className="actions"><Link className="btn" href={`/admin/pages/${p.id}`}><Icon name="edit" /> Modifier</Link></div>
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-head"><h2>{faq ? `Questions (${faq.length})` : 'Contenu'}</h2></div>
          <div className="card-body prose">
            {faq ? (
              faq.map((f, i) => <div key={i} style={{ marginBottom: 14 }}><strong>{f.q}</strong><div className="muted">{f.a}</div></div>)
            ) : p.content ? (
              <div dangerouslySetInnerHTML={{ __html: p.content }} />
            ) : (
              <p className="muted">{p.template === 'composer' ? 'Page du compositeur de coffret (réglages dans Paramètres → Compositeur).' : p.template === 'contact' ? 'Page de contact : le formulaire est affiché automatiquement.' : 'Aucun contenu.'}</p>
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-head"><h2>Informations</h2></div>
          <div className="card-body">
            <dl className="kv">
              <dt>URL</dt><dd>{url}</dd>
              <dt>Modèle</dt><dd>{PAGE_TEMPLATES[p.template] || p.template}</dd>
              <dt>Titre SEO</dt><dd>{p.seoTitle || <span className="muted">(titre de la page)</span>}</dd>
              <dt>Description</dt><dd>{p.seoDescription || <span className="muted">—</span>}</dd>
            </dl>
          </div>
        </div>
      </div>
    </>
  );
}
