'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useActionState, useState } from 'react';
import type { Field } from '@/lib/sections';
import { LOCALE_NAMES, LOCALES, type Locale } from '@/lib/i18n';
import { saveTranslation } from '@/app/admin/actions';
import SchemaFields from './SchemaFields';
import { SaveBar } from './ui';

/** Onglets de langue d'un formulaire : le français est la version d'origine, les autres sont des traductions. */
export function LangTabs({ current, note }: { current: Locale; note?: string }) {
  const path = usePathname();
  const sp = useSearchParams();
  const href = (l: Locale) => {
    const q = new URLSearchParams(sp.toString());
    if (l === 'fr') q.delete('lang'); else q.set('lang', l);
    q.delete('created');
    const s = q.toString();
    return `${path}${s ? `?${s}` : ''}`;
  };
  return (
    <div className="lang-tabs">
      <span className="lang-tabs__label">Langue du contenu</span>
      <div className="tabs">
        {LOCALES.map((l) => (
          <Link key={l} href={href(l)} className={l === current ? 'on' : ''} lang={l}>
            {LOCALE_NAMES[l]}{l === 'fr' ? ' (original)' : ''}
          </Link>
        ))}
      </div>
      {note && <span className="muted" style={{ fontSize: 12.5 }}>{note}</span>}
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Formulaire de traduction générique : seuls les textes sont proposés.
 * Un texte laissé identique au français (ou vidé) suit automatiquement la version française.
 */
export function TranslateForm({ entity, id, lang, fields, initial, title }: {
  entity: 'product' | 'category' | 'page' | 'post' | 'section' | 'setting';
  id: string | number;
  lang: Locale;
  fields: Field[];
  initial: Record<string, any>;
  title?: string;
}) {
  const [state, action] = useActionState(saveTranslation, null);
  const [value, setValue] = useState(initial);
  return (
    <form action={action} dir={lang === 'ar' ? 'rtl' : undefined}>
      <input type="hidden" name="entity" value={entity} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="data" value={JSON.stringify(value)} />
      <div className="card">
        <div className="card-head">
          <div>
            <h2>{title || 'Traduction'} — {LOCALE_NAMES[lang]}</h2>
            <div className="muted" style={{ fontSize: 12.5 }} dir="ltr">
              Les champs sont pré-remplis avec le français : remplacez-les par la traduction. Un texte non modifié suit la version française.
            </div>
          </div>
        </div>
        <div className="card-body">
          {fields.length ? (
            <SchemaFields fields={fields} value={value} onChange={setValue} ctx={{ products: [], links: [], fixed: true }} />
          ) : (
            <p className="muted">Rien à traduire ici : cette rubrique ne contient pas de texte.</p>
          )}
        </div>
      </div>
      {fields.length > 0 && <div dir="ltr"><SaveBar state={state} label="Enregistrer la traduction" /></div>}
    </form>
  );
}
