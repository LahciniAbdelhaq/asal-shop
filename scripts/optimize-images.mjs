#!/usr/bin/env node
/**
 * Optimise les images de public/media : conversion en WebP en 3 tailles
 *   nom.webp (1600 px max), nom-960.webp, nom-480.webp
 * puis remplace les anciens chemins (.png/.jpg) partout : base de données + prisma/seed-data.json.
 * Les originaux sont supprimés une fois remplacés.
 *
 * Usage : node scripts/optimize-images.mjs [--dry]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { PrismaClient } from '@prisma/client';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'public', 'media');
const DRY = process.argv.includes('--dry');
sharp.cache(false); // Windows : ne pas garder les fichiers ouverts
export const WIDTHS = [480, 960];

const files = fs.readdirSync(DIR).filter((f) => /\.(png|jpe?g|webp)$/i.test(f) && !/-(480|960)\.webp$/.test(f));
const map = new Map(); // ancien chemin public -> nouveau
let before = 0, after = 0;

for (const f of files) {
  const src = path.join(DIR, f);
  const base = f.replace(/\.(png|jpe?g|webp)$/i, '');
  const out = `${base}.webp`;
  const size = fs.statSync(src).size;
  before += size;
  const buf = fs.readFileSync(src); // lecture en mémoire : le fichier peut ensuite être supprimé
  const { width = 1600 } = await sharp(buf, { failOn: 'none' }).metadata();
  if (!DRY) {
    const tmp = path.join(DIR, `${base}.tmp.webp`);
    await sharp(buf).rotate().resize({ width: Math.min(width, 1600), withoutEnlargement: true }).webp({ quality: 80, effort: 5 }).toFile(tmp);
    for (const w of WIDTHS) {
      await sharp(buf).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: 78, effort: 5 }).toFile(path.join(DIR, `${base}-${w}.webp`));
    }
    if (f !== out) fs.unlinkSync(src);
    fs.renameSync(tmp, path.join(DIR, out));
    after += fs.statSync(path.join(DIR, out)).size;
  }
}
// table de correspondance à partir des .webp présents (permet de relancer le script sans risque)
for (const f of fs.readdirSync(DIR)) {
  if (!/\.webp$/.test(f) || /-(480|960)\.webp$/.test(f)) continue;
  const base = f.slice(0, -5);
  for (const ext of ['png', 'jpg', 'jpeg', 'PNG', 'JPG']) map.set(`/media/${base}.${ext}`, `/media/${f}`);
}
console.log(`${files.length} images · avant ${(before / 1048576).toFixed(1)} Mo → après ${(after / 1048576).toFixed(1)} Mo (taille 1600 px)`);
if (DRY || !map.size) process.exit(0);

const swap = (s) => {
  if (typeof s !== 'string' || !s.includes('/media/')) return s;
  for (const [a, b] of map) s = s.split(a).join(b);
  return s;
};

// seed-data.json
const seedPath = path.join(ROOT, 'prisma', 'seed-data.json');
fs.writeFileSync(seedPath, swap(fs.readFileSync(seedPath, 'utf8')));

// base de données
const db = new PrismaClient();
let n = 0;
const upd = async (model, rows, fields) => {
  for (const r of rows) {
    const data = {};
    for (const k of fields) { const v = swap(r[k]); if (v !== r[k]) data[k] = v; }
    if (Object.keys(data).length) { await db[model].update({ where: r.key ? { key: r.key } : { id: r.id }, data }); n++; }
  }
};
await upd('productImage', await db.productImage.findMany(), ['url']);
await upd('variant', await db.variant.findMany(), ['image']);
await upd('product', await db.product.findMany(), ['description']);
await upd('category', await db.category.findMany(), ['image', 'description']);
await upd('post', await db.post.findMany(), ['image', 'content']);
await upd('page', await db.page.findMany(), ['content']);
await upd('homeSection', await db.homeSection.findMany(), ['data']);
await upd('orderItem', await db.orderItem.findMany(), ['image']);
await upd('setting', await db.setting.findMany(), ['value']);
await db.$disconnect();
console.log(`✔ ${map.size} chemins remplacés · ${n} lignes mises à jour en base`);
