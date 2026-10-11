// Test de bout en bout : boutique (panier, promo, commande, coffret, contact) + back-office.
// Usage : node scripts/e2e.mjs [http://localhost:3000]   (le serveur doit tourner)
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('D:/projects/tool-clone/node_modules/playwright')); }

const BASE = process.argv[2] || 'http://localhost:3000';
const results = [];
const step = async (name, fn) => {
  try { await fn(); results.push(['✔', name]); console.log('✔', name); }
  catch (e) { results.push(['✘', name, e.message.split('\n')[0]]); console.log('✘', name, '→', e.message.split('\n')[0]); }
};
const expect = (cond, msg) => { if (!cond) throw new Error(msg); };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`${page.url()} : ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error' && !/favicon|404/.test(m.text())) errors.push(`${page.url()} : ${m.text()}`); });
let orderNo = '';

await step('Accueil : sections et produits', async () => {
  await page.goto(BASE + '/');
  for (const t of ['Les Pépites', 'Nos Miels', 'Coffrets Cadeaux', 'Questions fréquentes']) expect(await page.getByText(t, { exact: true }).first().isVisible(), `section « ${t} » absente`);
  expect((await page.locator('a[href*="shopify"], a[href*="asalmaroc.com"]').count()) === 0, 'lien vers Shopify trouvé');
});

await step('Fiche produit → ajout au panier (500 g)', async () => {
  await page.goto(BASE + '/products/miel-de-thym');
  await page.getByRole('button', { name: '500 g' }).click();
  await page.locator('.add-to-cart').click();
  await page.locator('.drawer.open').waitFor();
  expect(await page.locator('.drawer.open .cart-line').count() === 1, 'ligne panier absente');
  expect((await page.locator('.cart-count').textContent()) === '1', 'compteur panier');
});

await step('Compositeur de coffret → ajout au panier', async () => {
  await page.goto(BASE + '/pages/composez-votre-coffret');
  await page.getByRole('button', { name: '500 g' }).first().click();
  const plus = page.locator('.asal-composer-card button[aria-label="Ajouter"]');
  await plus.nth(0).click(); await plus.nth(1).click(); await plus.nth(2).click();
  await page.locator('.asal-composer-cta').click();
  await page.locator('.drawer.open').waitFor();
  expect(await page.locator('.drawer.open .cart-line').count() === 2, 'coffret absent du panier');
});

await step('Commande avec code promo BIENVENUE10', async () => {
  await page.goto(BASE + '/checkout');
  await page.getByPlaceholder('Code promo').fill('BIENVENUE10');
  await page.getByRole('button', { name: 'Appliquer' }).click();
  await page.locator('.promo-ok').waitFor();
  await page.fill('#email', 'test.e2e@exemple.ma');
  await page.fill('#phone', '0612345678');
  await page.fill('#firstName', 'Test');
  await page.fill('#lastName', 'Robot');
  await page.fill('#address', '12 rue des Abeilles');
  await page.fill('#city', 'Marrakech');
  await page.locator('button:has-text("Valider la commande")').click();
  await page.waitForURL(/\/checkout\/merci\//, { timeout: 20000 });
  orderNo = page.url().match(/merci\/(\d+)/)[1];
  expect(await page.getByText(`n° ${orderNo}`).isVisible(), 'numéro de commande absent');
  await page.waitForTimeout(400);
  expect(!(await page.locator('.cart-count').count()), 'panier non vidé');
});

await step('Formulaire de contact', async () => {
  await page.goto(BASE + '/pages/contact');
  await page.fill('#c-name', 'Robot E2E');
  await page.fill('#c-email', 'robot@exemple.ma');
  await page.fill('#c-body', 'Message de test automatique');
  await page.getByRole('button', { name: 'Envoyer' }).click();
  await page.locator('.form-success').waitFor();
});

await step('Collections, blog, pages légales, recherche', async () => {
  for (const u of ['/collections/nos-miels', '/collections/all?sort=price-asc', '/blogs/le-miel-un-art-de-vivre', '/policies/privacy-policy', '/pages/faq', '/search?q=thym']) {
    const r = await page.goto(BASE + u);
    expect(r.status() === 200, `${u} → ${r.status()}`);
  }
  expect((await page.locator('.product-card').count()) >= 1, 'recherche sans résultat');
});

await step('Back-office : connexion', async () => {
  await page.goto(BASE + '/admin');
  await page.waitForURL(/\/admin\/login/);
  await page.fill('#email', 'admin@asal.ma');
  await page.fill('#password', 'admin123');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await page.waitForURL(BASE + '/admin');
  expect(await page.getByText('Chiffre d’affaires').first().isVisible(), 'tableau de bord');
  await page.locator('.recharts-surface').first().waitFor();
});

await step('Back-office : la commande apparaît, passage en « Confirmée »', async () => {
  await page.goto(BASE + '/admin/orders');
  await page.getByRole('link', { name: `#${orderNo}` }).click();
  expect(await page.getByText('Coffret sur mesure').isVisible(), 'coffret absent de la commande');
  expect(await page.getByText('BIENVENUE10').isVisible(), 'code promo absent');
  await page.getByRole('button', { name: /Marquer « Confirmée »/ }).click();
  await page.getByText('Confirmée').first().waitFor();
});

await step('Back-office : toutes les pages répondent', async () => {
  for (const u of ['/admin/products', '/admin/products/new', '/admin/categories', '/admin/categories/new', '/admin/customers', '/admin/messages', '/admin/messages?tab=newsletter', '/admin/promos', '/admin/promos/new', '/admin/reviews', '/admin/pages', '/admin/blog', '/admin/home', '/admin/appearance?tab=colors', '/admin/appearance?tab=menus', '/admin/settings', '/admin/settings?tab=users', '/admin?p=365']) {
    const r = await page.goto(BASE + u);
    expect(r.status() === 200, `${u} → ${r.status()}`);
  }
});

await step('Back-office : modifier un prix → visible sur la boutique', async () => {
  await page.goto(BASE + '/admin/products');
  await page.getByRole('link', { name: 'Miel de Thym' }).click();
  const price = page.locator('tbody tr').filter({ has: page.locator('input[value="250 g"]') }).locator('input[type=number]').first();
  await price.fill('140');
  await page.getByRole('button', { name: 'Enregistrer' }).click();
  await page.getByText('Produit enregistré.').waitFor();
  await page.goto(BASE + '/collections/nos-miels');
  expect(await page.getByText('140 MAD').first().isVisible(), 'nouveau prix non affiché');
  await page.goto(BASE + '/admin/products');
  await page.getByRole('link', { name: 'Miel de Thym' }).click();
  await page.locator('tbody tr').filter({ has: page.locator('input[value="250 g"]') }).locator('input[type=number]').first().fill('135');
  await page.getByRole('button', { name: 'Enregistrer' }).click();
  await page.getByText('Produit enregistré.').waitFor();
});

await step('Back-office : changer la couleur principale → appliquée sur la boutique', async () => {
  await page.goto(BASE + '/admin/appearance?tab=colors');
  await page.getByRole('button', { name: 'Olive & crème' }).click();
  await page.getByRole('button', { name: 'Enregistrer' }).click();
  await page.getByText('Modifications enregistrées.').waitFor();
  await page.goto(BASE + '/');
  const c = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--c-primary').trim());
  expect(c.toUpperCase() === '#6B7F4E', `couleur = ${c}`);
  await page.goto(BASE + '/admin/appearance?tab=colors');
  await page.getByRole('button', { name: 'ASAL (origine)' }).click();
  await page.getByRole('button', { name: 'Enregistrer' }).click();
  await page.getByText('Modifications enregistrées.').waitFor();
});

await step('Back-office : modifier le titre du hero (page d’accueil)', async () => {
  await page.goto(BASE + '/admin/home');
  await page.locator('.section-row').first().getByTitle('Modifier').click();
  const h = page.locator('.field').filter({ hasText: 'Titre (HTML autorisé' }).locator('input');
  const old = await h.inputValue();
  await h.fill('Test E2E titre');
  await page.getByRole('button', { name: 'Enregistrer' }).click();
  await page.getByText('Section enregistrée.').waitFor();
  await page.goto(BASE + '/');
  expect(await page.getByText('Test E2E titre').first().isVisible(), 'titre non mis à jour');
  await page.goto(BASE + '/admin/home');
  await page.locator('.section-row').first().getByTitle('Modifier').click();
  await page.locator('.field').filter({ hasText: 'Titre (HTML autorisé' }).locator('input').fill(old);
  await page.getByRole('button', { name: 'Enregistrer' }).click();
  await page.getByText('Section enregistrée.').waitFor();
});

await step('Back-office : envoi d’image', async () => {
  const r = await page.request.post(BASE + '/api/admin/upload', {
    multipart: { file: { name: 'pixel.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64') } },
  });
  const j = await r.json();
  expect(j.urls?.[0], 'pas d’URL');
  const img = await page.request.get(BASE + j.urls[0]);
  expect(img.status() === 200 && img.headers()['content-type'] === 'image/png', 'image non servie');
});

await step('Sécurité : back-office inaccessible sans session', async () => {
  const anon = await browser.newContext();
  const p2 = await anon.newPage();
  await p2.goto(BASE + '/admin/orders');
  expect(p2.url().includes('/admin/login'), 'pas de redirection');
  const r = await p2.request.post(BASE + '/api/admin/upload', { multipart: { file: { name: 'a.png', mimeType: 'image/png', buffer: Buffer.from('x') } } });
  expect(r.status() === 401, `upload anonyme → ${r.status()}`);
  await anon.close();
});

await browser.close();
console.log('\nErreurs JavaScript :', errors.length ? '\n  ' + [...new Set(errors)].join('\n  ') : 'aucune');
const failed = results.filter((r) => r[0] === '✘');
console.log(`\n${results.length - failed.length}/${results.length} étapes réussies`);
process.exit(failed.length ? 1 : 0);
