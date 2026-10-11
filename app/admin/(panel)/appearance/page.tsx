import Link from 'next/link';
import { getSettings } from '@/lib/settings';
import { getLinkOptions } from '@/lib/admin-data';
import AppearanceClient from './AppearanceClient';

export const metadata = { title: 'Apparence' };

const TABS = [
  { k: 'brand', l: 'Identité & logo' },
  { k: 'colors', l: 'Couleurs' },
  { k: 'fonts', l: 'Typographie' },
  { k: 'announcement', l: 'Barre d’annonce' },
  { k: 'menus', l: 'Menus' },
  { k: 'footer', l: 'Pied de page & réseaux' },
];

export default async function AppearancePage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const want = (await searchParams).tab;
  const tab = TABS.find((t) => t.k === want)?.k || 'brand';
  const [s, links] = await Promise.all([getSettings(), getLinkOptions()]);
  return (
    <>
      <div className="page-title">
        <div><h1>Apparence</h1><p>Logo, système de couleurs, polices, menus… Tout est appliqué instantanément sur la boutique.</p></div>
        <div className="actions"><a className="btn btn-secondary" href="/" target="_blank" rel="noreferrer">Voir la boutique</a></div>
      </div>
      <div className="tabs" style={{ marginBottom: 16 }}>
        {TABS.map((t) => <Link key={t.k} href={`/admin/appearance?tab=${t.k}`} className={tab === t.k ? 'on' : ''}>{t.l}</Link>)}
      </div>
      <AppearanceClient tab={tab} s={s} links={links} />
    </>
  );
}
