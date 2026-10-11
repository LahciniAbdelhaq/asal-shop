import Link from 'next/link';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import SettingsClient from './SettingsClient';
import AdminUsers from './AdminUsers';

export const metadata = { title: 'Paramètres' };

const TABS = [
  { k: 'shop', l: 'Boutique & livraison' },
  { k: 'product', l: 'Fiche produit' },
  { k: 'composer', l: 'Compositeur de coffret' },
  { k: 'seo', l: 'Référencement' },
  { k: 'users', l: 'Administrateurs' },
];

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const want = (await searchParams).tab;
  const tab = TABS.find((t) => t.k === want)?.k || 'shop';
  const [me, s] = await Promise.all([requireAdmin(), getSettings()]);
  const users = tab === 'users' ? await db.adminUser.findMany({ orderBy: { createdAt: 'asc' }, select: { id: true, email: true, name: true, role: true } }) : [];
  return (
    <>
      <div className="page-title"><div><h1>Paramètres</h1><p>Configuration de la boutique.</p></div></div>
      <div className="tabs" style={{ marginBottom: 16 }}>
        {TABS.map((t) => <Link key={t.k} href={`/admin/settings?tab=${t.k}`} className={tab === t.k ? 'on' : ''}>{t.l}</Link>)}
      </div>
      {tab === 'users' ? <AdminUsers users={users} me={{ id: me.id, role: me.role }} /> : <SettingsClient tab={tab} s={s} />}
    </>
  );
}
