'use client';

import { useActionState, useState } from 'react';
import { submitReview } from '@/app/(shop)/actions';

export default function ReviewForm({ productId }: { productId: number }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [state, action, pending] = useActionState(submitReview, null);

  if (state?.ok) return <p className="form-success" style={{ marginTop: 20 }}>{state.message}</p>;
  if (!open) return <button className="asal-avis__btn" onClick={() => setOpen(true)}>Donner mon avis</button>;

  return (
    <form action={action} className="review-form">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="rating" value={rating} />
      <div className="star-input" role="radiogroup" aria-label="Note">
        {[1, 2, 3, 4, 5].map((n) => (
          <button type="button" key={n} onClick={() => setRating(n)} aria-label={`${n} étoile${n > 1 ? 's' : ''}`}>{n <= rating ? '★' : '☆'}</button>
        ))}
      </div>
      <div className="field field--rounded"><input name="name" placeholder="Votre prénom" required /></div>
      <div className="field field--rounded"><textarea name="comment" placeholder="Votre avis sur ce produit" required /></div>
      {state && !state.ok && <p className="form-error">{state.message}</p>}
      <button className="btn" disabled={pending}>{pending ? 'Envoi…' : 'Publier mon avis'}</button>
    </form>
  );
}
