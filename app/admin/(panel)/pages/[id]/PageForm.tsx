'use client';

import { useActionState, useState } from 'react';
import Icon from '@/components/Icon';
import { PAGE_TEMPLATES } from '@/lib/defaults';
import { savePage } from '../../../actions';
import { RichText, SaveBar, Switch } from '@/components/admin/ui';

type P = { id: number; title: string; slug: string; content: string; template: string; isPublished: boolean; seoTitle: string; seoDescription: string } | null;
type QA = { q: string; a: string };

function FaqEditor({ value, onChange }: { value: QA[]; onChange: (v: QA[]) => void }) {
  const set = (i: number, patch: Partial<QA>) => onChange(value.map((x, k) => (k === i ? { ...x, ...patch } : x)));
  const move = (i: number, d: number) => { const n = [...value]; const j = i + d; if (j < 0 || j >= n.length) return; [n[i], n[j]] = [n[j], n[i]]; onChange(n); };
  return (
    <div className="rep">
      {value.map((qa, i) => (
        <details className="rep-item" key={i} open={!qa.q}>
          <summary>
            {qa.q || 'Nouvelle question'}
            <span className="tools">
              <button type="button" className="btn btn-ghost btn-sm" onClick={(e) => { e.preventDefault(); move(i, -1); }}>↑</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={(e) => { e.preventDefault(); move(i, 1); }}>↓</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={(e) => { e.preventDefault(); onChange(value.filter((_, k) => k !== i)); }}><Icon name="trash" /></button>
            </span>
          </summary>
          <div className="body">
            <div className="field"><label>Question</label><input value={qa.q} onChange={(e) => set(i, { q: e.target.value })} /></div>
            <div className="field"><label>Réponse</label><textarea value={qa.a} onChange={(e) => set(i, { a: e.target.value })} /></div>
          </div>
        </details>
      ))}
      <button type="button" className="btn btn-secondary" onClick={() => onChange([...value, { q: '', a: '' }])}><Icon name="plus" /> Ajouter une question</button>
    </div>
  );
}

export default function PageForm({ p }: { p: P }) {
  const [state, action] = useActionState(savePage, null);
  const [template, setTemplate] = useState(p?.template || 'default');
  const [content, setContent] = useState(p?.content || '');
  const [faq, setFaq] = useState<QA[]>(() => { try { const v = JSON.parse(p?.content || '[]'); return Array.isArray(v) ? v : []; } catch { return []; } });
  const isFaq = template === 'faq';

  return (
    <form action={action}>
      {p && <input type="hidden" name="id" value={p.id} />}
      <input type="hidden" name="content" value={isFaq ? JSON.stringify(faq) : content} />
      <div className="grid-2">
        <div>
          <div className="card card-pad">
            <div className="field"><label>Titre</label><input name="title" defaultValue={p?.title} required /></div>
            <div className="field">
              <label>{isFaq ? 'Questions / réponses' : template === 'composer' ? 'Texte (le compositeur se règle dans Paramètres → Compositeur)' : template === 'contact' ? 'Texte affiché au-dessus du formulaire (facultatif)' : 'Contenu'}</label>
              {isFaq ? <FaqEditor value={faq} onChange={setFaq} /> : <RichText value={content} onChange={setContent} minHeight={320} />}
            </div>
          </div>
          <div className="card">
            <div className="card-head"><h2>Référencement (SEO)</h2></div>
            <div className="card-body">
              <div className="field"><label>URL (slug)</label><input name="slug" defaultValue={p?.slug} placeholder="généré depuis le titre" /></div>
              <div className="field"><label>Titre SEO</label><input name="seoTitle" defaultValue={p?.seoTitle} /></div>
              <div className="field"><label>Description SEO</label><textarea name="seoDescription" defaultValue={p?.seoDescription} /></div>
            </div>
          </div>
        </div>
        <div>
          <div className="card card-pad">
            <div className="field"><Switch name="isPublished" defaultChecked={p?.isPublished ?? true} label="Publiée" /></div>
            <div className="field">
              <label>Modèle</label>
              <select name="template" value={template} onChange={(e) => setTemplate(e.target.value)}>
                {Object.entries(PAGE_TEMPLATES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <span className="help">Les pages légales sont servies sous /policies/…, les autres sous /pages/….</span>
            </div>
          </div>
        </div>
      </div>
      <SaveBar state={state} label={p ? 'Enregistrer' : 'Créer la page'} />
    </form>
  );
}
