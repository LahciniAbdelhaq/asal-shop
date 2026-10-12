// Charge les traductions anglaise et arabe du contenu de départ (produits, catégories, accueil, pages, blog, réglages).
// Les traductions déjà saisies dans le back-office sont conservées ; `--force` les remplace.
//   npm run db:translations
import { PrismaClient } from '@prisma/client';
import en from './translations/en.mjs';
import ar from './translations/ar.mjs';

const db = new PrismaClient();
const force = process.argv.includes('--force');
const SEEDS = { en, ar };

const parse = (s) => { try { const v = JSON.parse(s || '{}'); return v && typeof v === 'object' ? v : {}; } catch { return {}; } };
// les valeurs existantes l'emportent (sauf --force)
const merge = (seed, existing) => (force ? { ...existing, ...seed } : { ...seed, ...existing });

async function update(model, rows, key, build) {
  let n = 0;
  for (const row of rows) {
    const all = parse(row.i18n);
    let changed = false;
    for (const [lang, seed] of Object.entries(SEEDS)) {
      const over = build(seed, row);
      if (!over || !Object.keys(over).length) continue;
      const next = merge(over, all[lang] || {});
      if (JSON.stringify(next) !== JSON.stringify(all[lang] || {})) { all[lang] = next; changed = true; }
    }
    if (changed) { await db[model].update({ where: { id: row.id }, data: { i18n: JSON.stringify(all) } }); n++; }
  }
  console.log(`${model.padEnd(12)} ${n}/${rows.length} mis à jour`);
}

const pick = (o) => Object.fromEntries(Object.entries(o).filter(([k, v]) => typeof v === 'string' && v && k !== 'faq'));

// ---- produits (titres de variantes : table commune variantTitles)
await update('product', await db.product.findMany({ include: { variants: true } }), 'slug', (seed, p) => {
  const t = seed.products[p.slug];
  const variants = Object.fromEntries(p.variants.filter((v) => seed.variantTitles[v.title] && seed.variantTitles[v.title] !== v.title).map((v) => [v.id, seed.variantTitles[v.title]]));
  const over = t ? pick(t) : {};
  if (Object.keys(variants).length) over.variants = variants;
  return over;
});

await update('category', await db.category.findMany(), 'slug', (seed, c) => (seed.categories[c.slug] ? pick(seed.categories[c.slug]) : null));
await update('post', await db.post.findMany(), 'slug', (seed, p) => (seed.posts[p.slug] ? pick(seed.posts[p.slug]) : null));
await update('page', await db.page.findMany(), 'slug', (seed, p) => {
  const t = seed.pages[p.slug];
  if (!t) return null;
  const over = pick(t);
  // page FAQ : mêmes questions que la section FAQ de l'accueil
  if (t.faq && p.template === 'faq') over.content = JSON.stringify(seed.sections.faq.items);
  return over;
});
await update('homeSection', await db.homeSection.findMany(), 'type', (seed, s) => seed.sections[s.type] || null);

// ---- réglages : ligne « i18n.<langue> » de la table Setting
for (const [lang, seed] of Object.entries(SEEDS)) {
  const key = `i18n.${lang}`;
  const row = await db.setting.findUnique({ where: { key } });
  const all = parse(row?.value);
  for (const [k, v] of Object.entries(seed.settings)) if (force || !(k in all)) all[k] = v;
  const value = JSON.stringify(all);
  await db.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  console.log(`setting      ${key} : ${Object.keys(all).join(', ')}`);
}

await db.$disconnect();
console.log('Traductions chargées.');
