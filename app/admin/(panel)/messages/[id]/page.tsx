import Link from 'next/link';
import { notFound } from 'next/navigation';
import Icon from '@/components/Icon';
import { db } from '@/lib/db';
import { frDateTime } from '@/lib/format';
import { getSettings } from '@/lib/settings';
import { ConfirmButton } from '@/components/admin/ui';
import { archiveMessage, deleteMessage, setMessageRead } from '../../../actions';

export default async function MessagePage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  let m = await db.message.findUnique({ where: { id } });
  if (!m) notFound();
  if (!m.isRead) m = await db.message.update({ where: { id }, data: { isRead: true } });
  const [s, customer] = await Promise.all([getSettings(), db.customer.findUnique({ where: { email: m.email.toLowerCase() } })]);
  const subject = encodeURIComponent(`Re: ${m.subject || `Votre message à ${s.brand.name}`}`);
  const body = encodeURIComponent(`Bonjour ${m.name || ''},\n\n\n\n---\n${m.body}`);
  const wa = m.phone.replace(/\D/g, '').replace(/^0/, '212');

  return (
    <>
      <Link href={m.archived ? '/admin/messages?tab=archived' : '/admin/messages'} className="back-link">← Messages</Link>
      <div className="page-title">
        <div><h1>{m.subject || `Message de ${m.name || m.email}`}</h1><p>Reçu le {frDateTime(m.createdAt)}</p></div>
        <div className="actions">
          <a className="btn" href={`mailto:${m.email}?subject=${subject}&body=${body}`}><Icon name="mail" /> Répondre</a>
          {wa && <a className="btn btn-secondary" href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer"><Icon name="whatsapp" /> WhatsApp</a>}
          <form action={setMessageRead}><input type="hidden" name="id" value={m.id} /><input type="hidden" name="read" value="0" /><button className="btn btn-secondary">Marquer non lu</button></form>
          <form action={archiveMessage}><input type="hidden" name="id" value={m.id} /><input type="hidden" name="archived" value={m.archived ? '0' : '1'} /><button className="btn btn-secondary">{m.archived ? 'Désarchiver' : 'Archiver'}</button></form>
          <form action={deleteMessage}><input type="hidden" name="id" value={m.id} /><ConfirmButton className="btn btn-danger" message="Supprimer ce message ?">Supprimer</ConfirmButton></form>
        </div>
      </div>
      <div className="grid-2">
        <div className="card card-pad" style={{ whiteSpace: 'pre-wrap', fontSize: 15, lineHeight: 1.7, color: '#1F1A15' }}>{m.body}</div>
        <div className="card">
          <div className="card-head"><h2>Expéditeur</h2></div>
          <div className="card-body">
            <dl className="kv">
              <dt>Nom</dt><dd>{m.name || '—'}</dd>
              <dt>E-mail</dt><dd><a className="link" href={`mailto:${m.email}`}>{m.email}</a></dd>
              <dt>Téléphone</dt><dd>{m.phone ? <a className="link" href={`tel:${m.phone}`}>{m.phone}</a> : '—'}</dd>
            </dl>
            {customer && <p style={{ marginBottom: 0 }}><Link className="link" href={`/admin/customers/${customer.id}`}>Voir la fiche client →</Link></p>}
          </div>
        </div>
      </div>
    </>
  );
}
