'use client';

import { useActionState, useState } from 'react';
import { savePromo } from '../../../actions';
import { SaveBar, Switch } from '@/components/admin/ui';

type P = { id: number; code: string; type: string; value: number; minSubtotal: number; maxUses: number | null; usedCount: number; startsAt: string; endsAt: string; isActive: boolean } | null;

export default function PromoForm({ p }: { p: P }) {
  const [state, action] = useActionState(savePromo, null);
  const [type, setType] = useState(p?.type || 'percent');
  const [code, setCode] = useState(p?.code || '');
  const gen = () => setCode('ASAL' + Math.random().toString(36).slice(2, 7).toUpperCase());
  return (
    <form action={action} style={{ maxWidth: 760 }}>
      {p && <input type="hidden" name="id" value={p.id} />}
      <div className="card card-pad">
        <div className="field">
          <label>Code</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input name="code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required style={{ fontFamily: 'ui-monospace, monospace', textTransform: 'uppercase' }} placeholder="BIENVENUE10" />
            <button type="button" className="btn btn-secondary" onClick={gen}>Générer</button>
          </div>
          <span className="help">Les clients saisissent ce code à l’étape de commande.</span>
        </div>
        <div className="cols-2">
          <div className="field">
            <label>Type de réduction</label>
            <select name="type" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="percent">Pourcentage</option>
              <option value="fixed">Montant fixe (MAD)</option>
              <option value="free_shipping">Livraison offerte</option>
            </select>
          </div>
          {type !== 'free_shipping' && (
            <div className="field">
              <label>Valeur</label>
              <div className="input-group"><input name="value" type="number" step="0.01" min={0} defaultValue={p?.value ?? 10} required /><span className="addon">{type === 'percent' ? '%' : 'MAD'}</span></div>
            </div>
          )}
        </div>
        <div className="cols-2">
          <div className="field"><label>Montant minimum de commande</label><div className="input-group"><input name="minSubtotal" type="number" min={0} defaultValue={p?.minSubtotal ?? 0} /><span className="addon">MAD</span></div></div>
          <div className="field"><label>Nombre max. d’utilisations</label><input name="maxUses" type="number" min={1} defaultValue={p?.maxUses ?? ''} placeholder="Illimité" />{p && <span className="help">Déjà utilisé {p.usedCount} fois.</span>}</div>
        </div>
        <div className="cols-2">
          <div className="field"><label>Début</label><input name="startsAt" type="datetime-local" defaultValue={p?.startsAt} /></div>
          <div className="field"><label>Fin</label><input name="endsAt" type="datetime-local" defaultValue={p?.endsAt} /></div>
        </div>
        <div className="field"><Switch name="isActive" defaultChecked={p?.isActive ?? true} label="Code actif" /></div>
      </div>
      <SaveBar state={state} label={p ? 'Enregistrer' : 'Créer le code'} />
    </form>
  );
}
