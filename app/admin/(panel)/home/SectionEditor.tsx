'use client';

import { useActionState, useState } from 'react';
import { SECTION_SCHEMAS, trFields } from '@/lib/sections';
import type { Locale } from '@/lib/i18n';
import { TranslateForm } from '@/components/admin/Translate';
import SchemaFields from '@/components/admin/SchemaFields';
import { ConfirmButton, SaveBar, Switch, type LinkOption, type PickProduct } from '@/components/admin/ui';
import { saveSection, sectionOp } from '../../actions';

type S = { id: number; type: string; isEnabled: boolean; data: Record<string, unknown> };

export default function SectionEditor({ section, products, links, lang = 'fr' }: { section: S; products: PickProduct[]; links: LinkOption[]; lang?: Locale }) {
  const [state, action] = useActionState(saveSection, null);
  const [data, setData] = useState(section.data);
  const schema = SECTION_SCHEMAS[section.type];
  if (!schema) return <div className="card empty">Type de section inconnu : {section.type}</div>;
  if (lang !== 'fr') return <TranslateForm entity="section" id={section.id} lang={lang} title={schema.label} fields={trFields(schema.fields)} initial={section.data} />;
  return (
    <>
      <form action={action}>
        <input type="hidden" name="id" value={section.id} />
        <input type="hidden" name="data" value={JSON.stringify(data)} />
        <div className="card">
          <div className="card-head">
            <div><h2>{schema.label}</h2><div className="muted" style={{ fontSize: 12.5 }}>{schema.description}</div></div>
            <Switch name="isEnabled" defaultChecked={section.isEnabled} label="Visible" />
          </div>
          <div className="card-body">
            <SchemaFields fields={schema.fields} value={data} onChange={setData} ctx={{ products, links }} />
          </div>
        </div>
        <SaveBar state={state} />
      </form>
      <form action={sectionOp} style={{ marginTop: 14, textAlign: 'right' }}>
        <input type="hidden" name="id" value={section.id} /><input type="hidden" name="op" value="delete" />
        <ConfirmButton message="Supprimer définitivement cette section ?">Supprimer la section</ConfirmButton>
      </form>
    </>
  );
}
