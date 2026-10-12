import Link from 'next/link';
import { notFound } from 'next/navigation';
import Icon from '@/components/Icon';
import { db } from '@/lib/db';
import { ConfirmButton } from '@/components/admin/ui';
import { LangTabs, TranslateForm } from '@/components/admin/Translate';
import { asLocale, parseI18n } from '@/lib/i18n';
import { deletePage } from '../../../actions';
import PageForm from './PageForm';

export default async function PageEdit({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ lang?: string }> }) {
  const { id } = await params;
  const p = id === 'new' ? null : await db.page.findUnique({ where: { id: Number(id) } });
  if (id !== 'new' && !p) notFound();
  const lang = p ? asLocale((await searchParams).lang) : 'fr';
  const tr = p ? parseI18n(p.i18n)[lang] || {} : {};
  const faq = (raw: string) => { try { const v = JSON.parse(raw); return Array.isArray(v) ? v : []; } catch { return []; } };
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
      {p && <LangTabs current={lang} />}
      {p && lang !== 'fr' ? (
        <TranslateForm key={lang} entity="page" id={p.id} lang={lang} title="Page"
          fields={[
            { key: 'title', label: 'Titre', type: 'text' },
            p.template === 'faq'
              ? { key: 'content', label: 'Questions / réponses', type: 'list', itemLabel: 'q', fields: [{ key: 'q', label: 'Question', type: 'text' }, { key: 'a', label: 'Réponse', type: 'textarea' }] }
              : { key: 'content', label: 'Contenu', type: 'html' },
            { key: 'seoTitle', label: 'Titre SEO', type: 'text' },
            { key: 'seoDescription', label: 'Description SEO', type: 'textarea' },
          ]}
          initial={{
            title: tr.title || p.title,
            content: p.template === 'faq' ? faq(tr.content || p.content) : tr.content || p.content,
            seoTitle: tr.seoTitle || p.seoTitle, seoDescription: tr.seoDescription || p.seoDescription,
          }}
        />
      ) : <PageForm p={p ? { id: p.id, title: p.title, slug: p.slug, content: p.content, template: p.template, isPublished: p.isPublished, seoTitle: p.seoTitle, seoDescription: p.seoDescription } : null} />}
    </>
  );
}
