'use client';

import { useActionState, useState } from 'react';
import { saveCategory } from '../../../actions';
import { MediaInput, ProductPicker, RichText, SaveBar, Switch, type PickProduct } from '@/components/admin/ui';

type C = { id: number; title: string; slug: string; description: string; image: string; sortOrder: number; isActive: boolean; seoTitle: string; seoDescription: string; products: number[] } | null;

export default function CategoryForm({ c, products }: { c: C; products: PickProduct[] }) {
  const [state, action] = useActionState(saveCategory, null);
  const [image, setImage] = useState(c?.image || '');
  const [items, setItems] = useState<(string | number)[]>(c?.products || []);
  return (
    <form action={action}>
      {c && <input type="hidden" name="id" value={c.id} />}
      <input type="hidden" name="products" value={JSON.stringify(items)} />
      <div className="grid-2">
        <div>
          <div className="card card-pad">
            <div className="field"><label>Nom</label><input name="title" defaultValue={c?.title} required /></div>
            <div className="field"><label>Description</label><RichText name="description" value={c?.description || ''} minHeight={120} /></div>
          </div>
          <div className="card">
            <div className="card-head"><h2>Produits de la catégorie</h2><span className="muted">{items.length}</span></div>
            <div className="card-body"><ProductPicker products={products} value={items} onChange={setItems} by="id" /></div>
          </div>
          <div className="card">
            <div className="card-head"><h2>Référencement (SEO)</h2></div>
            <div className="card-body">
              <div className="field"><label>URL</label><div className="input-group"><span className="addon" style={{ borderLeft: '1px solid var(--a-border-strong)', borderRight: 0, borderRadius: '9px 0 0 9px' }}>/collections/</span><input name="slug" defaultValue={c?.slug} placeholder="généré depuis le nom" style={{ borderRadius: '0 9px 9px 0' }} /></div></div>
              <div className="field"><label>Titre SEO</label><input name="seoTitle" defaultValue={c?.seoTitle} /></div>
              <div className="field"><label>Description SEO</label><textarea name="seoDescription" defaultValue={c?.seoDescription} /></div>
            </div>
          </div>
        </div>
        <div>
          <div className="card card-pad">
            <div className="field"><Switch name="isActive" defaultChecked={c?.isActive ?? true} label="Visible sur la boutique" /></div>
            <div className="field"><label>Ordre d’affichage</label><input name="sortOrder" type="number" defaultValue={c?.sortOrder ?? 0} /></div>
          </div>
          <div className="card card-pad">
            <label className="lbl">Image</label>
            <div style={{ marginTop: 10 }}><MediaInput name="image" value={image} onChange={setImage} /></div>
          </div>
        </div>
      </div>
      <SaveBar state={state} label={c ? 'Enregistrer' : 'Créer la catégorie'} />
    </form>
  );
}
