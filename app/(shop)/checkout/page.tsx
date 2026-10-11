import type { Metadata } from 'next';
import { getCustomer } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import CheckoutClient from './CheckoutClient';

export const metadata: Metadata = { title: 'Commande' };

export default async function CheckoutPage() {
  const [s, c] = await Promise.all([getSettings(), getCustomer()]);
  return (
    <CheckoutClient
      customer={c ? { email: c.email, phone: c.phone, firstName: c.firstName, lastName: c.lastName, address: c.address, city: c.city, zip: c.zip } : null}
      cities={s.shop.cities.split(',').map((x) => x.trim()).filter(Boolean)}
      cod={{ title: s.shop.codTitle, text: s.shop.codText }}
    />
  );
}
