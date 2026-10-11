import Link from 'next/link';
import Icon from '@/components/Icon';
import { db } from '@/lib/db';
import { cardInfo, getProductsBySlugs, type FullProduct } from '@/lib/catalog';
import { frDate, money, type MoneyFormat } from '@/lib/format';
import { HomeCard } from './ProductCard';

/* eslint-disable @typescript-eslint/no-explicit-any */
type D = Record<string, any>;
type Ctx = { fmt: MoneyFormat; products: Map<string, FullProduct> };

const Html = ({ html, as: Tag = 'span', className }: { html?: string; as?: any; className?: string }) =>
  html ? <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} /> : null;

function HeroVideo({ d }: { d: D }) {
  return (
    <div className="asal-sec">
      <div className="asal-video-hero">
        {d.video ? (
          <video autoPlay muted loop playsInline preload="metadata" poster={d.poster || undefined}>
            <source src={d.video} type="video/mp4" />
          </video>
        ) : d.poster ? <img className="poster" src={d.poster} alt="" /> : null}
        <div className="asal-video-shade" />
        <div className="asal-video-text">
          <div className="asal-video-inner">
            {d.eyebrow && <div className="asal-eyebrow">{d.eyebrow}</div>}
            <Html as="h1" html={d.heading} />
            {d.text && <p>{d.text}</p>}
            <div className="asal-cta-row">
              {d.btn1Label && <Link className="asal-btn-amber" href={d.btn1Link || '#'}>{d.btn1Label}</Link>}
              {d.btn2Label && <Link className="asal-btn-ghost" href={d.btn2Link || '#'}>{d.btn2Label}</Link>}
            </div>
          </div>
        </div>
      </div>
      <div className="asal-hero-m">
        {d.video ? (
          <video autoPlay muted loop playsInline preload="metadata" poster={d.poster || undefined}>
            <source src={d.video} type="video/mp4" />
          </video>
        ) : d.poster ? <img className="poster" src={d.poster} alt="" /> : null}
        <div className="asal-hm-shade" />
        <div className="asal-hm-text">
          {d.eyebrow && <div className="asal-eyebrow">{d.eyebrow}</div>}
          <Html as="h1" html={d.mobileHeading || d.heading} />
          {(d.mobileText || d.text) && <p>{d.mobileText || d.text}</p>}
          <div className="asal-cta-row">
            {(d.mobileBtnLabel || d.btn1Label) && <Link className="asal-btn-amber" href={d.mobileBtnLink || d.btn1Link || '#'}>{d.mobileBtnLabel || d.btn1Label}</Link>}
            {d.mobileLinkLabel && <Link className="asal-hm-link" href={d.mobileLinkHref || '#'}>{d.mobileLinkLabel} <span className="asal-hm-chev">›</span></Link>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Reassurance({ d }: { d: D }) {
  return (
    <div className="asal-sec asal-reassurance-band">
      <div className="asal-reassurance">
        {(d.items || []).map((it: D, i: number) => (
          <div className="asal-reassurance__item" key={i}>
            <Icon name={it.icon} size={34} stroke={1.6} />
            <div>
              <div className="asal-reassurance__t">{it.title}</div>
              <div className="asal-reassurance__d">{it.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductBand({ d, ctx }: { d: D; ctx: Ctx }) {
  const list = (d.products || []).map((s: string) => ctx.products.get(s)).filter(Boolean) as FullProduct[];
  const dark = d.style !== 'light';
  return (
    <div className="asal-sec" style={{ marginTop: dark ? 0 : 72 }}>
      <div className={dark ? 'asal-dark-band' : 'asal-light-band'}>
        <div className="page-width asal-dark-band__head">
          {d.eyebrow && <div className="asal-eyebrow-amber">{d.eyebrow}</div>}
          <Link href={d.titleLink || '#'} className="asal-dark-band__title" style={dark ? undefined : { color: 'var(--c-ink)' }}>{d.title}</Link>
          {d.text && <p className="asal-dark-band__text" style={dark ? undefined : { color: 'var(--c-olive)' }}>{d.text}</p>}
        </div>
        <div className="page-width">
          <div className={`asal-row cols-${d.columns || 3}`}>
            {list.map((p) => <HomeCard key={p.id} p={p} fmt={ctx.fmt} variant={d.variant} badge={d.badge} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductRow({ d, ctx }: { d: D; ctx: Ctx }) {
  const list = (d.products || []).map((s: string) => ctx.products.get(s)).filter(Boolean) as FullProduct[];
  return (
    <div className="asal-sec asal-prow">
      <div className="asal-prow__head">
        <div>
          <Link className="t" href={d.titleLink || '#'}><h2 className="sec-title" style={{ margin: '0 0 6px' }}>{d.title}</h2></Link>
          {d.text && <p className="sec-sub">{d.text}</p>}
        </div>
        {d.linkLabel && <Link href={d.link || '#'} className="link-amber" style={{ whiteSpace: 'nowrap' }}>{d.linkLabel}</Link>}
      </div>
      <div className={`asal-row cols-${d.columns || 4}`}>
        {list.map((p) => <HomeCard key={p.id} p={p} fmt={ctx.fmt} variant={d.variant} />)}
      </div>
    </div>
  );
}

function Needs({ d }: { d: D }) {
  return (
    <div className="asal-sec asal-besoins-sec">
      <div className="page-width" style={{ marginBottom: 28 }}>
        <h2 className="sec-title">{d.heading}</h2>
        {d.text && <p className="sec-sub">{d.text}</p>}
      </div>
      <div className="asal-needs-grid">
        {(d.cards || []).map((c: D, i: number) => (
          <Link className="asal-need-card" href={c.link || '#'} key={i}>
            {c.image && <img src={c.image} alt={c.title} loading="lazy" />}
            <div className="asal-need-shade" />
            <div className="asal-need-text">
              <div className="asal-need-title">{c.title}</div>
              <div className="asal-need-desc">{c.text}</div>
              {c.linkLabel && <div className="asal-need-link">{c.linkLabel}</div>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function GiftSplit({ d }: { d: D }) {
  return (
    <div className="asal-offrir-sec">
      <div className="asal-offrir-split">
        <div className="asal-offrir-text">
          {d.eyebrow && <div className="asal-offrir-eyebrow">{d.eyebrow}</div>}
          <Html as="h2" html={d.heading} />
          {d.text && <p>{d.text}</p>}
          <div className="asal-offrir-pills">
            {(d.pills || []).map((p: D, i: number) => (
              <span className="asal-offrir-pill" key={i}><Icon name={p.icon === 'gift' ? 'giftbox' : p.icon} stroke={2} />{p.label}</span>
            ))}
          </div>
        </div>
        <div className="asal-offrir-photo">
          {d.image && <img src={d.image} alt={d.imageAlt || ''} loading="lazy" />}
          {d.seal && <Html className="asal-offrir-seal" as="div" html={d.seal} />}
        </div>
      </div>
    </div>
  );
}

function Coffrets({ d, ctx }: { d: D; ctx: Ctx }) {
  return (
    <div className="asal-coffrets-sec">
      <div className="page-width">
        <div className="asal-center-head">
          {d.eyebrow && <div className="asal-eyebrow-amber">{d.eyebrow}</div>}
          <h2>{d.heading}</h2>
          {d.text && <p>{d.text}</p>}
        </div>
        <div className="asal-coffrets-grid">
          {(d.cards || []).map((c: D, i: number) => {
            const p = ctx.products.get(c.product);
            const href = p ? `/products/${p.slug}` : '#';
            const price = p ? cardInfo(p).price : null;
            return (
              <div className="asal-coffret-card" key={i}>
                <Link className="asal-coffret-img" href={href}>
                  <img src={c.image || p?.images[0]?.url || ''} alt={c.title} loading="lazy" />
                </Link>
                <div className="asal-coffret-body">
                  {c.badge && <span className="asal-coffret-badge">{c.badge}</span>}
                  <h3>{c.title || p?.title}</h3>
                  {c.tagline && <p className="asal-coffret-tag">{c.tagline}</p>}
                  <ul className="asal-coffret-list">
                    {(c.features || []).filter(Boolean).map((f: string, j: number) => <li key={j}>{f}</li>)}
                  </ul>
                  <Link className="asal-coffret-cta" href={href}>
                    {c.ctaLabel || 'Choisir ce coffret'}{price != null ? ` · ${money(price, ctx.fmt)}` : ''}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function BlogCard({ p }: { p: { slug: string; title: string; excerpt: string; image: string; publishedAt: Date } }) {
  return (
    <Link className="asal-ma-blog-card" href={`/blogs/le-miel-un-art-de-vivre/${p.slug}`}>
      {p.image && <img src={p.image} alt={p.title} loading="lazy" />}
      <div className="asal-ma-blog-body">
        <div className="asal-ma-blog-date">{frDate(p.publishedAt)}</div>
        <h3 className="asal-ma-blog-title">{p.title}</h3>
        <p className="asal-ma-blog-ex">{p.excerpt}</p>
      </div>
    </Link>
  );
}

async function BlogLatest({ d }: { d: D }) {
  const posts = await db.post.findMany({ where: { isPublished: true }, orderBy: [{ publishedAt: 'desc' }, { id: 'asc' }], take: Number(d.count) || 3 });
  if (!posts.length) return null;
  return (
    <div className="asal-sec asal-ma-blog">
      <div className="asal-ma-blog-inner">
        <h2>{d.heading}</h2>
        {d.text && <p className="asal-sub">{d.text}</p>}
        <div className="asal-ma-blog-grid">{posts.map((p) => <BlogCard key={p.id} p={p} />)}</div>
      </div>
    </div>
  );
}

function ComposeCta({ d }: { d: D }) {
  return (
    <div className="asal-compose-sec">
      <div className="page-width">
        {d.eyebrow && <div className="asal-eyebrow-amber">{d.eyebrow}</div>}
        <h2>{d.heading}</h2>
        {d.text && <p className="lead">{d.text}</p>}
        {d.note && <p className="note">{d.note}</p>}
        <div className="asal-compose-steps">
          {(d.steps || []).map((s: D, i: number) => (
            <div className="asal-compose-step" key={i}>
              <span className="asal-compose-num">{s.num}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
        {d.ctaLabel && <div className="asal-compose-cta"><Link href={d.ctaLink || '#'}>{d.ctaLabel}</Link></div>}
      </div>
    </div>
  );
}

function Story({ d }: { d: D }) {
  return (
    <div className="asal-sec asal-story">
      <div>{d.image && <Link href={d.link || '#'}><img src={d.image} alt={d.imageAlt || ''} loading="lazy" /></Link>}</div>
      <div>
        {d.eyebrow && <div className="eyebrow">{d.eyebrow}</div>}
        <h2 className="sec-title" style={{ marginBottom: 14 }}>{d.heading}</h2>
        {d.text && <p>{d.text}</p>}
        {d.linkLabel && <Link href={d.link || '#'} className="link-amber" style={{ fontWeight: 700 }}>{d.linkLabel}</Link>}
      </div>
    </div>
  );
}

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <>
      {items.map((f, i) => (
        <details className="asal-faq-item" key={i}>
          <summary>{f.q}</summary>
          <div dangerouslySetInnerHTML={{ __html: f.a.includes('<') ? f.a : `<p>${f.a}</p>` }} />
        </details>
      ))}
    </>
  );
}

function Faq({ d }: { d: D }) {
  return (
    <div className="asal-sec asal-faq-sec">
      <div className="asal-faq-list">
        <h2 className="sec-title">{d.heading}</h2>
        {d.text && <p className="sec-sub" style={{ marginBottom: 24 }}>{d.text}</p>}
        <FaqList items={d.items || []} />
      </div>
      {d.cardTitle && (
        <div className="asal-faq-card">
          <h3>{d.cardTitle}</h3>
          {d.cardText && <p>{d.cardText}</p>}
          {d.cardBtnLabel && <Link href={d.cardBtnLink || '/pages/contact'}>{d.cardBtnLabel}</Link>}
        </div>
      )}
    </div>
  );
}

function RichText({ d }: { d: D }) {
  return <div className={`asal-sec asal-richtext rte${d.center ? ' rte--center' : ''}`} style={{ padding: '0 16px' }} dangerouslySetInnerHTML={{ __html: d.html || '' }} />;
}

const RENDER: Record<string, (p: { d: D; ctx: Ctx }) => React.ReactNode> = {
  hero_video: HeroVideo,
  reassurance: Reassurance,
  product_band: ProductBand,
  product_row: ProductRow,
  needs: Needs,
  gift_split: GiftSplit,
  coffrets: Coffrets,
  blog_latest: BlogLatest as never,
  compose_cta: ComposeCta,
  story: Story,
  faq: Faq,
  rich_text: RichText,
};

export default async function HomeSections({ sections, fmt }: { sections: { id: number; type: string; data: string }[]; fmt: MoneyFormat }) {
  const parsed = sections.map((s) => {
    let d: D = {};
    try { d = JSON.parse(s.data); } catch { /* données invalides */ }
    return { ...s, d };
  });
  // précharge en une requête tous les produits cités par les sections
  const slugs = new Set<string>();
  for (const s of parsed) {
    (s.d.products || []).forEach((x: string) => slugs.add(x));
    (s.d.cards || []).forEach((c: D) => c.product && slugs.add(c.product));
  }
  const list = await getProductsBySlugs([...slugs]);
  const ctx: Ctx = { fmt, products: new Map(list.map((p) => [p.slug, p])) };
  return (
    <>
      {parsed.map((s) => {
        const C = RENDER[s.type];
        return C ? <section key={s.id} data-section={s.type}><C d={s.d} ctx={ctx} /></section> : null;
      })}
      <div className="home-end-spacer" />
    </>
  );
}
