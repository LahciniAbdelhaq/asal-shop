'use client';

import { useActionState, useState } from 'react';
import { savePost } from '../../../actions';
import { MediaInput, RichText, SaveBar, Switch } from '@/components/admin/ui';

type P = { id: number; title: string; slug: string; excerpt: string; content: string; image: string; author: string; isPublished: boolean; publishedAt: string } | null;

export default function PostForm({ p }: { p: P }) {
  const [state, action] = useActionState(savePost, null);
  const [image, setImage] = useState(p?.image || '');
  return (
    <form action={action}>
      {p && <input type="hidden" name="id" value={p.id} />}
      <div className="grid-2">
        <div>
          <div className="card card-pad">
            <div className="field"><label>Titre</label><input name="title" defaultValue={p?.title} required /></div>
            <div className="field"><label>Extrait (cartes du blog)</label><textarea name="excerpt" defaultValue={p?.excerpt} /></div>
            <div className="field"><label>Contenu</label><RichText name="content" value={p?.content || ''} minHeight={380} /></div>
          </div>
        </div>
        <div>
          <div className="card card-pad">
            <div className="field"><Switch name="isPublished" defaultChecked={p?.isPublished ?? true} label="Publié" /></div>
            <div className="field"><label>Date de publication</label><input name="publishedAt" type="date" defaultValue={p?.publishedAt || new Date().toISOString().slice(0, 10)} /></div>
            <div className="field"><label>Auteur</label><input name="author" defaultValue={p?.author || 'ASAL'} /></div>
            <div className="field"><label>URL (slug)</label><input name="slug" defaultValue={p?.slug} placeholder="généré depuis le titre" /></div>
          </div>
          <div className="card card-pad">
            <label className="lbl">Image à la une</label>
            <div style={{ marginTop: 10 }}><MediaInput name="image" value={image} onChange={setImage} /></div>
          </div>
        </div>
      </div>
      <SaveBar state={state} label={p ? 'Enregistrer' : 'Publier l’article'} />
    </form>
  );
}
