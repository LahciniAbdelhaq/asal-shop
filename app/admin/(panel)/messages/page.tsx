import Link from 'next/link';
import Icon from '@/components/Icon';
import { db } from '@/lib/db';
import { frDateTime } from '@/lib/format';
import RowActions from '@/components/admin/RowActions';
import { deleteMessage, deleteSubscriber } from '../../actions';

export const metadata = { title: 'Messages' };

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const tab = (await searchParams).tab || 'inbox';
  const [msgs, subs, counts] = await Promise.all([
    tab === 'newsletter' ? [] : db.message.findMany({ where: { archived: tab === 'archived' }, orderBy: { createdAt: 'desc' } }),
    tab === 'newsletter' ? db.subscriber.findMany({ orderBy: { createdAt: 'desc' } }) : [],
    Promise.all([db.message.count({ where: { archived: false } }), db.message.count({ where: { archived: true } }), db.subscriber.count()]),
  ]);
  return (
    <>
      <div className="page-title">
        <div><h1>Messages</h1><p>Formulaire de contact et inscriptions à la newsletter</p></div>
        <div className="actions">
          <a className="btn btn-secondary" href={`/api/admin/export/${tab === 'newsletter' ? 'subscribers' : 'messages'}`}><Icon name="download" /> Exporter (CSV)</a>
        </div>
      </div>
      <div className="card">
        <div className="toolbar">
          <div className="tabs">
            <Link href="/admin/messages" className={tab === 'inbox' ? 'on' : ''}>Boîte de réception ({counts[0]})</Link>
            <Link href="/admin/messages?tab=archived" className={tab === 'archived' ? 'on' : ''}>Archivés ({counts[1]})</Link>
            <Link href="/admin/messages?tab=newsletter" className={tab === 'newsletter' ? 'on' : ''}>Newsletter ({counts[2]})</Link>
          </div>
        </div>
        {tab === 'newsletter' ? (
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>E-mail</th><th>Inscrit le</th><th /></tr></thead>
              <tbody>
                {subs.map((s) => (
                  <tr key={s.id}>
                    <td><a className="row-link" href={`mailto:${s.email}`}>{s.email}</a></td>
                    <td className="muted">{frDateTime(s.createdAt)}</td>
                    <td className="num"><form action={deleteSubscriber}><input type="hidden" name="id" value={s.id} /><button className="btn btn-ghost btn-sm">Désinscrire</button></form></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!subs.length && <div className="empty">Aucun abonné.</div>}
          </div>
        ) : (
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>De</th><th>Message</th><th>Reçu le</th><th className="actions-col">Actions</th></tr></thead>
              <tbody>
                {msgs.map((m) => (
                  <tr key={m.id} className={m.isRead ? '' : 'unread'}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <Link className="row-link" href={`/admin/messages/${m.id}`}>{!m.isRead && '● '}{m.name || m.email}</Link>
                      <div className="muted" style={{ fontSize: 12 }}>{m.email}</div>
                    </td>
                    <td style={{ maxWidth: 520 }}>
                      <Link href={`/admin/messages/${m.id}`} style={{ textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 520 }}>
                        {m.subject && <strong>{m.subject} — </strong>}{m.body}
                      </Link>
                    </td>
                    <td className="muted" style={{ whiteSpace: 'nowrap' }}>{frDateTime(m.createdAt)}</td>
                    <td><RowActions id={m.id} view={`/admin/messages/${m.id}`} remove={deleteMessage} confirm="Supprimer ce message ?" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!msgs.length && <div className="empty">Aucun message.</div>}
          </div>
        )}
      </div>
    </>
  );
}
