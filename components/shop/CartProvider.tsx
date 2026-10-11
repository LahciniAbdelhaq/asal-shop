'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { CartLine } from '@/lib/cart-types';
import { money, type MoneyFormat } from '@/lib/format';

type Ctx = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  ready: boolean;
  add: (line: Omit<CartLine, 'key' | 'qty'> & { qty?: number }) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  fmt: (n: number) => string;
  shop: ShopInfo;
  toast: (msg: string) => void;
};

export type ShopInfo = MoneyFormat & { freeShippingThreshold: number; shippingFee: number };

const CartContext = createContext<Ctx | null>(null);
const KEY = 'asal_cart_v1';

const lineKey = (l: Omit<CartLine, 'key' | 'qty'>) =>
  l.bundle ? `b:${l.bundle.format}:${l.bundle.items.map((i) => `${i.variantId}x${i.qty}`).sort().join(',')}` : `v:${l.variantId}`;

export function CartProvider({ children, shop }: { children: React.ReactNode; shop: ShopInfo }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch { /* stockage indisponible */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch { /* ignore */ }
  }, [lines, ready]);

  const add: Ctx['add'] = useCallback((l) => {
    const key = lineKey(l);
    setLines((prev) => {
      const hit = prev.find((x) => x.key === key);
      if (hit) return prev.map((x) => (x.key === key ? { ...x, qty: x.qty + (l.qty || 1) } : x));
      return [...prev, { ...l, key, qty: l.qty || 1 }];
    });
    setDrawerOpen(true);
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setLines((prev) => (qty <= 0 ? prev.filter((x) => x.key !== key) : prev.map((x) => (x.key === key ? { ...x, qty } : x))));
  }, []);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2600);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      lines,
      ready,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: lines.reduce((n, l) => n + l.qty * l.price, 0),
      add,
      setQty,
      remove: (key) => setLines((prev) => prev.filter((x) => x.key !== key)),
      clear: () => setLines([]),
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      fmt: (n) => money(n, shop),
      shop,
      toast,
    }),
    [lines, ready, add, setQty, drawerOpen, shop, toast],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      {toastMsg && <div className="toast" role="status">{toastMsg}</div>}
    </CartContext.Provider>
  );
}

export function useCart() {
  const c = useContext(CartContext);
  if (!c) throw new Error('useCart doit être utilisé dans <CartProvider>');
  return c;
}
