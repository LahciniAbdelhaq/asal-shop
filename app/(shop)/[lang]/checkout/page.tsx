import type { Metadata } from 'next';
import { getCustomer } from '@/lib/auth';
import { getSettings, getT } from '@/lib/settings';
import { asLocale } from '@/lib/i18n';
import CheckoutClient from './CheckoutClient';

type Params = Promise<{ lang: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  return { title: (await getT(asLocale((await params).lang)))('checkoutTitle') };
}

export default async function CheckoutPage({ params }: { params: Params }) {
  const lang = asLocale((await params).lang);
  const [s, c] = await Promise.all([getSettings(lang), getCustomer()]);
  return (
    <CheckoutClient
      customer={c ? { email: c.email, phone: c.phone, firstName: c.firstName, lastName: c.lastName, address: c.address, city: c.city, zip: c.zip } : null}
      cities={s.shop.cities.split(',').map((x) => x.trim()).filter(Boolean)}
      cod={{ title: s.shop.codTitle, text: s.shop.codText }}
    />
  );
}
