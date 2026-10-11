'use server';

import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { clearSession, requireAdmin, setSession } from '@/lib/auth';
import { saveSetting } from '@/lib/settings';
import { DEFAULT_SETTINGS, type SettingKey } from '@/lib/defaults';
import { SECTION_SCHEMAS } from '@/lib/sections';
import { slugify } from '@/lib/format';

export type Result = { ok: boolean; message: string; id?: number } | null;
const ok = (message = 'Modifications enregistrées.', id?: number): Result => ({ ok: true, message, id });
const fail = (message: string): Result => ({ ok: false, message });
const str = (f: FormData, k: string) => String(f.get(k) ?? '').trim();
const num = (f: FormData, k: string, d = 0) => { const n = Number(String(f.get(k) ?? '').replace(',', '.')); return Number.isFinite(n) ? n : d; };
const bool = (f: FormData, k: string) => f.get(k) === 'on' || f.get(k) === 'true' || f.get(k) === '1';
const json = <T,>(f: FormData, k: string, d: T): T => { try { return JSON.parse(String(f.get(k) ?? '')) as T; } catch { return d; } };
const refreshShop = () => revalidatePath('/', 'layout');

// ---------------------------------------------------------------- session
export async function adminLogin(_: Result, f: FormData): Promise<Result> {
  const email = str(f, 'email').toLowerCase();
  const user = await db.adminUser.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(str(f, 'password'), user.passwordHash))) return fail('Identifiants incorrects.');
  await setSession('admin', user.id);
  redirect('/admin');
}

export async function adminLogout() {
  await clearSession('admin');
  redirect('/admin/login');
}

// ---------------------------------------------------------------- produits
type VariantIn = { id?: number; title: string; sku: string; price: number; compareAtPrice: number | null; stock: number; trackStock: boolean; image: string };
type ImageIn = { url: string; alt: string };

export async function saveProduct(_: Result, f: FormData): Promise<Result> {
  await requireAdmin();
  const id = num(f, 'id');
  const title = str(f, 'title');
  if (!title) return fail('Le titre est obligatoire.');
  const slug = slugify(str(f, 'slug') || title);
  const clash = await db.product.findFirst({ where: { slug, NOT: id ? { id } : undefined } });
  if (clash) return fail(`L’URL « ${slug} » est déjà utilisée par « ${clash.title} ».`);

  const variants = json<VariantIn[]>(f, 'variants', []).filter((v) => v.title || v.price);
  if (!variants.length) return fail('Ajoutez au moins une variante avec un prix.');
  const images = json<ImageIn[]>(f, 'images', []).filter((i) => i.url);
  const categoryIds = json<number[]>(f, 'categories', []);

  const data = {
    title,
    slug,
    subtitle: str(f, 'subtitle'),
    description: str(f, 'description'),
    productType: str(f, 'productType'),
    vendor: str(f, 'vendor') || 'ASAL',
    status: str(f, 'status') === 'draft' ? 'draft' : 'active',
    badge: str(f, 'badge'),
    optionName: str(f, 'optionName'),
    featured: bool(f, 'featured'),
    sortOrder: num(f, 'sortOrder'),
    seoTitle: str(f, 'seoTitle'),
    seoDescription: str(f, 'seoDescription'),
  };

  const productId = await db.$transaction(async (tx) => {
    const p = id
      ? await tx.product.update({ where: { id }, data: { ...data, categories: { set: categoryIds.map((c) => ({ id: c })) } } })
      : await tx.product.create({ data: { ...data, categories: { connect: categoryIds.map((c) => ({ id: c })) } } });
    await tx.productImage.deleteMany({ where: { productId: p.id } });
    if (images.length) await tx.productImage.createMany({ data: images.map((im, i) => ({ productId: p.id, url: im.url, alt: im.alt || title, position: i })) });
    // variantes : mise à jour en place (les commandes gardent leurs références)
    const keep = variants.filter((v) => v.id).map((v) => v.id!) as number[];
    await tx.variant.deleteMany({ where: { productId: p.id, id: { notIn: keep } } });
    for (const [i, v] of variants.entries()) {
      const vd = {
        title: v.title || 'Défaut', sku: v.sku || '', price: Number(v.price) || 0,
        compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null, stock: Math.round(Number(v.stock) || 0),
        trackStock: v.trackStock !== false, image: v.image || '', position: i,
      };
      if (v.id) await tx.variant.update({ where: { id: v.id }, data: vd });
      else await tx.variant.create({ data: { ...vd, productId: p.id } });
    }
    return p.id;
  });
  refreshShop();
  if (!id) redirect(`/admin/products/${productId}?created=1`);
  return ok('Produit enregistré.', productId);
}

export async function deleteProduct(f: FormData) {
  await requireAdmin();
  await db.product.delete({ where: { id: num(f, 'id') } });
  refreshShop();
  redirect('/admin/products');
}

export async function duplicateProduct(f: FormData) {
  await requireAdmin();
  const p = await db.product.findUnique({ where: { id: num(f, 'id') }, include: { images: true, variants: true, categories: true } });
  if (!p) return;
  let slug = `${p.slug}-copie`;
  for (let i = 2; await db.product.findUnique({ where: { slug } }); i++) slug = `${p.slug}-copie-${i}`;
  const copy = await db.product.create({
    data: {
      slug, title: `${p.title} (copie)`, subtitle: p.subtitle, description: p.description, productType: p.productType, vendor: p.vendor,
      status: 'draft', badge: p.badge, optionName: p.optionName, sortOrder: p.sortOrder + 1,
      categories: { connect: p.categories.map((c) => ({ id: c.id })) },
      images: { create: p.images.map(({ url, alt, position }) => ({ url, alt, position })) },
      variants: { create: p.variants.map(({ title, sku, price, compareAtPrice, stock, trackStock, image, position }) => ({ title, sku, price, compareAtPrice, stock, trackStock, image, position })) },
    },
  });
  redirect(`/admin/products/${copy.id}`);
}

export async function quickStock(f: FormData) {
  await requireAdmin();
  await db.variant.update({ where: { id: num(f, 'variantId') }, data: { stock: Math.max(0, Math.round(num(f, 'stock'))) } });
  revalidatePath('/admin/products');
  refreshShop();
}

// ---------------------------------------------------------------- catégories
export async function saveCategory(_: Result, f: FormData): Promise<Result> {
  await requireAdmin();
  const id = num(f, 'id');
  const title = str(f, 'title');
  if (!title) return fail('Le nom est obligatoire.');
  const slug = slugify(str(f, 'slug') || title);
  const clash = await db.category.findFirst({ where: { slug, NOT: id ? { id } : undefined } });
  if (clash) return fail(`L’URL « ${slug} » est déjà utilisée.`);
  const productIds = json<number[]>(f, 'products', []);
  const data = {
    title, slug, description: str(f, 'description'), image: str(f, 'image'), sortOrder: num(f, 'sortOrder'),
    isActive: bool(f, 'isActive'), seoTitle: str(f, 'seoTitle'), seoDescription: str(f, 'seoDescription'),
  };
  const c = id
    ? await db.category.update({ where: { id }, data: { ...data, products: { set: productIds.map((p) => ({ id: p })) } } })
    : await db.category.create({ data: { ...data, products: { connect: productIds.map((p) => ({ id: p })) } } });
  refreshShop();
  if (!id) redirect(`/admin/categories/${c.id}?created=1`);
  return ok('Catégorie enregistrée.', c.id);
}

export async function deleteCategory(f: FormData) {
  await requireAdmin();
  await db.category.delete({ where: { id: num(f, 'id') } });
  refreshShop();
  redirect('/admin/categories');
}

// ---------------------------------------------------------------- commandes
export async function updateOrder(_: Result, f: FormData): Promise<Result> {
  await requireAdmin();
  const id = num(f, 'id');
  const order = await db.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) return fail('Commande introuvable.');
  const status = str(f, 'status') || order.status;
  // annulation : on remet le stock ; réactivation : on le reprend
  if (status !== order.status && (status === 'cancelled' || order.status === 'cancelled')) {
    const sign = status === 'cancelled' ? 1 : -1;
    for (const it of order.items) {
      const parts: { id: number; q: number }[] = [];
      if (it.meta) {
        try { (JSON.parse(it.meta).items as { variantId: number; qty: number }[]).forEach((x) => parts.push({ id: x.variantId, q: x.qty * it.quantity })); } catch { /* */ }
      } else if (it.variantId) parts.push({ id: it.variantId, q: it.quantity });
      for (const p of parts) await db.variant.updateMany({ where: { id: p.id, trackStock: true }, data: { stock: { increment: sign * p.q } } });
    }
  }
  await db.order.update({
    where: { id },
    data: {
      status,
      paymentStatus: str(f, 'paymentStatus') || order.paymentStatus,
      adminNote: f.has('adminNote') ? str(f, 'adminNote') : order.adminNote,
      ...(f.has('address') ? { firstName: str(f, 'firstName'), lastName: str(f, 'lastName'), phone: str(f, 'phone'), email: str(f, 'email'), address: str(f, 'address'), city: str(f, 'city'), zip: str(f, 'zip') } : {}),
    },
  });
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath('/admin/orders');
  return ok('Commande mise à jour.');
}

export async function setOrderStatus(f: FormData) {
  const fd = new FormData();
  fd.set('id', String(f.get('id')));
  fd.set('status', String(f.get('status')));
  if (f.get('status') === 'delivered') fd.set('paymentStatus', 'paid');
  await updateOrder(null, fd);
}

export async function deleteOrder(f: FormData) {
  await requireAdmin();
  await db.order.delete({ where: { id: num(f, 'id') } });
  redirect('/admin/orders');
}

// ---------------------------------------------------------------- clients
export async function saveCustomer(_: Result, f: FormData): Promise<Result> {
  await requireAdmin();
  const id = num(f, 'id');
  const email = str(f, 'email').toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('E-mail invalide.');
  const clash = await db.customer.findFirst({ where: { email, NOT: id ? { id } : undefined } });
  if (clash) return fail('Un autre client utilise déjà cet e-mail.');
  const data = {
    email, firstName: str(f, 'firstName'), lastName: str(f, 'lastName'), phone: str(f, 'phone'), address: str(f, 'address'),
    city: str(f, 'city'), zip: str(f, 'zip'), country: str(f, 'country') || 'Maroc', notes: str(f, 'notes'), acceptsMarketing: bool(f, 'acceptsMarketing'),
  };
  const c = id ? await db.customer.update({ where: { id }, data }) : await db.customer.create({ data });
  if (!id) redirect(`/admin/customers/${c.id}`);
  revalidatePath(`/admin/customers/${id}`);
  return ok('Client enregistré.', c.id);
}

export async function deleteCustomer(f: FormData) {
  await requireAdmin();
  await db.customer.delete({ where: { id: num(f, 'id') } });
  redirect('/admin/customers');
}

// ---------------------------------------------------------------- messages & newsletter
export async function setMessageRead(f: FormData) {
  await requireAdmin();
  await db.message.update({ where: { id: num(f, 'id') }, data: { isRead: f.get('read') === '1' } });
  revalidatePath('/admin', 'layout');
}

export async function archiveMessage(f: FormData) {
  await requireAdmin();
  await db.message.update({ where: { id: num(f, 'id') }, data: { archived: f.get('archived') === '1', isRead: true } });
  revalidatePath('/admin', 'layout');
}

export async function deleteMessage(f: FormData) {
  await requireAdmin();
  await db.message.delete({ where: { id: num(f, 'id') } });
  redirect('/admin/messages');
}

export async function deleteSubscriber(f: FormData) {
  await requireAdmin();
  await db.subscriber.delete({ where: { id: num(f, 'id') } });
  revalidatePath('/admin/messages');
}

// ---------------------------------------------------------------- codes promo
export async function savePromo(_: Result, f: FormData): Promise<Result> {
  await requireAdmin();
  const id = num(f, 'id');
  const code = str(f, 'code').toUpperCase().replace(/\s+/g, '');
  if (!code) return fail('Le code est obligatoire.');
  const clash = await db.promoCode.findFirst({ where: { code, NOT: id ? { id } : undefined } });
  if (clash) return fail('Ce code existe déjà.');
  const type = ['percent', 'fixed', 'free_shipping'].includes(str(f, 'type')) ? str(f, 'type') : 'percent';
  const value = num(f, 'value');
  if (type === 'percent' && (value <= 0 || value > 100)) return fail('Le pourcentage doit être compris entre 1 et 100.');
  const date = (k: string) => (str(f, k) ? new Date(str(f, k)) : null);
  const data = {
    code, type, value, minSubtotal: num(f, 'minSubtotal'), maxUses: str(f, 'maxUses') ? Math.round(num(f, 'maxUses')) : null,
    startsAt: date('startsAt'), endsAt: date('endsAt'), isActive: bool(f, 'isActive'),
  };
  const p = id ? await db.promoCode.update({ where: { id }, data }) : await db.promoCode.create({ data });
  revalidatePath('/admin/promos');
  if (!id) redirect('/admin/promos');
  return ok('Code promo enregistré.', p.id);
}

export async function deletePromo(f: FormData) {
  await requireAdmin();
  await db.promoCode.delete({ where: { id: num(f, 'id') } });
  redirect('/admin/promos');
}

// ---------------------------------------------------------------- avis
export async function moderateReview(f: FormData) {
  await requireAdmin();
  const id = num(f, 'id');
  if (f.get('op') === 'delete') await db.review.delete({ where: { id } });
  else await db.review.update({ where: { id }, data: { approved: f.get('op') === 'approve' } });
  revalidatePath('/admin/reviews');
  refreshShop();
}

// ---------------------------------------------------------------- pages & blog
export async function savePage(_: Result, f: FormData): Promise<Result> {
  await requireAdmin();
  const id = num(f, 'id');
  const title = str(f, 'title');
  if (!title) return fail('Le titre est obligatoire.');
  const slug = slugify(str(f, 'slug') || title);
  const clash = await db.page.findFirst({ where: { slug, NOT: id ? { id } : undefined } });
  if (clash) return fail('Cette URL est déjà utilisée.');
  const data = {
    title, slug, content: String(f.get('content') ?? ''), template: str(f, 'template') || 'default',
    isPublished: bool(f, 'isPublished'), seoTitle: str(f, 'seoTitle'), seoDescription: str(f, 'seoDescription'),
  };
  const p = id ? await db.page.update({ where: { id }, data }) : await db.page.create({ data });
  refreshShop();
  if (!id) redirect(`/admin/pages/${p.id}`);
  return ok('Page enregistrée.', p.id);
}

export async function deletePage(f: FormData) {
  await requireAdmin();
  await db.page.delete({ where: { id: num(f, 'id') } });
  refreshShop();
  redirect('/admin/pages');
}

export async function savePost(_: Result, f: FormData): Promise<Result> {
  await requireAdmin();
  const id = num(f, 'id');
  const title = str(f, 'title');
  if (!title) return fail('Le titre est obligatoire.');
  const slug = slugify(str(f, 'slug') || title);
  const clash = await db.post.findFirst({ where: { slug, NOT: id ? { id } : undefined } });
  if (clash) return fail('Cette URL est déjà utilisée.');
  const data = {
    title, slug, excerpt: str(f, 'excerpt'), content: String(f.get('content') ?? ''), image: str(f, 'image'), author: str(f, 'author') || 'ASAL',
    isPublished: bool(f, 'isPublished'), publishedAt: str(f, 'publishedAt') ? new Date(str(f, 'publishedAt')) : new Date(),
  };
  const p = id ? await db.post.update({ where: { id }, data }) : await db.post.create({ data });
  refreshShop();
  if (!id) redirect(`/admin/blog/${p.id}`);
  return ok('Article enregistré.', p.id);
}

export async function deletePost(f: FormData) {
  await requireAdmin();
  await db.post.delete({ where: { id: num(f, 'id') } });
  refreshShop();
  redirect('/admin/blog');
}

// ---------------------------------------------------------------- page d'accueil
export async function saveSection(_: Result, f: FormData): Promise<Result> {
  await requireAdmin();
  const id = num(f, 'id');
  const data = json<Record<string, unknown>>(f, 'data', {});
  await db.homeSection.update({ where: { id }, data: { data: JSON.stringify(data), isEnabled: bool(f, 'isEnabled') } });
  refreshShop();
  return ok('Section enregistrée.');
}

export async function addSection(f: FormData) {
  await requireAdmin();
  const type = str(f, 'type');
  const schema = SECTION_SCHEMAS[type];
  if (!schema) return;
  const last = await db.homeSection.findFirst({ orderBy: { position: 'desc' } });
  const s = await db.homeSection.create({ data: { type, position: (last?.position ?? -1) + 1, data: JSON.stringify(schema.defaults) } });
  refreshShop();
  redirect(`/admin/home?s=${s.id}`);
}

export async function sectionOp(f: FormData) {
  await requireAdmin();
  const id = num(f, 'id');
  const op = str(f, 'op');
  const all = await db.homeSection.findMany({ orderBy: { position: 'asc' } });
  const i = all.findIndex((s) => s.id === id);
  if (i < 0) return;
  if (op === 'delete') await db.homeSection.delete({ where: { id } });
  if (op === 'toggle') await db.homeSection.update({ where: { id }, data: { isEnabled: !all[i].isEnabled } });
  if (op === 'duplicate') {
    await db.homeSection.create({ data: { type: all[i].type, data: all[i].data, isEnabled: false, position: all[i].position } });
  }
  if (op === 'up' || op === 'down') {
    const j = op === 'up' ? i - 1 : i + 1;
    if (j >= 0 && j < all.length) [all[i], all[j]] = [all[j], all[i]];
  }
  // renumérotation propre
  const fresh = op === 'up' || op === 'down' ? all : await db.homeSection.findMany({ orderBy: [{ position: 'asc' }, { id: 'asc' }] });
  await db.$transaction(fresh.filter((s) => !(op === 'delete' && s.id === id)).map((s, k) => db.homeSection.update({ where: { id: s.id }, data: { position: k } })));
  refreshShop();
  revalidatePath('/admin/home');
}

// ---------------------------------------------------------------- réglages
export async function saveSettings(_: Result, f: FormData): Promise<Result> {
  await requireAdmin();
  const key = str(f, 'key') as SettingKey;
  if (!(key in DEFAULT_SETTINGS)) return fail('Réglage inconnu.');
  const value = json(f, 'value', null);
  if (value === null) return fail('Données invalides.');
  await saveSetting(key, value as never);
  refreshShop();
  return ok();
}

export async function resetSettings(_: Result, f: FormData): Promise<Result> {
  await requireAdmin();
  const key = str(f, 'key') as SettingKey;
  if (!(key in DEFAULT_SETTINGS)) return fail('Réglage inconnu.');
  await saveSetting(key, DEFAULT_SETTINGS[key] as never);
  refreshShop();
  return ok('Valeurs par défaut restaurées.');
}

// ---------------------------------------------------------------- administrateurs
export async function saveAdminUser(_: Result, f: FormData): Promise<Result> {
  const me = await requireAdmin();
  const id = num(f, 'id');
  const email = str(f, 'email').toLowerCase();
  const password = str(f, 'password');
  if (!email) return fail('E-mail obligatoire.');
  if (!id && password.length < 6) return fail('Mot de passe : 6 caractères minimum.');
  if (id && password && password.length < 6) return fail('Mot de passe : 6 caractères minimum.');
  if (me.role !== 'admin' && id !== me.id) return fail('Seul un administrateur peut gérer les comptes.');
  const clash = await db.adminUser.findFirst({ where: { email, NOT: id ? { id } : undefined } });
  if (clash) return fail('Cet e-mail est déjà utilisé.');
  const data = { email, name: str(f, 'name') || email, role: me.role === 'admin' ? (str(f, 'role') === 'editor' ? 'editor' : 'admin') : me.role, ...(password ? { passwordHash: await bcrypt.hash(password, 10) } : {}) };
  if (id) await db.adminUser.update({ where: { id }, data });
  else await db.adminUser.create({ data: { ...data, passwordHash: data.passwordHash! } });
  revalidatePath('/admin/settings');
  return ok(id ? 'Compte mis à jour.' : 'Compte créé.');
}

export async function deleteAdminUser(f: FormData) {
  const me = await requireAdmin();
  const id = num(f, 'id');
  if (me.role !== 'admin' || id === me.id) return;
  await db.adminUser.delete({ where: { id } });
  revalidatePath('/admin/settings');
}
