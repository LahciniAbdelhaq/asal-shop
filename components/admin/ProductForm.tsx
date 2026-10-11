'use client';

import { useActionState, useRef, useState } from 'react';
import Icon from '@/components/Icon';
import { saveProduct } from '@/app/admin/actions';
import { MediaInput, RichText, SaveBar, Switch, uploadFiles } from './ui';

type Variant = { id?: number; title: string; sku: string; price: number | string; compareAtPrice: number | string | null; stock: number | string; trackStock: boolean; image: string };
export type ProductData = {
  id?: number; title: string; slug: string; subtitle: string; description: string; productType: string; vendor: string; status: string;
  badge: string; optionName: string; featured: boolean; sortOrder: number; seoTitle: string; seoDescription: string;
  images: { url: string; alt: string }[]; variants: Variant[]; categories: number[];
};

export default function ProductForm({ p, categories, types }: { p: ProductData; categories: { id: number; title: string }[]; types: string[] }) {
  const [state, action] = useActionState(saveProduct, null);
  const [images, setImages] = useState(p.images);
  const [variants, setVariants] = useState<Variant[]>(p.variants.length ? p.variants : [{ title: 'Défaut', sku: '', price: '', compareAtPrice: '', stock: 10, trackStock: true, image: '' }]);
  const [cats, setCats] = useState<number[]>(p.categories);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const addImages = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try { const urls = await uploadFiles(files); setImages((im) => [...im, ...urls.map((url) => ({ url, alt: '' }))]); }
    catch (e) { alert((e as Error).message); } finally { setBusy(false); }
  };
  const moveImg = (i: number, d: number) => setImages((im) => { const n = [...im]; const j = i + d; if (j < 0 || j >= n.length) return n; [n[i], n[j]] = [n[j], n[i]]; return n; });
  const setV = (i: number, patch: Partial<Variant>) => setVariants((vs) => vs.map((v, k) => (k === i ? { ...v, ...patch } : v)));

  return (
    <form action={action}>
      {p.id && <input type="hidden" name="id" value={p.id} />}
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <input type="hidden" name="variants" value={JSON.stringify(variants)} />
      <input type="hidden" name="categories" value={JSON.stringify(cats)} />

      <div className="grid-2">
        <div>
          <div className="card card-pad">
            <div className="field"><label>Titre</label><input name="title" defaultValue={p.title} required placeholder="Miel de Thym" /></div>
            <div className="cols-2">
              <div className="field"><label>Sous-titre des cartes</label><input name="subtitle" defaultValue={p.subtitle} placeholder="250 g" /><span className="help">Affiché sous le nom ; si c’est le nom d’une variante, son prix est affiché sur les cartes.</span></div>
              <div className="field"><label>Pastille</label><input name="badge" defaultValue={p.badge} placeholder="Récolte limitée, Nouveau…" /></div>
            </div>
            <div className="field"><label>Description</label><RichText name="description" value={p.description} minHeight={260} /></div>
          </div>

          <div className="card">
            <div className="card-head"><h2>Images</h2><span className="muted">La première image est l’image principale</span></div>
            <div className="card-body">
              <div className="gallery">
                {images.map((im, i) => (
                  <div className="item" key={im.url + i}>
                    <img src={im.url} alt="" />
                    {i === 0 && <span className="main-tag">Principale</span>}
                    <div className="tools">
                      <button type="button" onClick={() => moveImg(i, -1)} aria-label="Avant">←</button>
                      <button type="button" onClick={() => setImages(images.filter((_, k) => k !== i))} aria-label="Supprimer"><Icon name="trash" size={14} /></button>
                      <button type="button" onClick={() => moveImg(i, 1)} aria-label="Après">→</button>
                    </div>
                  </div>
                ))}
                <div className="add" onClick={() => fileRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); addImages(e.dataTransfer.files); }}>
                  <Icon name="upload" size={22} />{busy ? 'Envoi…' : 'Ajouter / glisser des images'}
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { addImages(e.target.files); e.target.value = ''; }} />
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <h2>Variantes, prix &amp; stock</h2>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setVariants([...variants, { title: '', sku: '', price: '', compareAtPrice: '', stock: 0, trackStock: true, image: '' }])}><Icon name="plus" /> Variante</button>
            </div>
            <div className="card-body">
              <div className="field" style={{ marginBottom: 14 }}>
                <label>Nom de l’option</label>
                <input name="optionName" defaultValue={p.optionName} placeholder="Poids, Couleur du coffret… (vide si produit simple)" />
              </div>
              <div className="table-wrap">
                <table className="tbl">
                  <thead><tr><th>Valeur</th><th>Prix (MAD)</th><th>Prix barré</th><th>Stock</th><th>Suivi</th><th>SKU</th><th>Image</th><th /></tr></thead>
                  <tbody>
                    {variants.map((v, i) => (
                      <tr key={v.id ?? `n${i}`}>
                        <td><input className="input" value={v.title} onChange={(e) => setV(i, { title: e.target.value })} placeholder="250 g" style={{ minWidth: 90 }} /></td>
                        <td><input className="input" type="number" step="0.01" min={0} value={v.price} onChange={(e) => setV(i, { price: e.target.value })} style={{ width: 96 }} required /></td>
                        <td><input className="input" type="number" step="0.01" min={0} value={v.compareAtPrice ?? ''} onChange={(e) => setV(i, { compareAtPrice: e.target.value })} style={{ width: 96 }} /></td>
                        <td><input className="input" type="number" min={0} value={v.stock} onChange={(e) => setV(i, { stock: e.target.value })} style={{ width: 80 }} /></td>
                        <td><input type="checkbox" checked={v.trackStock} onChange={(e) => setV(i, { trackStock: e.target.checked })} title="Suivre le stock" style={{ accentColor: 'var(--a-primary)' }} /></td>
                        <td><input className="input" value={v.sku} onChange={(e) => setV(i, { sku: e.target.value })} style={{ width: 120 }} /></td>
                        <td>
                          <select className="input" value={v.image} onChange={(e) => setV(i, { image: e.target.value })} style={{ width: 110 }}>
                            <option value="">—</option>
                            {images.map((im, k) => <option key={im.url} value={im.url}>Image {k + 1}</option>)}
                          </select>
                        </td>
                        <td>{variants.length > 1 && <button type="button" className="btn btn-ghost btn-icon" onClick={() => setVariants(variants.filter((_, k) => k !== i))} aria-label="Supprimer"><Icon name="trash" /></button>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="help muted" style={{ fontSize: 12, marginBottom: 0 }}>Décochez « Suivi » pour vendre sans limite de stock.</p>
            </div>
          </div>

          <div className="card">
            <div className="card-head"><h2>Référencement (SEO)</h2></div>
            <div className="card-body">
              <div className="field"><label>URL</label><div className="input-group"><span className="addon" style={{ borderLeft: '1px solid var(--a-border-strong)', borderRight: 0, borderRadius: '9px 0 0 9px' }}>/products/</span><input name="slug" defaultValue={p.slug} placeholder="généré depuis le titre" style={{ borderRadius: '0 9px 9px 0' }} /></div></div>
              <div className="field"><label>Titre SEO</label><input name="seoTitle" defaultValue={p.seoTitle} /></div>
              <div className="field"><label>Description SEO</label><textarea name="seoDescription" defaultValue={p.seoDescription} /></div>
            </div>
          </div>
        </div>

        <div>
          <div className="card card-pad">
            <div className="field">
              <label>Statut</label>
              <select name="status" defaultValue={p.status}><option value="active">Actif (visible)</option><option value="draft">Brouillon (masqué)</option></select>
            </div>
            <div className="field"><Switch name="featured" defaultChecked={p.featured} label="Produit mis en avant" /></div>
          </div>
          <div className="card">
            <div className="card-head"><h2>Catégories</h2></div>
            <div className="card-body" style={{ display: 'grid', gap: 8 }}>
              {categories.map((c) => (
                <label className="check" key={c.id}>
                  <input type="checkbox" checked={cats.includes(c.id)} onChange={(e) => setCats(e.target.checked ? [...cats, c.id] : cats.filter((x) => x !== c.id))} />
                  {c.title}
                </label>
              ))}
              {!categories.length && <span className="muted">Aucune catégorie.</span>}
            </div>
          </div>
          <div className="card card-pad">
            <div className="field">
              <label>Type de produit</label>
              <input name="productType" defaultValue={p.productType} list="ptypes" placeholder="Miel, Coffret…" />
              <datalist id="ptypes">{types.map((t) => <option key={t} value={t} />)}</datalist>
              <span className="help">Les produits de type « Miel » apparaissent dans le compositeur de coffret.</span>
            </div>
            <div className="field"><label>Marque</label><input name="vendor" defaultValue={p.vendor} /></div>
            <div className="field"><label>Ordre d’affichage</label><input name="sortOrder" type="number" defaultValue={p.sortOrder} /></div>
          </div>
          {images[0] && (
            <div className="card card-pad">
              <label className="lbl">Aperçu de la carte</label>
              <div style={{ marginTop: 10, border: '1px solid var(--a-border)', borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ aspectRatio: '1', background: `#F6EFE2 url('${images[0].url}') center/cover` }} />
              </div>
            </div>
          )}
          <MediaHint />
        </div>
      </div>
      <SaveBar state={state} label={p.id ? 'Enregistrer' : 'Créer le produit'} />
    </form>
  );
}

function MediaHint() {
  const [v, setV] = useState('');
  return (
    <div className="card card-pad">
      <label className="lbl">Envoyer un fichier (lien à copier)</label>
      <div style={{ marginTop: 10 }}><MediaInput value={v} onChange={setV} /></div>
    </div>
  );
}
