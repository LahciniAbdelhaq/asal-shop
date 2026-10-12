'use client';

import { useActionState } from 'react';
import { sendContact } from '@/app/(shop)/actions';
import { useI18n } from './I18n';

export default function ContactForm() {
  const { t, lang } = useI18n();
  const [state, action, pending] = useActionState(sendContact, null);
  if (state?.ok) return <div className="form-success" role="status">{state.message}</div>;
  return (
    <form action={action} className="form-grid">
      <input type="hidden" name="lang" value={lang} />
      {state && !state.ok && <p className="form-error">{state.message}</p>}
      <div className="two">
        <div className="field"><label className="visually-hidden" htmlFor="c-name">{t('name')}</label><input id="c-name" name="name" placeholder={t('name')} autoComplete="name" /></div>
        <div className="field"><label className="visually-hidden" htmlFor="c-email">{t('email')}</label><input id="c-email" name="email" type="email" placeholder={t('email')} required autoComplete="email" /></div>
      </div>
      <div className="field"><label className="visually-hidden" htmlFor="c-phone">{t('phone')}</label><input id="c-phone" name="phone" type="tel" placeholder={t('phone')} autoComplete="tel" /></div>
      <div className="field"><label className="visually-hidden" htmlFor="c-body">{t('comment')}</label><textarea id="c-body" name="body" placeholder={t('comment')} required /></div>
      <input name="website" tabIndex={-1} autoComplete="off" style={{ display: 'none' }} />
      <div><button className="btn btn--dark" disabled={pending} style={{ padding: '16px 24px' }}>{pending ? t('sending') : t('send')}</button></div>
    </form>
  );
}
