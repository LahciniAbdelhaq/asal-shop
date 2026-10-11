import Link from 'next/link';
import Icon from '@/components/Icon';
import { db } from '@/lib/db';
import { SECTION_SCHEMAS } from '@/lib/sections';
import { getLinkOptions, getPickProducts } from '@/lib/admin-data';
import { addSection, sectionOp } from '../../actions';
import SectionEditor from './SectionEditor';

export const metadata = { title: 'Page d’accueil' };

const summary = (data: string) => {
  try {
    const d = JSON.parse(data);
    return String(d.title || d.heading || d.eyebrow || (d.items?.[0]?.title ?? '') || d.html || '').replace(/<[^>]+>/g, ' ').trim();
  } catch { return ''; }
};

export default async function HomeBuilder({ searchParams }: { searchParams: Promise<{ s?: string }> }) {
  const sel = Number((await searchParams).s);
  const [sections, products, links] = await Promise.all([db.homeSection.findMany({ orderBy: { position: 'asc' } }), getPickProducts(), getLinkOptions()]);
  const current = sections.find((s) => s.id === sel) || null;
  const Op = ({ id, op, children, title }: { id: number; op: string; children: React.ReactNode; title: string }) => (
    <form action={sectionOp}><input type="hidden" name="id" value={id} /><input type="hidden" name="op" value={op} /><button className="btn btn-ghost btn-sm btn-icon" title={title}>{children}</button></form>
  );

  return (
    <>
      <div className="page-title">
        <div><h1>Page d’accueil</h1><p>Ordre, visibilité et contenu de chaque section. Les modifications sont visibles immédiatement sur la boutique.</p></div>
        <div className="actions"><a className="btn btn-secondary" href="/" target="_blank" rel="noreferrer"><Icon name="eye" /> Aperçu</a></div>
      </div>
      <div className="grid-2" style={{ gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.4fr)' }}>
        <div>
          <div className="card card-pad">
            <div className="section-list">
              {sections.map((s, i) => (
                <div key={s.id} className={`section-row${s.isEnabled ? '' : ' off'}${s.id === sel ? ' active' : ''}`}>
                  <div className="grip">
                    {i > 0 && <Op id={s.id} op="up" title="Monter">▲</Op>}
                    {i < sections.length - 1 && <Op id={s.id} op="down" title="Descendre">▼</Op>}
                  </div>
                  <Link href={`/admin/home?s=${s.id}`} className="meta" style={{ textDecoration: 'none' }}>
                    <strong>{SECTION_SCHEMAS[s.type]?.label || s.type}</strong>
                    <span>{s.isEnabled ? '' : 'Masquée · '}{summary(s.data) || SECTION_SCHEMAS[s.type]?.description}</span>
                  </Link>
                  <Op id={s.id} op="toggle" title={s.isEnabled ? 'Masquer' : 'Afficher'}><Icon name="eye" /></Op>
                  <Op id={s.id} op="duplicate" title="Dupliquer"><Icon name="copy" /></Op>
                  <Link className="btn btn-ghost btn-sm btn-icon" href={`/admin/home?s=${s.id}`} title="Modifier"><Icon name="edit" /></Link>
                </div>
              ))}
            </div>
            <form action={addSection} style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <select name="type" className="input">
                {Object.entries(SECTION_SCHEMAS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <button className="btn"><Icon name="plus" /> Ajouter</button>
            </form>
          </div>
        </div>
        <div>
          {current ? (
            <SectionEditor
              key={current.id}
              section={{ id: current.id, type: current.type, isEnabled: current.isEnabled, data: (() => { try { return JSON.parse(current.data); } catch { return {}; } })() }}
              products={products}
              links={links}
            />
          ) : (
            <div className="card empty">Sélectionnez une section à modifier.</div>
          )}
        </div>
      </div>
    </>
  );
}
