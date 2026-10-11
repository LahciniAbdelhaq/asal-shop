import Link from 'next/link';
import Icon from '@/components/Icon';
import type { Settings } from '@/lib/defaults';
import Newsletter from './Newsletter';

export default function Footer({ s }: { s: Settings }) {
  const social = (['instagram', 'facebook', 'tiktok', 'whatsapp'] as const).filter((k) => s.social[k]);
  const href = (k: (typeof social)[number]) => (k === 'whatsapp' ? `https://wa.me/${s.social.whatsapp.replace(/\D/g, '')}` : s.social[k]);
  return (
    <>
      {s.newsletter.enabled && (
        <div className="site-frame">
          <Newsletter title={s.newsletter.title} text={s.newsletter.text} placeholder={s.newsletter.placeholder} />
        </div>
      )}
      <footer className="asal-footnoir">
        <div className="asal-footnoir__inner">
          <div className="asal-footnoir__grid">
            <div>
              <p className="asal-footnoir__logo">{s.brand.footerLogoText}</p>
              <p className="asal-footnoir__blurb">{s.brand.footerBlurb}</p>
            </div>
            <div>
              <p className="asal-footnoir__title">{s.menus.footer1Title}</p>
              <ul className="asal-footnoir__links">
                {s.menus.footer1.map((l) => <li key={l.label}><Link href={l.href}>{l.label}</Link></li>)}
              </ul>
            </div>
            <div>
              <p className="asal-footnoir__title">{s.menus.footer2Title}</p>
              <ul className="asal-footnoir__links">
                {s.menus.footer2.map((l) => <li key={l.label}><Link href={l.href}>{l.label}</Link></li>)}
              </ul>
            </div>
            {social.length > 0 && (
              <div>
                <p className="asal-footnoir__title">{s.social.title}</p>
                <div className="asal-footnoir__social">
                  {social.map((k) => (
                    <a key={k} className="asal-footnoir__insta" href={href(k)} target="_blank" rel="noopener noreferrer" aria-label={k}>
                      <Icon name={k} stroke={2} />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="asal-footnoir__bottom">
            <p className="asal-footnoir__copy">{s.brand.copyright}</p>
            <nav className="asal-footnoir__legal" aria-label="Mentions légales">
              {s.menus.legal.map((l) => <Link key={l.label} href={l.href}>{l.label}</Link>)}
            </nav>
          </div>
        </div>
      </footer>
    </>
  );
}
