// Remplit la base à partir de prisma/seed-data.json (généré par scripts/import-clone.mjs)
// Usage : node prisma/seed.mjs [--demo]   (--demo ajoute clients, commandes et messages de démonstration)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();
const dir = path.dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(fs.readFileSync(path.join(dir, 'seed-data.json'), 'utf8'));

async function main() {
  // protection : ne jamais écraser une boutique déjà en service (ex. base de production)
  if ((await db.product.count()) > 0 && !process.argv.includes('--force')) {
    console.log('ℹ La base contient déjà un catalogue : rien n’a été modifié. Relancez avec --force pour tout réinitialiser.');
    return;
  }
  // on repart d'une base propre (ordre des suppressions : dépendances d'abord)
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.review.deleteMany();
  await db.productImage.deleteMany();
  await db.variant.deleteMany();
  await db.product.deleteMany();
  await db.category.deleteMany();
  await db.post.deleteMany();
  await db.page.deleteMany();
  await db.homeSection.deleteMany();
  await db.setting.deleteMany();

  for (const c of data.categories) await db.category.create({ data: c });

  for (const p of data.products) {
    const { categories, images, variants, ...rest } = p;
    await db.product.create({
      data: {
        ...rest,
        categories: { connect: categories.map((slug) => ({ slug })) },
        images: { create: images },
        variants: { create: variants },
      },
    });
  }

  for (const p of data.posts) await db.post.create({ data: { ...p, publishedAt: new Date(p.publishedAt) } });
  for (const p of data.pages) await db.page.create({ data: p });
  let i = 0;
  for (const s of data.sections) {
    await db.homeSection.create({ data: { type: s.type, isEnabled: s.isEnabled, position: i++, data: JSON.stringify(s.data) } });
  }
  for (const [key, value] of Object.entries(data.settings)) {
    await db.setting.create({ data: { key, value: JSON.stringify(value) } });
  }

  if (!(await db.adminUser.count())) {
    await db.adminUser.create({
      data: { email: 'admin@asal.ma', name: 'Administrateur', passwordHash: await bcrypt.hash('admin123', 10), role: 'admin' },
    });
  }
  if (!(await db.promoCode.count())) {
    await db.promoCode.createMany({
      data: [
        { code: 'BIENVENUE10', type: 'percent', value: 10, minSubtotal: 0 },
        { code: 'LIVRAISON', type: 'free_shipping', value: 0, minSubtotal: 150 },
      ],
    });
  }

  console.log('✔ Catalogue importé :', data.products.length, 'produits,', data.categories.length, 'catégories');
  if (process.argv.includes('--demo')) await demo();
  console.log('✔ Admin : http://localhost:3000/admin  —  admin@asal.ma / admin123');
}

// ---------- données de démonstration (statistiques) ----------
async function demo() {
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.customer.deleteMany();
  await db.message.deleteMany();
  await db.subscriber.deleteMany();

  let seed = 42;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const pick = (a) => a[Math.floor(rnd() * a.length)];

  const first = ['Yasmine', 'Omar', 'Salma', 'Mehdi', 'Imane', 'Karim', 'Nadia', 'Youssef', 'Sara', 'Hamza', 'Leila', 'Anas', 'Khadija', 'Reda', 'Meryem', 'Adil', 'Hind', 'Amine'];
  const last = ['Benali', 'El Amrani', 'Idrissi', 'Tazi', 'Alaoui', 'Bennani', 'Chraibi', 'Fassi', 'Berrada', 'Kettani', 'Lahlou', 'Sqalli'];
  const cities = ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Meknès'];

  const customers = [];
  for (let k = 0; k < 24; k++) {
    const fn = pick(first), ln = pick(last);
    const email = `${fn}.${ln}.${k}`.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '') + '@exemple.ma';
    customers.push(await db.customer.create({
      data: {
        email, firstName: fn, lastName: ln, phone: '06' + String(10000000 + Math.floor(rnd() * 89999999)),
        address: `${Math.floor(rnd() * 120) + 1} rue des Orangers`, city: pick(cities), zip: '', acceptsMarketing: rnd() > 0.5,
        createdAt: new Date(Date.now() - (60 + Math.floor(rnd() * 30)) * 864e5),
      },
    }));
  }

  const variants = await db.variant.findMany({ include: { product: { include: { images: true } } } });
  const statuses = ['delivered', 'delivered', 'delivered', 'shipped', 'confirmed', 'pending', 'cancelled'];
  let number = 1001;
  for (let d = 60; d >= 0; d--) {
    const n = Math.floor(rnd() * 3) + (d < 20 ? 1 : 0);
    for (let j = 0; j < n; j++) {
      const c = pick(customers);
      const lines = [];
      const count = 1 + Math.floor(rnd() * 3);
      for (let l = 0; l < count; l++) {
        const v = pick(variants);
        lines.push({
          productId: v.productId, variantId: v.id, title: v.product.title, variantTitle: v.title === 'Défaut' ? '' : v.title,
          image: v.product.images[0]?.url || '', price: v.price, quantity: 1 + Math.floor(rnd() * 2),
        });
      }
      const subtotal = lines.reduce((s, x) => s + x.price * x.quantity, 0);
      const shipping = subtotal >= 300 ? 0 : 30;
      const status = d < 2 ? 'pending' : pick(statuses);
      const created = new Date(Date.now() - d * 864e5 - Math.floor(rnd() * 8e7));
      await db.order.create({
        data: {
          number: number++, customerId: c.id, email: c.email, phone: c.phone, firstName: c.firstName, lastName: c.lastName,
          address: c.address, city: c.city, subtotal, shipping, total: subtotal + shipping, status,
          paymentStatus: status === 'delivered' ? 'paid' : 'unpaid', createdAt: created, items: { create: lines },
        },
      });
    }
  }

  await db.message.createMany({
    data: [
      { name: 'Salma Idrissi', email: 'salma@exemple.ma', phone: '0612345678', body: 'Bonjour, proposez-vous des coffrets personnalisés pour un mariage (80 invités) ? Merci !', createdAt: new Date(Date.now() - 2 * 864e5) },
      { name: 'Karim Tazi', email: 'karim@exemple.ma', body: 'Le miel de Daghmous convient-il aux enfants ? Quelle quantité par jour ?', createdAt: new Date(Date.now() - 864e5) },
      { name: 'Société Atlas Events', email: 'contact@atlas-events.ma', phone: '0522000000', subject: 'Devis entreprise', body: 'Nous souhaitons 150 coffrets Cosy pour nos clients en fin d’année. Pouvez-vous nous faire un devis ?', isRead: true, createdAt: new Date(Date.now() - 5 * 864e5) },
    ],
  });
  await db.subscriber.createMany({ data: customers.filter((c) => c.acceptsMarketing).map((c) => ({ email: c.email })) });
  const prods = await db.product.findMany({ take: 4 });
  await db.review.createMany({
    data: [
      { productId: prods[1].id, name: 'Meryem B.', rating: 5, comment: 'Un miel exceptionnel, très parfumé. Livraison rapide à Rabat.', approved: true },
      { productId: prods[3].id, name: 'Omar A.', rating: 5, comment: 'Le meilleur miel de thym que j’ai goûté. Je recommande !', approved: true },
      { productId: prods[3].id, name: 'Hind L.', rating: 4, comment: 'Très bon goût, pot magnifique.', approved: false },
    ],
  });
  console.log(`✔ Démo : ${customers.length} clients, ${number - 1001} commandes, messages et avis`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
