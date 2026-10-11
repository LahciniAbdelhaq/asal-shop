'use client';

import { useActionState } from 'react';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '@/lib/defaults';
import { SaveBar } from '@/components/admin/ui';
import { updateOrder } from '../../../actions';

type O = { id: number; status: string; paymentStatus: string; adminNote: string; firstName: string; lastName: string; email: string; phone: string; address: string; city: string; zip: string };

export default function OrderForm({ order }: { order: O }) {
  const [state, action] = useActionState(updateOrder, null);
  return (
    <form action={action}>
      <input type="hidden" name="id" value={order.id} />
      <div className="card">
        <div className="card-head"><h2>Traitement</h2></div>
        <div className="card-body">
          <div className="cols-2">
            <div className="field">
              <label>Statut de la commande</label>
              <select name="status" defaultValue={order.status}>
                {Object.entries(ORDER_STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Paiement</label>
              <select name="paymentStatus" defaultValue={order.paymentStatus}>
                {Object.entries(PAYMENT_STATUSES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="field"><label>Note interne (non visible par le client)</label><textarea name="adminNote" defaultValue={order.adminNote} placeholder="Appel de confirmation, transporteur, n° de suivi…" /></div>
        </div>
      </div>
      <div className="card">
        <div className="card-head"><h2>Adresse de livraison</h2></div>
        <div className="card-body">
          <div className="cols-2">
            <div className="field"><label>Prénom</label><input name="firstName" defaultValue={order.firstName} /></div>
            <div className="field"><label>Nom</label><input name="lastName" defaultValue={order.lastName} /></div>
          </div>
          <div className="cols-2">
            <div className="field"><label>E-mail</label><input name="email" type="email" defaultValue={order.email} /></div>
            <div className="field"><label>Téléphone</label><input name="phone" defaultValue={order.phone} /></div>
          </div>
          <div className="field"><label>Adresse</label><input name="address" defaultValue={order.address} /></div>
          <div className="cols-2">
            <div className="field"><label>Ville</label><input name="city" defaultValue={order.city} /></div>
            <div className="field"><label>Code postal</label><input name="zip" defaultValue={order.zip} /></div>
          </div>
        </div>
      </div>
      <SaveBar state={state} />
    </form>
  );
}
