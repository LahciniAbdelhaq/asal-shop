'use client';

import { useActionState } from 'react';
import { sendContact } from '@/app/(shop)/actions';

export default function ContactForm() {
  const [state, action, pending] = useActionState(sendContact, null);
  if (state?.ok) return <div className="form-success" role="status">{state.message}</div>;
  return (
    <form action={action} className="form-grid">
      {state && !state.ok && <p className="form-error">{state.message}</p>}
      <div className="two">
        <div className="field"><label className="visually-hidden" htmlFor="c-name">Nom</label><input id="c-name" name="name" placeholder="Nom" autoComplete="name" /></div>
        <div className="field"><label className="visually-hidden" htmlFor="c-email">E-mail</label><input id="c-email" name="email" type="email" placeholder="E-mail" required autoComplete="email" /></div>
      </div>
      <div className="field"><label className="visually-hidden" htmlFor="c-phone">Téléphone</label><input id="c-phone" name="phone" type="tel" placeholder="Téléphone" autoComplete="tel" /></div>
      <div className="field"><label className="visually-hidden" htmlFor="c-body">Commentaire</label><textarea id="c-body" name="body" placeholder="Commentaire" required /></div>
      <input name="website" tabIndex={-1} autoComplete="off" style={{ display: 'none' }} />
      <div><button className="btn btn--dark" disabled={pending} style={{ padding: '16px 24px' }}>{pending ? 'Envoi…' : 'Envoyer'}</button></div>
    </form>
  );
}
