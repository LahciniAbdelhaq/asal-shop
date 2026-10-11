'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { priceCart } from '@/lib/pricing';
import { getSettings } from '@/lib/settings';
import { clearSession, getCustomer, setSession } from '@/lib/auth';
import type { CartLine } from '@/lib/cart-types';

type Msg = { ok: boolean; message: string } | null;
const str = (f: FormData, k: string, max = 2000) => String(f.get(k) ?? '').trim().slice(0, max);
const isEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export async function subscribe(_: Msg, f: FormData): Promise<Msg> {
  const email = str(f, 'email', 200).toLowerCase();
  if (!isEmail(email)) return { ok: false, message: 'Adresse e-mail invalide.' };
  await db.subscriber.upsert({ where: { email }, update: {}, create: { email } });
  return { ok: true, message: 'Merci ! Vous êtes inscrit(e) à notre newsletter.' };
}

export async function sendContact(_: Msg, f: FormData): Promise<Msg> {
  const email = str(f, 'email', 200);
  const body = str(f, 'body', 5000);
  if (!isEmail(email)) return { ok: false, message: 'Merci d’indiquer une adresse e-mail valide.' };
  if (body.length < 3) return { ok: false, message: 'Votre message est vide.' };
  if (str(f, 'website')) return { ok: true, message: 'Merci, votre message a bien été envoyé.' }; // pot de miel anti-spam
  await db.message.create({ data: { name: str(f, 'name', 200), email, phone: str(f, 'phone', 50), subject: str(f, 'subject', 200), body } });
  return { ok: true, message: 'Merci de nous avoir contactés. Nous vous répondrons dans les plus brefs délais.' };
}

/** Récapitulatif officiel du panier (prix base de données + code promo). */
export async function quoteCart(lines: CartLine[], promo?: string) {
  return priceCart(lines, promo);
}

export type OrderState = { error?: string; fields?: Record<string, string> } | null;

export async function placeOrder(_: OrderState, f: FormData): Promise<OrderState> {
  let lines: CartLine[] = [];
  try { lines = JSON.parse(String(f.get('cart') || '[]')); } catch { /* panier invalide */ }
  const fields = Object.fromEntries(['email', 'phone', 'firstName', 'lastName', 'address', 'city', 'zip', 'note', 'giftMessage', 'promo'].map((k) => [k, str(f, k, k === 'note' || k === 'giftMessage' ? 1000 : 200)]));
  if (!lines.length) return { error: 'Votre panier est vide.', fields };
  if (!isEmail(fields.email)) return { error: 'Adresse e-mail invalide.', fields };
  if (fields.phone.replace(/\D/g, '').length < 8) return { error: 'Numéro de téléphone invalide.', fields };
  if (!fields.firstName || !fields.lastName || !fields.address || !fields.city) return { error: 'Merci de compléter votre adresse de livraison.', fields };

  const s = await getSettings();
  const cart = await priceCart(lines, fields.promo);
  const bad = cart.lines.find((l) => !l.ok);
  if (bad) return { error: `${bad.title} : ${bad.error}`, fields };
  if (fields.promo && cart.promoError) return { error: cart.promoError, fields };

  const logged = await getCustomer();
  let number = 0;

  await db.$transaction(async (tx) => {
    const customer = logged
      ? await tx.customer.update({ where: { id: logged.id }, data: { phone: fields.phone, address: fields.address, city: fields.city, zip: fields.zip } })
      : await tx.customer.upsert({
          where: { email: fields.email.toLowerCase() },
          update: { phone: fields.phone, address: fields.address, city: fields.city, zip: fields.zip, firstName: fields.firstName, lastName: fields.lastName },
          create: { email: fields.email.toLowerCase(), phone: fields.phone, firstName: fields.firstName, lastName: fields.lastName, address: fields.address, city: fields.city, zip: fields.zip, country: s.shop.country },
        });
    const last = await tx.order.findFirst({ orderBy: { number: 'desc' }, select: { number: true } });
    number = Math.max(s.shop.orderStartNumber, (last?.number || 0) + 1);

    await tx.order.create({
      data: {
        number,
        customerId: customer.id,
        email: fields.email.toLowerCase(),
        phone: fields.phone,
        firstName: fields.firstName,
        lastName: fields.lastName,
        address: fields.address,
        city: fields.city,
        zip: fields.zip,
        country: s.shop.country,
        note: fields.note,
        giftMessage: fields.giftMessage,
        subtotal: cart.subtotal,
        discount: cart.discount,
        shipping: cart.shipping,
        total: cart.total,
        promoCode: cart.promo?.code || '',
        items: {
          create: cart.lines.map((l) => ({
            productId: l.productId || null,
            variantId: l.variantId || null,
            title: l.title,
            variantTitle: l.bundle ? `Coffret ${l.bundle.format}` : l.variantTitle,
            image: l.image,
            price: l.price,
            quantity: l.qty,
            meta: l.bundle ? JSON.stringify(l.bundle) : '',
          })),
        },
      },
    });

    // décrément du stock
    for (const l of cart.lines) {
      const items = l.bundle ? l.bundle.items.map((i) => ({ id: i.variantId, q: i.qty * l.qty })) : [{ id: l.variantId, q: l.qty }];
      for (const it of items) {
        await tx.variant.updateMany({ where: { id: it.id, trackStock: true }, data: { stock: { decrement: it.q } } });
      }
    }
    if (cart.promo) await tx.promoCode.update({ where: { code: cart.promo.code }, data: { usedCount: { increment: 1 } } });
  });

  revalidatePath('/', 'layout'); // stock à jour sur la boutique
  redirect(`/checkout/merci/${number}?e=${encodeURIComponent(fields.email.toLowerCase())}`);
}

export async function submitReview(_: Msg, f: FormData): Promise<Msg> {
  const productId = Number(f.get('productId'));
  const rating = Math.min(5, Math.max(1, Number(f.get('rating')) || 5));
  const name = str(f, 'name', 80);
  const comment = str(f, 'comment', 2000);
  if (!productId || !name || comment.length < 3) return { ok: false, message: 'Merci de compléter votre nom et votre avis.' };
  const c = await getCustomer();
  await db.review.create({ data: { productId, rating, name, comment, customerId: c?.id } });
  return { ok: true, message: 'Merci ! Votre avis sera publié après validation.' };
}

// ---------------- comptes clients ----------------
export async function customerLogin(_: Msg, f: FormData): Promise<Msg> {
  const email = str(f, 'email', 200).toLowerCase();
  const c = await db.customer.findUnique({ where: { email } });
  if (!c?.passwordHash || !(await bcrypt.compare(str(f, 'password', 200), c.passwordHash))) {
    return { ok: false, message: 'E-mail ou mot de passe incorrect.' };
  }
  await setSession('customer', c.id);
  redirect('/account');
}

export async function customerRegister(_: Msg, f: FormData): Promise<Msg> {
  const email = str(f, 'email', 200).toLowerCase();
  const password = str(f, 'password', 200);
  if (!isEmail(email)) return { ok: false, message: 'Adresse e-mail invalide.' };
  if (password.length < 6) return { ok: false, message: 'Le mot de passe doit contenir au moins 6 caractères.' };
  const existing = await db.customer.findUnique({ where: { email } });
  if (existing?.passwordHash) return { ok: false, message: 'Un compte existe déjà avec cet e-mail.' };
  const data = { firstName: str(f, 'firstName', 100), lastName: str(f, 'lastName', 100), passwordHash: await bcrypt.hash(password, 10), acceptsMarketing: f.get('marketing') === 'on' };
  const c = existing ? await db.customer.update({ where: { email }, data }) : await db.customer.create({ data: { email, ...data } });
  if (data.acceptsMarketing) await db.subscriber.upsert({ where: { email }, update: {}, create: { email } });
  await setSession('customer', c.id);
  redirect('/account');
}

export async function customerLogout() {
  await clearSession('customer');
  redirect('/account');
}

export async function updateProfile(_: Msg, f: FormData): Promise<Msg> {
  const c = await getCustomer();
  if (!c) return { ok: false, message: 'Session expirée.' };
  await db.customer.update({
    where: { id: c.id },
    data: { firstName: str(f, 'firstName', 100), lastName: str(f, 'lastName', 100), phone: str(f, 'phone', 50), address: str(f, 'address', 300), city: str(f, 'city', 100), zip: str(f, 'zip', 20) },
  });
  return { ok: true, message: 'Vos informations ont été enregistrées.' };
}
