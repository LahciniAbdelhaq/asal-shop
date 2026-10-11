import type { Metadata } from 'next';
import CartPageClient from './CartPageClient';

export const metadata: Metadata = { title: 'Panier' };

export default function CartPage() {
  return <CartPageClient />;
}
