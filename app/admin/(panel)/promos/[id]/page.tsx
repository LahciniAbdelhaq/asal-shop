import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { ConfirmButton } from '@/components/admin/ui';
import { deletePromo } from '../../../actions';
import PromoForm from './PromoForm';

const d = (x: Date | null) => (x ? new Date(x.getTime() - x.getTimezoneOffset() * 6e4).toISOString().slice(0, 16) : '');

export default async function PromoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = id === 'new' ? null : await db.promoCode.findUnique({ where: { id: Number(id) } });
  if (id !== 'new' && !p) notFound();
  return (
    <>
      <Link href="/admin/promos" className="back-link">← Codes promo</Link>
      <div className="page-title">
        <h1>{p ? p.code : 'Nouveau code promo'}</h1>
        {p && <form action={deletePromo}><input type="hidden" name="id" value={p.id} /><ConfirmButton className="btn btn-danger" message={`Supprimer le code ${p.code} ?`}>Supprimer</ConfirmButton></form>}
      </div>
      <PromoForm p={p ? { id: p.id, code: p.code, type: p.type, value: p.value, minSubtotal: p.minSubtotal, maxUses: p.maxUses, usedCount: p.usedCount, startsAt: d(p.startsAt), endsAt: d(p.endsAt), isActive: p.isActive } : null} />
    </>
  );
}
