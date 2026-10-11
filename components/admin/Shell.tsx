'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Icon from '@/components/Icon';
import { adminLogout } from '@/app/admin/actions';

type Badges = { messages: number; orders: number; reviews: number };

const NAV: { grp?: string; href: string; label: string; icon: string; badge?: keyof Badges }[] = [
  { href: '/admin', label: 'Tableau de bord', icon: 'dashboard' },
  { grp: 'Ventes', href: '/admin/orders', label: 'Commandes', icon: 'receipt', badge: 'orders' },
  { href: '/admin/customers', label: 'Clients', icon: 'users' },
  { href: '/admin/promos', label: 'Codes promo', icon: 'percent' },
  { grp: 'Catalogue', href: '/admin/products', label: 'Produits', icon: 'box' },
  { href: '/admin/categories', label: 'Catégories', icon: 'tag' },
  { href: '/admin/reviews', label: 'Avis clients', icon: 'star', badge: 'reviews' },
  { grp: 'Relation client', href: '/admin/messages', label: 'Messages', icon: 'mail', badge: 'messages' },
  { grp: 'Boutique en ligne', href: '/admin/home', label: 'Page d’accueil', icon: 'home' },
  { href: '/admin/pages', label: 'Pages', icon: 'file' },
  { href: '/admin/blog', label: 'Blog', icon: 'pen' },
  { href: '/admin/appearance', label: 'Apparence', icon: 'palette' },
  { href: '/admin/settings', label: 'Paramètres', icon: 'gear' },
];

export default function Shell({ brand, admin, badges, children }: { brand: { name: string; logo: string }; admin: { name: string; email: string }; badges: Badges; children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  const active = (href: string) => (href === '/admin' ? path === '/admin' : path.startsWith(href));

  return (
    <div className="adm">
      <aside className={`adm-side${open ? ' open' : ''}`}>
        <Link href="/admin" className="adm-brand">
          {brand.logo ? (
            <span style={{ display: 'grid', gap: 4 }}><img src={brand.logo} alt={brand.name} /><small>Back-office</small></span>
          ) : (
            <span>{brand.name}<small>Back-office</small></span>
          )}
        </Link>
        <nav className="adm-nav">
          {NAV.map((n) => (
            <div key={n.href} style={{ display: 'contents' }}>
              {n.grp && <div className="grp">{n.grp}</div>}
              <Link href={n.href} className={active(n.href) ? 'on' : ''}>
                <Icon name={n.icon} stroke={1.7} />
                {n.label}
                {n.badge && badges[n.badge] > 0 && <span className="badge">{badges[n.badge]}</span>}
              </Link>
            </div>
          ))}
        </nav>
        <div className="adm-side-foot">
          <div style={{ color: '#fff', fontWeight: 600 }}>{admin.name}</div>
          <div style={{ fontSize: 12, marginBottom: 10 }}>{admin.email}</div>
          <form action={adminLogout}><button style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Icon name="logout" size={16} /> Se déconnecter</button></form>
        </div>
      </aside>
      <div className="adm-main">
        <header className="adm-top">
          <button className="btn btn-ghost btn-icon burger" onClick={() => setOpen(!open)} aria-label="Menu"><Icon name="menu" /></button>
          <div className="spacer" />
          <a className="btn btn-secondary btn-sm" href="/" target="_blank" rel="noreferrer"><Icon name="external" /> Voir la boutique</a>
        </header>
        <div className="adm-content">{children}</div>
      </div>
    </div>
  );
}
