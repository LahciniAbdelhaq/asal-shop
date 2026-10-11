#!/usr/bin/env node
/**
 * Importe le site cloné (asalmaroc.com) dans le projet Next.js :
 *   - copie les images / vidéos utilisées dans public/media/
 *   - écrit prisma/seed-data.json (catégories, produits, pages, articles, sections d'accueil, réglages)
 *
 * Usage : node scripts/import-clone.mjs [dossier-du-clone]
 * Ensuite : npm run db:seed
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CLONE = path.resolve(process.argv[2] || 'D:/projects/tool-clone/clones/www.asalmaroc.com_2026-10-10T13-25-57');
const MEDIA_DIR = path.join(ROOT, 'public', 'media');
fs.mkdirSync(MEDIA_DIR, { recursive: true });

const readJson = (p) => JSON.parse(fs.readFileSync(path.join(CLONE, p), 'utf8'));
const report = readJson('clone-report.json');
const { products: rawProducts, collections: rawCollections } = readJson('html2wp-pro/import/products.json');
const content = readJson('html2wp-pro/import/content.json');

// ---------- correspondance URL distante -> fichier local (plus grande version) ----------
const byName = new Map();
for (const a of Object.values(report.assets).flat()) {
  if (!a || !a.url || !a.localPath) continue;
  try {
    const u = new URL(a.url);
    const name = decodeURIComponent(u.pathname.split('/').pop());
    const w = Number(u.searchParams.get('width') || 1e6);
    const abs = path.join(CLONE, a.localPath);
    if (!fs.existsSync(abs)) continue;
    const prev = byName.get(name);
    if (!prev || w > prev.w) byName.set(name, { w, p: a.localPath });
  } catch { /* ignore */ }
}

const copied = new Map();
function copyLocal(rel) {
  if (!rel) return '';
  rel = rel.replace(/^\.\//, '');
  if (copied.has(rel)) return copied.get(rel);
  const src = path.join(CLONE, rel);
  if (!fs.existsSync(src)) return '';
  const base = path.basename(rel).replace(/[^\w.\-]+/g, '_');
  fs.copyFileSync(src, path.join(MEDIA_DIR, base));
  const url = `/media/${base}`;
  copied.set(rel, url);
  return url;
}
function media(src) {
  if (!src) return '';
  if (/^(\.\/)?assets\//.test(src)) return copyLocal(src);
  try {
    const u = new URL(src.startsWith('//') ? `https:${src}` : src);
    const hit = byName.get(decodeURIComponent(u.pathname.split('/').pop()));
    return hit ? copyLocal(hit.p) : '';
  } catch { return ''; }
}

// ---------- slugs propres (sans la partie arabe) ----------
const cleanSlug = (h) =>
  decodeURIComponent(h).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase();

const productSlug = new Map(); // handle (ou slug court) -> slug propre
for (const p of rawProducts) {
  const s = cleanSlug(p.handle);
  productSlug.set(p.handle, s);
  productSlug.set(p.slug, s);
  productSlug.set(s, s);
}
const resolveProduct = (ref) => {
  if (!ref) return '';
  const key = ref.replace(/^wp:product\//, '');
  if (productSlug.has(key)) return productSlug.get(key);
  const hit = [...productSlug.values()].find((s) => s.startsWith(key));
  return hit || key;
};

// liens "wp:*" de l'export -> routes Next.js
function link(href) {
  if (!href) return '';
  if (href.startsWith('wp:cat/')) return `/collections/${href.slice(7)}`;
  if (href.startsWith('wp:product/')) return `/products/${resolveProduct(href)}`;
  if (href.startsWith('wp:page/')) {
    const s = href.slice(8);
    return ['legal-notice', 'privacy-policy', 'terms-of-service'].includes(s) ? `/policies/${s}` : `/pages/${s}`;
  }
  if (href.startsWith('wp:post/')) return `/blogs/le-miel-un-art-de-vivre/${href.slice(8)}`;
  if (href === 'wp:blog') return '/blogs/le-miel-un-art-de-vivre';
  if (href === 'wp:shop') return '/collections/all';
  if (href === 'wp:account') return '/account';
  return href;
}

// ---------- catégories ----------
const categories = rawCollections.map((c, i) => ({
  slug: c.slug,
  title: c.title,
  description: (c.description || '').replace(/^<p>|<\/p>$/g, ''),
  image: media(c.image),
  sortOrder: i,
}));

// ---------- produits ----------
const TITLES = {
  'miel-de-caroubier': "Miel de Caroubier", 'miel-deucalyptus': "Miel d'Eucalyptus", 'miel-de-thym': 'Miel de Thym',
  'miel-doranger': "Miel d'Oranger", 'miel-des-herbes-des-montagnes': 'Miel des Herbes des Montagnes',
  'miel-de-jujubier': 'Miel de Jujubier', 'miel-multifleurs': 'Miel Multifleurs', 'miel-d-euphorbe': 'Miel de Zakoum',
  'miel-de-daghmous': 'Miel de Daghmous', 'miel-danis': "Miel d'Anis",
};
const products = rawProducts.map((p, i) => {
  const slug = cleanSlug(p.handle);
  const shortKey = Object.keys(TITLES).find((k) => slug.startsWith(k));
  const images = p.images.map((im, j) => ({ url: media(im.src), alt: p.title, position: j })).filter((x) => x.url);
  const single = p.variants.length === 1 && /default/i.test(p.variants[0].title);
  return {
    slug,
    title: shortKey ? TITLES[shortKey] : p.title,
    subtitle: shortKey ? '250 g' : '',
    description: p.body_html || '',
    productType: p.product_type || '',
    vendor: p.vendor || 'ASAL',
    optionName: single ? '' : (p.options?.[0]?.name || ''),
    badge: p.collections.includes('les-rares') ? 'Récolte limitée' : '',
    sortOrder: i,
    categories: p.collections,
    images,
    // le site marocain ne vend pas les pots de 100 g à l'unité (réservés au marché France)
    variants: p.variants.filter((v) => !(shortKey && v.title === '100 g')).map((v, j) => ({
      title: single ? 'Défaut' : v.title,
      sku: v.sku || `${slug.slice(0, 18)}-${j + 1}`.toUpperCase(),
      price: Number(v.price),
      compareAtPrice: v.compare_at_price ? Number(v.compare_at_price) : null,
      stock: 25,
      image: v.featured_image ? media(v.featured_image.src) : '',
      position: j,
    })),
  };
});

// ---------- articles ----------
// corps de l'article = contenu de .asal-article-content (sans le gabarit Shopify)
const articleBody = (html) => {
  const m = html.match(/<div class="asal-article-content">([\s\S]*?)<\/div>\s*<\/div>\s*<div class="asal-related">/);
  return (m ? m[1] : html).replace(/\n\s+/g, '\n').trim();
};
const articleDate = (html) => {
  const m = html.match(/class="asal-meta">(\d{2})\/(\d{2})\/(\d{4})/);
  return m ? new Date(Date.UTC(+m[3], +m[2] - 1, +m[1], 10)).toISOString() : new Date(Date.UTC(2026, 6, 14, 10)).toISOString();
};
const posts = content.posts.map((p) => ({
  slug: p.slug,
  title: p.title,
  excerpt: p.excerpt.slice(0, 220),
  content: articleBody(p.content),
  image: media(p.image),
  publishedAt: articleDate(p.content),
}));
// extraits soignés de la page d'accueil (cartes du blog)
const home = content.pages.find((p) => p.type === 'home');
const block = (slug) => home.blocks.find((b) => b.slug === slug)?.values || {};
for (const card of block('ma-blog').cards || []) {
  const slug = (card.link || '').replace('wp:post/', '');
  const post = posts.find((p) => p.slug === slug);
  if (post) { post.excerpt = card.text_2 || post.excerpt; if (card.image) post.image = copyLocal(card.image) || post.image; }
}

// ---------- pages ----------
const pageBlock = (slug, b) => content.pages.find((p) => p.slug === slug)?.blocks.find((x) => x.slug === b)?.values || {};
const maFaq = block('ma-faq');
const faqItems = (maFaq.faqs || []).map((f) => ({ q: f.text, a: f.text_2 }));
// la dernière question est exportée à part (text_2 / text_3)
if (maFaq.text_2 && maFaq.text_3) faqItems.push({ q: maFaq.text_2, a: maFaq.text_3 });
const privacy = content.pages.find((p) => p.slug === 'privacy-policy');
const privacyHtml = (() => {
  const v = privacy?.blocks[1]?.values || {};
  const keys = Object.keys(v);
  let html = '';
  for (const k of keys) {
    const val = v[k];
    if (k.startsWith('heading')) html += `<h2>${val}</h2>`;
    else if (k.startsWith('text') || k === 'content') { if (String(val).trim().length > 1) html += /^\s*</.test(val) ? val : `<p>${val}</p>`; }
    else if (k.startsWith('items') && Array.isArray(val)) html += `<ul>${val.map((it) => `<li>${Object.values(it).filter((x) => typeof x === 'string').join(' ')}</li>`).join('')}</ul>`;
  }
  return html;
})();

const pages = [
  { slug: 'notre-histoire', title: 'Notre Histoire', template: 'default', content: pageBlock('notre-histoire', 'notre-histoire-main').content || '' },
  { slug: 'faq', title: 'FAQ', template: 'faq', content: JSON.stringify(faqItems) },
  { slug: 'livraison-retours', title: 'Livraison & Retours', template: 'default', content: pageBlock('livraison-retours', 'faq-main').content || '' },
  { slug: 'contact', title: 'Contact', template: 'contact', content: '' },
  { slug: 'composez-votre-coffret', title: 'Composez votre coffret', template: 'composer', content: '' },
  { slug: 'privacy-policy', title: 'Politique de confidentialité', template: 'policy', content: privacyHtml },
  {
    slug: 'legal-notice', title: 'Mentions légales', template: 'policy',
    content: '<h2>Éditeur du site</h2><p>ASAL Maroc — Marrakech, Maroc.<br>E-mail : contact@asalmaroc.com</p><h2>Hébergement</h2><p>Indiquez ici votre hébergeur.</p><h2>Propriété intellectuelle</h2><p>L’ensemble des contenus (textes, images, logos) de ce site est la propriété exclusive d’ASAL. Toute reproduction est interdite sans autorisation préalable.</p>',
  },
  {
    slug: 'terms-of-service', title: 'Conditions générales de vente', template: 'policy',
    content: '<h2>Article 1 — Objet</h2><p>Les présentes conditions régissent les ventes de produits ASAL réalisées sur ce site.</p><h2>Article 2 — Prix</h2><p>Les prix sont indiqués en dirhams marocains (MAD), toutes taxes comprises.</p><h2>Article 3 — Commande et paiement</h2><p>Le paiement s’effectue à la livraison, en espèces, auprès du livreur.</p><h2>Article 4 — Livraison</h2><p>Livraison partout au Maroc. Livraison gratuite dès 300 MAD d’achat.</p><h2>Article 5 — Retours</h2><p>Consultez notre page Livraison &amp; Retours.</p>',
  },
];

// ---------- sections d'accueil ----------
const hv = block('hero-video');
const sections = [];
const add = (type, data, isEnabled = true) => sections.push({ type, isEnabled, data });

add('hero_video', {
  eyebrow: hv.text, heading: hv.heading, text: hv.text_2,
  video: copyLocal(hv.video), poster: copyLocal(hv.image),
  btn1Label: hv.button_text, btn1Link: link(hv.button_link), btn2Label: hv.button_text_2, btn2Link: link(hv.button_link_2),
  mobileHeading: hv.heading_2 || "Des coffrets d'exception, directement du Maroc.",
  mobileText: hv.text_4 || 'Six ou neuf miels rares dans un écrin noir et or.',
  mobileBtnLabel: hv.button_text_3 || 'Voir les coffrets', mobileBtnLink: link(hv.button_link_3) || '/collections/coffrets-cadeaux',
  mobileLinkLabel: 'Nos miels', mobileLinkHref: '/collections/nos-miels',
});
add('reassurance', {
  items: [
    { icon: 'gift', title: 'Liberté de choix de votre coffret', text: 'Composez-le en 250g ou en 500g' },
    { icon: 'truck', title: 'Livraison gratuite dès 300 DHS', text: 'Partout au Maroc · Expédié depuis Marrakech' },
    { icon: 'leaf', title: 'Miel 100% naturel', text: 'Récolté au Maroc' },
    { icon: 'chat', title: 'Réponse sous 24h', text: 'Une question ? Écrivez-nous' },
  ],
});
const pep = block('pepites');
add('product_band', {
  eyebrow: pep.text, title: pep.text_2, titleLink: link(pep.link), text: pep.text_3,
  products: (pep.cards || []).map((c) => resolveProduct(c.link)), variant: '250 g', badge: 'Récolte limitée', columns: 3,
});
const nm = block('nos-miels');
add('product_row', {
  title: nm.heading, titleLink: link(nm.link), text: nm.text, linkLabel: nm.link_text, link: link(nm.link_2),
  products: (nm.cards || []).map((c) => resolveProduct(c.link)), variant: '250 g', columns: 4,
});
const bs = block('besoins');
add('needs', {
  heading: bs.heading, text: bs.text,
  cards: (bs.cards || []).map((c) => ({ image: copyLocal(c.image), title: c.text, text: c.text_2, linkLabel: c.text_3, link: link(c.link) })),
}, false); // masqué pour le marché Maroc dans l'original
const of = block('offrir');
add('gift_split', {
  eyebrow: of.text, heading: of.heading, text: of.text_2,
  pills: [{ icon: 'gift', label: 'Prêt à offrir' }, { icon: 'card', label: 'Carte message' }, { icon: 'tag', label: 'Présentation soignée' }],
  image: copyLocal(of.image), imageAlt: of.image_alt, seal: 'Votre<br>message',
});
const cf = block('coffrets');
add('coffrets', {
  eyebrow: cf.text, heading: cf.heading, text: cf.text_2,
  cards: [
    {
      product: resolveProduct((cf.cards || [])[0]?.link || 'coffret-cosy'), image: copyLocal(cf.cards?.[0]?.image), badge: 'Le plus généreux',
      title: "Coffret Cosy, 6 Miels d'Exception", tagline: 'Idéal pour les fêtes et les grandes occasions.',
      features: ["6 miels d'exception, pots de 250 g", 'Thym, Oranger, Sidr, Eucalyptus, Daghmous, Caroubier', 'Carte message personnalisée offerte'],
      ctaLabel: 'Choisir ce coffret',
    },
    {
      product: resolveProduct((cf.cards || [])[1]?.link || 'coffret-decouverte'), image: copyLocal(cf.cards?.[1]?.image), badge: '9 miels à explorer',
      title: "Coffret Découverte, 9 Miels d'Exception", tagline: 'Pour explorer et trouver vos miels préférés.',
      features: ["9 miels d'exception, pots de 100 g", 'Daghmous, Sidr, Thym, Oranger, Zakkoum et plus', 'Carte message personnalisée offerte'],
      ctaLabel: 'Choisir ce coffret',
    },
  ],
});
const mb = block('ma-blog');
add('blog_latest', { heading: mb.heading, text: mb.text, count: 3 });
const cp = block('compose');
add('compose_cta', {
  eyebrow: cp.text, heading: cp.heading, text: cp.text_2, note: cp.text_3,
  steps: (cp.steps || []).map((s) => ({ num: s.text, title: s.heading, text: s.text_2 })),
  ctaLabel: cp.link_text, ctaLink: link(cp.link),
});
const st = block('story');
add('story', {
  eyebrow: st.text, heading: st.heading, text: st.text_2, image: copyLocal(st.image), imageAlt: st.image_alt,
  link: link(st.link), linkLabel: st.link_text,
}, false);
const fq = block('ma-faq');
add('faq', {
  heading: fq.heading, text: fq.text, items: faqItems,
  cardTitle: fq.heading_2 || 'Une autre question ?', cardText: fq.text_4 || 'Notre équipe vous répond avec plaisir, sous 24 h ouvrées.',
  cardBtnLabel: fq.link_text || 'Nous contacter', cardBtnLink: link(fq.link) || '/pages/contact',
});

// ---------- réglages ----------
const menuItems = (items) => items.map((it) => ({ label: it.title, href: link(it.url), children: menuItems(it.children || []) }));
const settings = {
  brand: {
    name: 'ASAL', tagline: "L'or naturel du Maroc",
    logo: copyLocal('assets/images/8a0f20c6_logo_asal_maroc.png'), logoWidth: 54, logoWidthMobile: 42,
    favicon: copyLocal('assets/images/8a0f20c6_logo_asal_maroc.png'),
    footerLogoText: 'Asal',
    footerBlurb: 'Des miels rares du Maroc, sélectionnés à la source et livrés avec soin partout au Maroc.',
    copyright: '© 2026 ASAL Maroc',
  },
  menus: {
    header: menuItems(content.menus.find((m) => m.location === 'primary').items),
    footer1Title: 'La marque', footer1: menuItems(content.menus.find((m) => m.location === 'footer-1').items),
    footer2Title: 'Informations', footer2: menuItems(content.menus.find((m) => m.location === 'footer-2').items),
    legal: [
      { label: 'Mentions légales', href: '/policies/legal-notice' },
      { label: 'CGV', href: '/policies/terms-of-service' },
      { label: 'Confidentialité', href: '/policies/privacy-policy' },
    ],
  },
};

const out = { categories, products, posts, pages, sections, settings };
fs.writeFileSync(path.join(ROOT, 'prisma', 'seed-data.json'), JSON.stringify(out, null, 1));
console.log(`✔ ${categories.length} catégories, ${products.length} produits, ${posts.length} articles, ${pages.length} pages, ${sections.length} sections`);
console.log(`✔ ${copied.size} médias copiés dans public/media`);
const missing = products.filter((p) => !p.images.length).map((p) => p.slug);
if (missing.length) console.warn('⚠ produits sans image :', missing.join(', '));
