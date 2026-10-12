'use client';

import { useActionState } from 'react';
import Icon from '@/components/Icon';
import { subscribe } from '@/app/(shop)/actions';
import { useI18n } from './I18n';

export default function Newsletter({ title, text, placeholder }: { title: string; text: string; placeholder: string }) {
  const { t, lang } = useI18n();
  const [state, action, pending] = useActionState(subscribe, null);
  return (
    <section className="newsletter">
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      <div>
        <form action={action}>
          <input type="hidden" name="lang" value={lang} />
          <label className="visually-hidden" htmlFor="nl-email">{t('email')}</label>
          <input id="nl-email" type="email" name="email" placeholder={placeholder} required autoComplete="email" />
          <button aria-label={t('subscribe')} disabled={pending}><Icon name="arrow" size={20} stroke={1.4} /></button>
        </form>
        {state && <p className="msg" role="status">{state.message}</p>}
      </div>
    </section>
  );
}
