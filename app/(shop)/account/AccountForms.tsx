'use client';

import { useActionState, useState } from 'react';
import { customerLogin, customerRegister, updateProfile } from '../actions';

export function AuthForms() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [ls, login, lp] = useActionState(customerLogin, null);
  const [rs, register, rp] = useActionState(customerRegister, null);
  return (
    <div className="account-wrap">
      <h1>Mon compte</h1>
      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'login'} className={tab === 'login' ? 'on' : ''} onClick={() => setTab('login')}>Connexion</button>
        <button role="tab" aria-selected={tab === 'register'} className={tab === 'register' ? 'on' : ''} onClick={() => setTab('register')}>Créer un compte</button>
      </div>
      {tab === 'login' ? (
        <form action={login} className="form-grid">
          {ls && !ls.ok && <p className="form-error">{ls.message}</p>}
          <div className="field field--rounded"><label htmlFor="l-email">E-mail</label><input id="l-email" name="email" type="email" required autoComplete="email" /></div>
          <div className="field field--rounded"><label htmlFor="l-pass">Mot de passe</label><input id="l-pass" name="password" type="password" required autoComplete="current-password" /></div>
          <button className="btn btn--block" disabled={lp}>{lp ? 'Connexion…' : 'Se connecter'}</button>
        </form>
      ) : (
        <form action={register} className="form-grid">
          {rs && !rs.ok && <p className="form-error">{rs.message}</p>}
          <div className="two">
            <div className="field field--rounded"><label htmlFor="r-fn">Prénom</label><input id="r-fn" name="firstName" autoComplete="given-name" /></div>
            <div className="field field--rounded"><label htmlFor="r-ln">Nom</label><input id="r-ln" name="lastName" autoComplete="family-name" /></div>
          </div>
          <div className="field field--rounded"><label htmlFor="r-email">E-mail</label><input id="r-email" name="email" type="email" required autoComplete="email" /></div>
          <div className="field field--rounded"><label htmlFor="r-pass">Mot de passe (6 caractères min.)</label><input id="r-pass" name="password" type="password" required minLength={6} autoComplete="new-password" /></div>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14 }}><input type="checkbox" name="marketing" /> Recevoir nos offres et nouveautés</label>
          <button className="btn btn--block" disabled={rp}>{rp ? 'Création…' : 'Créer mon compte'}</button>
        </form>
      )}
    </div>
  );
}

type C = { firstName: string; lastName: string; phone: string; address: string; city: string; zip: string; email: string };

export function ProfileForm({ c }: { c: C }) {
  const [state, action, pending] = useActionState(updateProfile, null);
  return (
    <form action={action} className="form-grid">
      {state && <p className={state.ok ? 'form-success' : 'form-error'}>{state.message}</p>}
      <p style={{ fontSize: 13, color: 'var(--c-muted)', margin: 0 }}>{c.email}</p>
      <div className="two">
        <div className="field field--rounded"><input name="firstName" placeholder="Prénom" defaultValue={c.firstName} /></div>
        <div className="field field--rounded"><input name="lastName" placeholder="Nom" defaultValue={c.lastName} /></div>
      </div>
      <div className="field field--rounded"><input name="phone" placeholder="Téléphone" defaultValue={c.phone} /></div>
      <div className="field field--rounded"><input name="address" placeholder="Adresse" defaultValue={c.address} /></div>
      <div className="two">
        <div className="field field--rounded"><input name="city" placeholder="Ville" defaultValue={c.city} /></div>
        <div className="field field--rounded"><input name="zip" placeholder="Code postal" defaultValue={c.zip} /></div>
      </div>
      <button className="btn" disabled={pending}>Enregistrer</button>
    </form>
  );
}
