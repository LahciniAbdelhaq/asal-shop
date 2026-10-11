'use client';

import { useActionState } from 'react';
import { saveCustomer } from '../../../actions';
import { SaveBar, Switch } from '@/components/admin/ui';

type C = { id: number; email: string; firstName: string; lastName: string; phone: string; address: string; city: string; zip: string; country: string; notes: string; acceptsMarketing: boolean } | null;

export default function CustomerForm({ c }: { c: C }) {
  const [state, action] = useActionState(saveCustomer, null);
  return (
    <form action={action}>
      {c && <input type="hidden" name="id" value={c.id} />}
      <div className="card">
        <div className="card-head"><h2>Coordonnées</h2></div>
        <div className="card-body">
          <div className="cols-2">
            <div className="field"><label>Prénom</label><input name="firstName" defaultValue={c?.firstName} /></div>
            <div className="field"><label>Nom</label><input name="lastName" defaultValue={c?.lastName} /></div>
          </div>
          <div className="field"><label>E-mail</label><input name="email" type="email" defaultValue={c?.email} required /></div>
          <div className="field"><label>Téléphone</label><input name="phone" defaultValue={c?.phone} /></div>
          <div className="field"><label>Adresse</label><input name="address" defaultValue={c?.address} /></div>
          <div className="cols-2">
            <div className="field"><label>Ville</label><input name="city" defaultValue={c?.city} /></div>
            <div className="field"><label>Code postal</label><input name="zip" defaultValue={c?.zip} /></div>
          </div>
          <div className="field"><label>Pays</label><input name="country" defaultValue={c?.country || 'Maroc'} /></div>
          <div className="field"><Switch name="acceptsMarketing" defaultChecked={c?.acceptsMarketing} label="Accepte les e-mails marketing" /></div>
          <div className="field"><label>Notes internes</label><textarea name="notes" defaultValue={c?.notes} /></div>
        </div>
      </div>
      <SaveBar state={state} label={c ? 'Enregistrer' : 'Créer le client'} />
    </form>
  );
}
