'use client';

import { useActionState, useState } from 'react';
import { trFields, type Field } from '@/lib/sections';
import type { Locale } from '@/lib/i18n';
import { TranslateForm } from './Translate';
import { resetSettings, saveSettings } from '@/app/admin/actions';
import SchemaFields from './SchemaFields';
import { ConfirmButton, SaveBar, type LinkOption, type PickProduct } from './ui';

/* eslint-disable @typescript-eslint/no-explicit-any */
/** Carte de réglages générique : un réglage (clé) + ses champs décrits par un schéma. */
export default function SettingsCard({ k, title, description, initial, fields, links = [], products = [], render, lang = 'fr' }: {
  k: string; title: string; description?: string; initial: Record<string, any>; fields?: Field[];
  links?: LinkOption[]; products?: PickProduct[];
  render?: (v: Record<string, any>, set: (v: Record<string, any>) => void) => React.ReactNode;
  lang?: Locale;
}) {
  const [state, action] = useActionState(saveSettings, null);
  const [rstate, reset] = useActionState(resetSettings, null);
  const [value, setValue] = useState(initial);
  if (lang !== 'fr') {
    // couleurs, polices… : pas de texte à traduire
    return <TranslateForm entity="setting" id={k} lang={lang} title={title} fields={render ? [] : trFields(fields || [])} initial={initial} />;
  }
  return (
    <div className="card" id={k}>
      <div className="card-head">
        <div><h2>{title}</h2>{description && <div className="muted" style={{ fontSize: 12.5 }}>{description}</div>}</div>
        <form action={reset}>
          <input type="hidden" name="key" value={k} />
          <ConfirmButton className="btn btn-ghost btn-sm" title="Valeurs par défaut" message="Restaurer les valeurs par défaut de cette rubrique ?">Réinitialiser</ConfirmButton>
        </form>
      </div>
      <form action={action}>
        <input type="hidden" name="key" value={k} />
        <input type="hidden" name="value" value={JSON.stringify(value)} />
        <div className="card-body">
          {rstate?.ok && <div className="alert ok">{rstate.message} Rechargez la page pour voir les valeurs.</div>}
          {render ? render(value, setValue) : <SchemaFields fields={fields || []} value={value} onChange={setValue} ctx={{ links, products }} />}
        </div>
        <div style={{ padding: '0 20px 20px' }}><SaveBar state={state} /></div>
      </form>
    </div>
  );
}
