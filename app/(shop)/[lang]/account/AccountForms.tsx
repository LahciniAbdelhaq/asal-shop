'use client';

import { useActionState, useState } from 'react';
import { useI18n } from '@/components/shop/I18n';
import { customerLogin, customerRegister, updateProfile } from '../../actions';

export function AuthForms() {
  const { t, lang } = useI18n();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [ls, login, lp] = useActionState(customerLogin, null);
  const [rs, register, rp] = useActionState(customerRegister, null);
  return (
    <div className="account-wrap">
      <h1>{t('account')}</h1>
      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'login'} className={tab === 'login' ? 'on' : ''} onClick={() => setTab('login')}>{t('login')}</button>
        <button role="tab" aria-selected={tab === 'register'} className={tab === 'register' ? 'on' : ''} onClick={() => setTab('register')}>{t('register')}</button>
      </div>
      {tab === 'login' ? (
        <form action={login} className="form-grid">
          <input type="hidden" name="lang" value={lang} />
          {ls && !ls.ok && <p className="form-error">{ls.message}</p>}
          <div className="field field--rounded"><label htmlFor="l-email">{t('email')}</label><input id="l-email" name="email" type="email" required autoComplete="email" /></div>
          <div className="field field--rounded"><label htmlFor="l-pass">{t('password')}</label><input id="l-pass" name="password" type="password" required autoComplete="current-password" /></div>
          <button className="btn btn--block" disabled={lp}>{lp ? t('loggingIn') : t('signIn')}</button>
        </form>
      ) : (
        <form action={register} className="form-grid">
          <input type="hidden" name="lang" value={lang} />
          {rs && !rs.ok && <p className="form-error">{rs.message}</p>}
          <div className="two">
            <div className="field field--rounded"><label htmlFor="r-fn">{t('firstName')}</label><input id="r-fn" name="firstName" autoComplete="given-name" /></div>
            <div className="field field--rounded"><label htmlFor="r-ln">{t('lastName')}</label><input id="r-ln" name="lastName" autoComplete="family-name" /></div>
          </div>
          <div className="field field--rounded"><label htmlFor="r-email">{t('email')}</label><input id="r-email" name="email" type="email" required autoComplete="email" /></div>
          <div className="field field--rounded"><label htmlFor="r-pass">{t('passwordMin')}</label><input id="r-pass" name="password" type="password" required minLength={6} autoComplete="new-password" /></div>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14 }}><input type="checkbox" name="marketing" /> {t('marketingOptIn')}</label>
          <button className="btn btn--block" disabled={rp}>{rp ? t('creating') : t('createAccount')}</button>
        </form>
      )}
    </div>
  );
}

type C = { firstName: string; lastName: string; phone: string; address: string; city: string; zip: string; email: string };

export function ProfileForm({ c }: { c: C }) {
  const { t, lang } = useI18n();
  const [state, action, pending] = useActionState(updateProfile, null);
  return (
    <form action={action} className="form-grid">
      <input type="hidden" name="lang" value={lang} />
      {state && <p className={state.ok ? 'form-success' : 'form-error'}>{state.message}</p>}
      <p style={{ fontSize: 13, color: 'var(--c-muted)', margin: 0 }}>{c.email}</p>
      <div className="two">
        <div className="field field--rounded"><input name="firstName" placeholder={t('firstName')} defaultValue={c.firstName} /></div>
        <div className="field field--rounded"><input name="lastName" placeholder={t('lastName')} defaultValue={c.lastName} /></div>
      </div>
      <div className="field field--rounded"><input name="phone" placeholder={t('phone')} defaultValue={c.phone} /></div>
      <div className="field field--rounded"><input name="address" placeholder={t('address')} defaultValue={c.address} /></div>
      <div className="two">
        <div className="field field--rounded"><input name="city" placeholder={t('city')} defaultValue={c.city} /></div>
        <div className="field field--rounded"><input name="zip" placeholder={t('zip')} defaultValue={c.zip} /></div>
      </div>
      <button className="btn" disabled={pending}>{t('save')}</button>
    </form>
  );
}
