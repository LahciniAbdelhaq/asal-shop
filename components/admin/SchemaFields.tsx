'use client';

import Icon, { ICON_NAMES } from '@/components/Icon';
import type { Field } from '@/lib/sections';
import { ColorInput, LinkInput, MediaInput, ProductPicker, RichText, Switch, type LinkOption, type PickProduct } from './ui';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Ctx = { products: PickProduct[]; links: LinkOption[] };
type V = Record<string, any>;

const REASSURANCE_ICONS = ['gift', 'truck', 'leaf', 'chat', 'hexagon', 'shield', 'drop', 'flask', 'box', 'lock', 'card', 'tag', 'star', 'heart', 'phone', 'mail', 'clock', 'check'];

function IconPick({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {REASSURANCE_ICONS.filter((n) => ICON_NAMES.includes(n)).map((n) => (
        <button key={n} type="button" title={n} onClick={() => onChange(n)} className="btn btn-secondary btn-icon"
          style={value === n ? { borderColor: 'var(--a-primary)', background: 'var(--a-primary-soft)', color: 'var(--a-primary)' } : undefined}>
          <Icon name={n} size={18} />
        </button>
      ))}
    </div>
  );
}

function ListField({ f, value, onChange, ctx }: { f: Extract<Field, { type: 'list' }>; value: V[]; onChange: (v: V[]) => void; ctx: Ctx }) {
  const items = Array.isArray(value) ? value : [];
  const set = (i: number, v: V) => onChange(items.map((x, k) => (k === i ? v : x)));
  const move = (i: number, d: number) => { const n = [...items]; const j = i + d; if (j < 0 || j >= n.length) return; [n[i], n[j]] = [n[j], n[i]]; onChange(n); };
  const stop = (fn: () => void) => (e: React.MouseEvent) => { e.preventDefault(); fn(); };
  return (
    <div className="rep">
      {items.map((it, i) => (
        <details className="rep-item" key={i}>
          <summary>
            <span style={{ color: 'var(--a-muted)', fontWeight: 500 }}>{i + 1}.</span> {String(it[f.itemLabel || ''] || '').replace(/<[^>]+>/g, '') || `Élément ${i + 1}`}
            <span className="tools">
              <button type="button" className="btn btn-ghost btn-sm" onClick={stop(() => move(i, -1))} title="Monter">↑</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={stop(() => move(i, 1))} title="Descendre">↓</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={stop(() => onChange([...items.slice(0, i + 1), structuredClone(it), ...items.slice(i + 1)]))} title="Dupliquer"><Icon name="copy" /></button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={stop(() => onChange(items.filter((_, k) => k !== i)))} title="Supprimer"><Icon name="trash" /></button>
            </span>
          </summary>
          <div className="body"><SchemaFields fields={f.fields} value={it} onChange={(v) => set(i, v)} ctx={ctx} /></div>
        </details>
      ))}
      <button type="button" className="btn btn-secondary btn-sm" style={{ justifySelf: 'start' }} onClick={() => onChange([...items, {}])}><Icon name="plus" /> Ajouter</button>
    </div>
  );
}

export default function SchemaFields({ fields, value, onChange, ctx }: { fields: Field[]; value: V; onChange: (v: V) => void; ctx: Ctx }) {
  const set = (k: string, v: unknown) => onChange({ ...value, [k]: v });
  return (
    <>
      {fields.map((f) => {
        const v = value[f.key];
        let input: React.ReactNode;
        switch (f.type) {
          case 'text': input = <input value={v ?? ''} onChange={(e) => set(f.key, e.target.value)} />; break;
          case 'textarea': input = <textarea value={v ?? ''} onChange={(e) => set(f.key, e.target.value)} />; break;
          case 'html': input = <RichText value={v ?? ''} onChange={(x) => set(f.key, x)} />; break;
          case 'number': input = <input type="number" min={f.min} max={f.max} value={v ?? ''} onChange={(e) => set(f.key, e.target.value === '' ? '' : Number(e.target.value))} style={{ maxWidth: 140 }} />; break;
          case 'boolean': input = <Switch checked={!!v} onChange={(x) => set(f.key, x)} label={f.label} />; break;
          case 'select': input = <select value={v ?? ''} onChange={(e) => set(f.key, e.target.value)}>{f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>; break;
          case 'image': input = <MediaInput value={v ?? ''} onChange={(x) => set(f.key, x)} />; break;
          case 'video': input = <MediaInput kind="video" value={v ?? ''} onChange={(x) => set(f.key, x)} />; break;
          case 'link': input = <LinkInput value={v ?? ''} onChange={(x) => set(f.key, x)} links={ctx.links} />; break;
          case 'color': input = <ColorInput value={v ?? ''} onChange={(x) => set(f.key, x)} />; break;
          case 'icon': input = <IconPick value={v ?? ''} onChange={(x) => set(f.key, x)} />; break;
          case 'products': input = <ProductPicker products={ctx.products} value={Array.isArray(v) ? v : []} onChange={(x) => set(f.key, x)} />; break;
          case 'product': input = <ProductPicker single products={ctx.products} value={v ? [v] : []} onChange={(x) => set(f.key, x[0] || '')} />; break;
          case 'strings': input = <textarea value={Array.isArray(v) ? v.join('\n') : ''} onChange={(e) => set(f.key, e.target.value.split('\n'))} />; break;
          case 'list': input = <ListField f={f} value={v} onChange={(x) => set(f.key, x)} ctx={ctx} />; break;
        }
        return (
          <div className="field" key={f.key}>
            {f.type !== 'boolean' && <label>{f.label}</label>}
            {input}
            {f.help && <span className="help">{f.help}</span>}
          </div>
        );
      })}
    </>
  );
}
