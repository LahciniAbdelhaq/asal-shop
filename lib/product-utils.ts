// Fonctions pures sur les produits (utilisables côté navigateur : aucun accès base de données).
import type { FullProduct } from './catalog';

export const inStock = (v: { stock: number; trackStock: boolean }) => !v.trackStock || v.stock > 0;

/** Libellé affiché d'une variante : traduction (`label`) sinon son titre. */
export const vLabel = (v: { title: string; label?: string }) => v.label || v.title;

/** Carte produit : variante affichée (ex. « 250 g ») sinon la moins chère disponible. */
export function cardInfo(p: FullProduct, preferVariant?: string) {
  const vs = p.variants;
  const pref = preferVariant ? vs.find((v) => v.title.toLowerCase() === preferVariant.toLowerCase()) : undefined;
  const avail = vs.filter(inStock);
  const v = pref || [...(avail.length ? avail : vs)].sort((a, b) => a.price - b.price)[0];
  return {
    variant: v,
    price: v?.price ?? 0,
    compareAt: v?.compareAtPrice ?? null,
    label: pref ? vLabel(pref) : p.subtitle,
    image: p.images[0]?.url || '',
    image2: p.images[1]?.url || '',
    soldOut: !vs.some(inStock),
  };
}
