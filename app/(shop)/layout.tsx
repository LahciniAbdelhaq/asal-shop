import type { Metadata } from 'next';
import './shop.css';
import { getSettings, googleFontsUrl, themeCss } from '@/lib/settings';
import { CartProvider } from '@/components/shop/CartProvider';
import CartDrawer from '@/components/shop/CartDrawer';
import Header from '@/components/shop/Header';
import Footer from '@/components/shop/Footer';
import NavProgress from '@/components/NavProgress';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: { default: s.seo.title, template: `%s – ${s.brand.name}` },
    description: s.seo.description,
    icons: s.brand.favicon ? { icon: s.brand.favicon } : undefined,
  };
}

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  const fonts = googleFontsUrl(s);
  const a = s.announcement;
  const items = a.items.filter(Boolean);
  const track = items.length ? Array.from({ length: Math.max(2, a.repeat) }, () => items).flat() : [];

  return (
    <html lang="fr">
      <head>
        {fonts && <link rel="stylesheet" href={fonts} />}
        <style dangerouslySetInnerHTML={{ __html: themeCss(s) }} />
      </head>
      <body>
        <CartProvider shop={{ currency: s.shop.currency, currencyPosition: s.shop.currencyPosition, freeShippingThreshold: s.shop.freeShippingThreshold, shippingFee: s.shop.shippingFee }}>
          <NavProgress />
          <a className="skip-link" href="#main">Ignorer et passer au contenu</a>
          <div className="site-frame">
            {a.enabled && track.length > 0 && (
              <div className="asal-annonce-ma" role="region" aria-label="Annonce">
                <div className="asal-annonce-ma-track" style={{ ['--speed' as string]: `${a.speed}s` }}>
                  {track.map((t, i) => (
                    <span key={i} style={{ display: 'contents' }}>
                      <span className="am-item" dangerouslySetInnerHTML={{ __html: t }} />
                      <span className="am-dot">•</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
            <Header menu={s.menus.header} brand={{ name: s.brand.name, logo: s.brand.logo }} />
            <main id="main">{children}</main>
          </div>
          <Footer s={s} />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
