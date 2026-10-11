import Link from 'next/link';
import Icon from '@/components/Icon';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import { frDate, money } from '@/lib/format';
import RowActions from '@/components/admin/RowActions';
import { deletePromo } from '../../actions';

export const metadata = { title: 'Codes promo' };

export default async function PromosPage() {
  const [s, promos, usage] = await Promise.all([
    getSettings(),
    db.promoCode.findMany({ orderBy: { createdAt: 'desc' } }),
    db.order.groupBy({ by: ['promoCode'], _sum: { discount: true, total: true }, where: { promoCode: { not: '' }, status: { not: 'cancelled' } } }),
  ]);
  const now = new Date();
  const label = (p: (typeof promos)[number]) => (p.type === 'percent' ? `−${p.value} %` : p.type === 'fixed' ? `−${money(p.value, s.shop)}` : 'Livraison offerte');
  const state = (p: (typeof promos)[number]) =>
    !p.isActive ? <span className="pill gray">Désactivé</span>
      : p.endsAt && p.endsAt < now ? <span className="pill red">Expiré</span>
      : p.startsAt && p.startsAt > now ? <span className="pill amber">Programmé</span>
      : p.maxUses != null && p.usedCount >= p.maxUses ? <span className="pill red">Épuisé</span>
      : <span className="pill green">Actif</span>;
  return (
    <>
      <div className="page-title">
        <div><h1>Codes promo</h1><p>Réductions appliquées au moment de la commande</p></div>
        <div className="actions"><Link className="btn" href="/admin/promos/new"><Icon name="plus" /> Nouveau code</Link></div>
      </div>
      <div className="card table-wrap">
        <table className="tbl">
          <thead><tr><th>Code</th><th>Réduction</th><th>Conditions</th><th>Validité</th><th>Utilisations</th><th>Ventes générées</th><th>Statut</th><th className="actions-col">Actions</th></tr></thead>
          <tbody>
            {promos.map((p) => {
              const u = usage.find((x) => x.promoCode === p.code);
              return (
                <tr key={p.id}>
                  <td><Link className="row-link" href={`/admin/promos/${p.id}`} style={{ fontFamily: 'ui-monospace, monospace' }}>{p.code}</Link></td>
                  <td>{label(p)}</td>
                  <td className="muted">{p.minSubtotal ? `Dès ${money(p.minSubtotal, s.shop)}` : 'Aucune'}</td>
                  <td className="muted">{p.startsAt || p.endsAt ? `${p.startsAt ? frDate(p.startsAt) : '…'} → ${p.endsAt ? frDate(p.endsAt) : '…'}` : 'Illimitée'}</td>
                  <td>{p.usedCount}{p.maxUses != null ? ` / ${p.maxUses}` : ''}</td>
                  <td>{u ? <>{money(u._sum.total || 0, s.shop)} <span className="muted">(−{money(u._sum.discount || 0, s.shop)})</span></> : <span className="muted">—</span>}</td>
                  <td>{state(p)}</td>
                  <td><RowActions id={p.id} edit={`/admin/promos/${p.id}`} remove={deletePromo} confirm={`Supprimer le code ${p.code} ?`} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!promos.length && <div className="empty">Aucun code promo.</div>}
      </div>
    </>
  );
}
