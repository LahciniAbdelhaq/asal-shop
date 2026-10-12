'use client';

import { useActionState, useMemo, useState } from 'react';
import type { Dict, DictKey } from '@/lib/dict';
import type { Locale } from '@/lib/i18n';
import { SaveBar } from '@/components/admin/ui';
import { saveStrings } from '../../actions';

export default function StringsForm({ lang, groups, fr, defaults, initial }: {
  lang: Locale;
  groups: { label: string; keys: DictKey[] }[];
  fr: Dict;
  defaults: Dict;
  initial: Dict;
}) {
  const [state, action] = useActionState(saveStrings, null);
  const [v, setV] = useState<Dict>(initial);
  const [q, setQ] = useState('');
  const needle = q.trim().toLowerCase();
  const shown = useMemo(
    () => groups.map((g) => ({ ...g, keys: g.keys.filter((k) => !needle || [k, fr[k], v[k]].some((x) => x.toLowerCase().includes(needle))) })).filter((g) => g.keys.length),
    [groups, needle, fr, v],
  );
  const changed = (Object.keys(defaults) as DictKey[]).filter((k) => v[k] !== defaults[k]).length;

  return (
    <form action={action}>
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="data" value={JSON.stringify(v)} />
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
        <input className="input" placeholder="Rechercher un texte…" value={q} onChange={(e) => setQ(e.target.value)} style={{ flex: 1 }} />
        <span className="muted" style={{ fontSize: 12.5, whiteSpace: 'nowrap' }}>{changed} texte{changed > 1 ? 's' : ''} personnalisé{changed > 1 ? 's' : ''}</span>
      </div>
      {shown.map((g) => (
        <details key={g.label} className="rep-item" open={!!needle} style={{ marginBottom: 8 }}>
          <summary>{g.label} <span className="muted" style={{ fontWeight: 400 }}>· {g.keys.length}</span></summary>
          <div className="body" style={{ display: 'grid', gap: 10 }}>
            {g.keys.map((k) => (
              <div className="field" key={k} style={{ margin: 0 }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span>{fr[k]}</span>
                  {v[k] !== defaults[k] && (
                    <button type="button" className="btn btn-ghost btn-sm" style={{ padding: '0 6px' }} onClick={() => setV({ ...v, [k]: defaults[k] })} title="Revenir au texte d’origine">↺</button>
                  )}
                </label>
                <input dir={lang === 'ar' ? 'rtl' : 'ltr'} lang={lang} value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} />
                {/\{\w+\}/.test(defaults[k]) && <span className="help">Gardez les éléments entre accolades, ex. {defaults[k].match(/\{\w+\}/g)?.join(' ')}</span>}
              </div>
            ))}
          </div>
        </details>
      ))}
      <SaveBar state={state} label="Enregistrer les textes" />
    </form>
  );
}
