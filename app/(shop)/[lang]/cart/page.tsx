import type { Metadata } from 'next';
import { asLocale } from '@/lib/i18n';
import { getT } from '@/lib/settings';
import CartPageClient from './CartPageClient';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  return { title: (await getT(asLocale((await params).lang)))('cart') };
}

export default function CartPage() {
  return <CartPageClient />;
}
