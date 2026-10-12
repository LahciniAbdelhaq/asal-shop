'use client';

import { useActionState, useState } from 'react';
import { submitReview } from '@/app/(shop)/actions';
import { useI18n } from './I18n';

export default function ReviewForm({ productId }: { productId: number }) {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [state, action, pending] = useActionState(submitReview, null);

  if (state?.ok) return <p className="form-success" style={{ marginTop: 20 }}>{state.message}</p>;
  if (!open) return <button className="asal-avis__btn" onClick={() => setOpen(true)}>{t('writeReview')}</button>;

  return (
    <form action={action} className="review-form">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="rating" value={rating} />
      <input type="hidden" name="lang" value={lang} />
      <div className="star-input" role="radiogroup" aria-label={t('rating')}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button type="button" key={n} onClick={() => setRating(n)} aria-label={t(n > 1 ? 'starsMany' : 'starsOne', { n })}>{n <= rating ? '★' : '☆'}</button>
        ))}
      </div>
      <div className="field field--rounded"><input name="name" placeholder={t('yourName')} required /></div>
      <div className="field field--rounded"><textarea name="comment" placeholder={t('yourReview')} required /></div>
      {state && !state.ok && <p className="form-error">{state.message}</p>}
      <button className="btn" disabled={pending}>{pending ? t('sending') : t('publishReview')}</button>
    </form>
  );
}
