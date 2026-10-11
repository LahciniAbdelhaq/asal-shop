'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/Icon';
import type { MenuItem } from '@/lib/defaults';
import { useCart } from './CartProvider';
import { small } from '@/lib/img';

type Props = {
  menu: MenuItem[];
  brand: { name: string; logo: string };
};

type Hit = { slug: string; title: string; image: string; price: string };

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    input.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (q.trim().length < 2) { setHits([]); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        setHits(await r.json());
      } finally { setLoading(false); }
    }, 180);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Rechercher">
        <form className="search-input" onSubmit={(e) => { e.preventDefault(); onClose(); router.push(`/search?q=${encodeURIComponent(q)}`); }}>
          <Icon name="search" size={20} />
          <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un miel, un coffret…" aria-label="Rechercher" />
          <button type="button" className="drawer-close" onClick={onClose} aria-label="Fermer"><Icon name="close" size={16} /></button>
        </form>
        <div className="search-results">
          {loading && <p style={{ padding: 8, color: 'var(--c-muted)' }}>Recherche…</p>}
          {!loading && q.length >= 2 && !hits.length && <p style={{ padding: 8, color: 'var(--c-muted)' }}>Aucun résultat pour « {q} »</p>}
          {hits.map((h) => (
            <Link key={h.slug} href={`/products/${h.slug}`} className="search-result" onClick={onClose}>
              <img src={small(h.image)} alt="" />
              <span>{h.title}</span>
              <em>{h.price}</em>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Header({ menu, brand }: Props) {
  const { count, openDrawer } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setMobileOpen(false); }, [pathname]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 10);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
  }, [mobileOpen]);

  const isActive = (href: string) => href !== '#' && href !== '/' && pathname.startsWith(href);

  return (
    <>
      <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
        <div className="header-row">
          <div className="header-mobile-left">
            <button className="header-icon" aria-label="Menu" onClick={() => setMobileOpen(true)}><Icon name="menu" /></button>
            <button className="header-icon" aria-label="Rechercher" onClick={() => setSearchOpen(true)}><Icon name="search" /></button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link href="/" className="header-logo" aria-label={`${brand.name} - Accueil`}>
              {brand.logo ? <img src={brand.logo} alt={brand.name} /> : <span className="header-logo__text">{brand.name}</span>}
            </Link>
            <nav className="header-nav" aria-label="Menu principal">
              <ul>
                {menu.map((m) => (
                  <li key={m.label}>
                    {m.children?.length ? (
                      <>
                        <button className="nav-parent" aria-haspopup="true">{m.label}</button>
                        <ul className="submenu">
                          {m.children.map((c) => (
                            <li key={c.label}><Link href={c.href}>{c.label}</Link></li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <Link href={m.href} className={isActive(m.href) ? 'is-active' : ''}>{m.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="header-actions">
            <button className="header-icon hide-mobile" aria-label="Rechercher" onClick={() => setSearchOpen(true)}><Icon name="search" /></button>
            <Link className="header-icon" href="/account" aria-label="Mon compte"><Icon name="user" /></Link>
            <button className="header-icon" aria-label="Panier" onClick={openDrawer}>
              <Icon name="bag" />
              {count > 0 && <span className="cart-count">{count}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* menu mobile */}
      <div className={`drawer-backdrop${mobileOpen ? ' open' : ''}`} onClick={() => setMobileOpen(false)} />
      <aside className={`drawer drawer--left${mobileOpen ? ' open' : ''}`} aria-label="Menu" aria-hidden={!mobileOpen}>
        <div className="drawer-head">
          <Link href="/account" className="mm-account"><Icon name="user" size={24} /> Mon compte <span className="chev">›</span></Link>
          <button className="drawer-close" onClick={() => setMobileOpen(false)} aria-label="Fermer"><Icon name="close" size={18} /></button>
        </div>
        <div className="drawer-body">
          <ul className="mm-list">
            {menu.map((m) => (
              <li key={m.label}>
                {m.children?.length ? (
                  <details>
                    <summary>{m.label}</summary>
                    <ul>{m.children.map((c) => <li key={c.label}><Link href={c.href}>{c.label}</Link></li>)}</ul>
                  </details>
                ) : (
                  <Link href={m.href}>{m.label}</Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  );
}
