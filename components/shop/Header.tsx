'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/Icon';
import type { MenuItem } from '@/lib/defaults';
import { LANG_COOKIE, LOCALE_NAMES, LOCALE_SHORT, localePath, stripLocale, type Locale } from '@/lib/i18n';
import { useCart } from './CartProvider';
import Link, { useI18n } from './I18n';
import { small } from '@/lib/img';

type Props = {
  menu: MenuItem[];
  brand: { name: string; logo: string };
  langs: Locale[];
};

type Hit = { slug: string; title: string; image: string; price: string };

/** Lien vers la même page dans une autre langue (mémorise le choix du visiteur). */
function useSwitchHref() {
  const pathname = usePathname();
  const { path } = stripLocale(pathname);
  return (l: Locale) => localePath(l, path);
}
const remember = (l: Locale, e: React.MouseEvent<HTMLAnchorElement>) => {
  document.cookie = `${LANG_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
  e.currentTarget.href += window.location.search;
};

function LangSwitch({ langs }: { langs: Locale[] }) {
  const { lang, t } = useI18n();
  const to = useSwitchHref();
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) ref.current.open = false; };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);
  if (langs.length < 2) return null;
  return (
    <details className="lang-switch" ref={ref}>
      <summary className="header-icon" aria-label={t('language')}>
        <Icon name="globe" size={20} /><span className="lang-switch__cur">{LOCALE_SHORT[lang]}</span>
      </summary>
      <div className="lang-switch__panel">
        {langs.map((l) => (
          <a key={l} href={to(l)} lang={l} hrefLang={l} className={l === lang ? 'on' : ''} onClick={(e) => remember(l, e)}>{LOCALE_NAMES[l]}</a>
        ))}
      </div>
    </details>
  );
}

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const { t, lang, href } = useI18n();
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
    const timer = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q)}&lang=${lang}`);
        setHits(await r.json());
      } finally { setLoading(false); }
    }, 180);
    return () => clearTimeout(timer);
  }, [q, lang]);

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={t('search')}>
        <form className="search-input" onSubmit={(e) => { e.preventDefault(); onClose(); router.push(href(`/search?q=${encodeURIComponent(q)}`)); }}>
          <Icon name="search" size={20} />
          <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('searchPlaceholder')} aria-label={t('search')} />
          <button type="button" className="drawer-close" onClick={onClose} aria-label={t('close')}><Icon name="close" size={16} /></button>
        </form>
        <div className="search-results">
          {loading && <p style={{ padding: 8, color: 'var(--c-muted)' }}>{t('searching')}</p>}
          {!loading && q.length >= 2 && !hits.length && <p style={{ padding: 8, color: 'var(--c-muted)' }}>{t('noResultsFor', { q })}</p>}
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

export default function Header({ menu, brand, langs }: Props) {
  const { count, openDrawer } = useCart();
  const { t, lang, href } = useI18n();
  const to = useSwitchHref();
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

  const isActive = (h: string) => h !== '#' && h !== '/' && pathname.startsWith(href(h));

  return (
    <>
      <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
        <div className="header-row">
          <div className="header-mobile-left">
            <button className="header-icon" aria-label={t('menu')} onClick={() => setMobileOpen(true)}><Icon name="menu" /></button>
            <button className="header-icon" aria-label={t('search')} onClick={() => setSearchOpen(true)}><Icon name="search" /></button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link href="/" className="header-logo" aria-label={`${brand.name} - ${t('home')}`}>
              {brand.logo ? <img src={brand.logo} alt={brand.name} /> : <span className="header-logo__text">{brand.name}</span>}
            </Link>
            <nav className="header-nav" aria-label={t('mainMenu')}>
              <ul>
                {menu.map((m) => (
                  <li key={m.href + m.label}>
                    {m.children?.length ? (
                      <>
                        <button className="nav-parent" aria-haspopup="true">{m.label}</button>
                        <ul className="submenu">
                          {m.children.map((c) => (
                            <li key={c.href + c.label}><Link href={c.href}>{c.label}</Link></li>
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
            <span className="hide-mobile"><LangSwitch langs={langs} /></span>
            <button className="header-icon hide-mobile" aria-label={t('search')} onClick={() => setSearchOpen(true)}><Icon name="search" /></button>
            <Link className="header-icon" href="/account" aria-label={t('account')}><Icon name="user" /></Link>
            <button className="header-icon" aria-label={t('cart')} onClick={openDrawer}>
              <Icon name="bag" />
              {count > 0 && <span className="cart-count">{count}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* menu mobile */}
      <div className={`drawer-backdrop${mobileOpen ? ' open' : ''}`} onClick={() => setMobileOpen(false)} />
      <aside className={`drawer drawer--left${mobileOpen ? ' open' : ''}`} aria-label={t('menu')} aria-hidden={!mobileOpen}>
        <div className="drawer-head">
          <Link href="/account" className="mm-account"><Icon name="user" size={24} /> {t('account')} <span className="chev">›</span></Link>
          <button className="drawer-close" onClick={() => setMobileOpen(false)} aria-label={t('close')}><Icon name="close" size={18} /></button>
        </div>
        <div className="drawer-body">
          <ul className="mm-list">
            {menu.map((m) => (
              <li key={m.href + m.label}>
                {m.children?.length ? (
                  <details>
                    <summary>{m.label}</summary>
                    <ul>{m.children.map((c) => <li key={c.href + c.label}><Link href={c.href}>{c.label}</Link></li>)}</ul>
                  </details>
                ) : (
                  <Link href={m.href}>{m.label}</Link>
                )}
              </li>
            ))}
          </ul>
          {langs.length > 1 && (
            <div className="mm-langs" aria-label={t('language')}>
              <Icon name="globe" size={18} />
              {langs.map((l) => (
                <a key={l} href={to(l)} lang={l} hrefLang={l} className={l === lang ? 'on' : ''} onClick={(e) => remember(l, e)}>{LOCALE_NAMES[l]}</a>
              ))}
            </div>
          )}
        </div>
      </aside>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  );
}
