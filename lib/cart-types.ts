export type BundlePick = { variantId: number; title: string; qty: number };

export type CartLine = {
  key: string;
  variantId: number; // 0 pour un coffret composé
  productId: number;
  slug: string;
  title: string;
  variantTitle: string;
  image: string;
  price: number; // prix unitaire affiché (recalculé côté serveur au paiement)
  qty: number;
  bundle?: { format: string; items: BundlePick[] };
};

export type PricedCart = {
  lines: (CartLine & { ok: boolean; error?: string })[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  promo?: { code: string; label: string } | null;
  promoError?: string;
  freeShippingThreshold: number;
};
