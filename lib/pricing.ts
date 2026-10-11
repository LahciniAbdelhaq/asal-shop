import 'server-only';
import { db } from './db';
import { getSettings } from './settings';
import type { CartLine, PricedCart } from './cart-types';

/** Recalcule le panier à partir de la base : prix, stock, code promo, livraison. */
export async function priceCart(lines: CartLine[], promoCode?: string): Promise<PricedCart> {
  const s = await getSettings();
  const ids = new Set<number>();
  for (const l of lines) {
    if (l.bundle) l.bundle.items.forEach((i) => ids.add(i.variantId));
    else ids.add(l.variantId);
  }
  const variants = await db.variant.findMany({ where: { id: { in: [...ids] } }, include: { product: { include: { images: true } } } });
  const byId = new Map(variants.map((v) => [v.id, v]));
  const need = new Map<number, number>(); // quantité totale demandée par variante (pour le stock)

  const priced: PricedCart['lines'] = lines
    .filter((l) => l.qty > 0)
    .map((l): PricedCart['lines'][number] => {
      if (l.bundle) {
        let unit = s.composer.boxPrice || 0;
        let error: string | undefined;
        for (const it of l.bundle.items) {
          const v = byId.get(it.variantId);
          if (!v || v.product.status !== 'active') { error = 'Un miel du coffret n’est plus disponible'; continue; }
          unit += v.price * it.qty;
          need.set(v.id, (need.get(v.id) || 0) + it.qty * l.qty);
        }
        return { ...l, price: unit, ok: !error, error };
      }
      const v = byId.get(l.variantId);
      if (!v || v.product.status !== 'active') return { ...l, ok: false, error: 'Produit indisponible' };
      need.set(v.id, (need.get(v.id) || 0) + l.qty);
      return {
        ...l,
        price: v.price,
        title: v.product.title,
        variantTitle: v.title === 'Défaut' ? '' : v.title,
        image: v.image || v.product.images.sort((a, b) => a.position - b.position)[0]?.url || l.image,
        ok: true,
      };
    });

  // contrôle du stock
  for (const [vid, qty] of need) {
    const v = byId.get(vid)!;
    if (v.trackStock && v.stock < qty) {
      for (const l of priced) {
        const uses = l.bundle ? l.bundle.items.some((i) => i.variantId === vid) : l.variantId === vid;
        if (uses) { l.ok = false; l.error = v.stock > 0 ? `Stock insuffisant (${v.stock} disponible${v.stock > 1 ? 's' : ''})` : 'Épuisé'; }
      }
    }
  }

  const subtotal = priced.filter((l) => l.ok).reduce((t, l) => t + l.price * l.qty, 0);
  let shipping = subtotal === 0 || subtotal >= s.shop.freeShippingThreshold ? 0 : s.shop.shippingFee;
  let discount = 0;
  let promo: PricedCart['promo'] = null;
  let promoError: string | undefined;

  if (promoCode?.trim()) {
    const code = promoCode.trim().toUpperCase();
    const p = await db.promoCode.findUnique({ where: { code } });
    const now = new Date();
    if (!p || !p.isActive) promoError = 'Code promo invalide';
    else if (p.startsAt && p.startsAt > now) promoError = 'Ce code n’est pas encore actif';
    else if (p.endsAt && p.endsAt < now) promoError = 'Ce code a expiré';
    else if (p.maxUses != null && p.usedCount >= p.maxUses) promoError = 'Ce code a atteint sa limite d’utilisation';
    else if (subtotal < p.minSubtotal) promoError = `Montant minimum : ${p.minSubtotal} ${s.shop.currency}`;
    else {
      if (p.type === 'percent') discount = Math.round(subtotal * Math.min(p.value, 100)) / 100;
      else if (p.type === 'fixed') discount = Math.min(p.value, subtotal);
      else if (p.type === 'free_shipping') shipping = 0;
      promo = {
        code: p.code,
        label: p.type === 'percent' ? `-${p.value} %` : p.type === 'fixed' ? `-${p.value} ${s.shop.currency}` : 'Livraison offerte',
      };
    }
  }

  return {
    lines: priced,
    subtotal,
    discount,
    shipping,
    total: Math.max(0, subtotal - discount + shipping),
    promo,
    promoError,
    freeShippingThreshold: s.shop.freeShippingThreshold,
  };
}
