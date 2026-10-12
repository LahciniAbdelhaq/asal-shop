import type { Metadata } from 'next';
import '../shop.css';
import { getDict, getSettings, googleFontsUrl, themeCss } from '@/lib/settings';
import { asLocale, dirOf, LOCALES, TRANSLATED } from '@/lib/i18n';
import { CartProvider } from '@/components/shop/CartProvider';
import { I18nProvider } from '@/components/shop/I18n';
import CartDrawer from '@/components/shop/CartDrawer';
import Header from '@/components/shop/Header';
import Footer from '@/components/shop/Footer';
import NavProgress from '@/components/NavProgress';

// Pages mises en cache sur le CDN de Vercel, régénérées toutes les 5 min au plus tard
// et immédiatement après chaque modification dans le back-office (revalidatePath).
export const revalidate = 300;

// une version de la boutique par langue : /, /en, /ar
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

type Params = Promise<{ lang: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const lang = asLocale((await params).lang);
  const s = await getSettings(lang);
  return {
    title: { default: s.seo.title, template: `%s – ${s.brand.name}` },
    description: s.seo.description,
    icons: s.brand.favicon ? { icon: [{ url: s.brand.favicon }, { url: '/brand/favicon-32.png', sizes: '32x32', type: 'image/png' }], apple: '/brand/favicon-192.png' } : undefined,
  };
}

export default async function ShopLayout({ children, params }: { children: React.ReactNode; params: Params }) {
  const lang = asLocale((await params).lang);
  const [s, dict] = await Promise.all([getSettings(lang), getDict(lang)]);
  const fonts = googleFontsUrl(s, lang);
  const a = s.announcement;
  const items = a.items.filter(Boolean);
  const track = items.length ? Array.from({ length: Math.max(2, a.repeat) }, () => items).flat() : [];
  // langues proposées dans le sélecteur (réglage « Langues » du back-office)
  const langs = LOCALES.filter((l) => !TRANSLATED.includes(l) || s.languages[l as 'en' | 'ar'] !== false);

  return (
    <html lang={lang} dir={dirOf(lang)}>
      <head>
        <link rel="preload" href="/fonts/inter-n4.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/inter-n7.woff2" as="font" type="font/woff2" crossOrigin="" />
        {fonts && <><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" /><link rel="stylesheet" href={fonts} /></>}
        <style dangerouslySetInnerHTML={{ __html: themeCss(s, lang) }} />
      </head>
      <body>
        <I18nProvider lang={lang} dict={dict}>
          <CartProvider shop={{ currency: s.shop.currency, currencyPosition: s.shop.currencyPosition, freeShippingThreshold: s.shop.freeShippingThreshold, shippingFee: s.shop.shippingFee }}>
            <NavProgress />
            <a className="skip-link" href="#main">{dict.skip}</a>
            <div className="site-frame">
              {a.enabled && track.length > 0 && (
                <div className="asal-annonce-ma" role="region" aria-label={dict.announcement}>
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
              <Header menu={s.menus.header} brand={{ name: s.brand.name, logo: s.brand.logo }} langs={langs} />
              <main id="main">{children}</main>
            </div>
            <Footer s={s} legalLabel={dict.legalNav} />
            <CartDrawer />
          </CartProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
