import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import { asLocale } from '@/lib/i18n';
import HomeSections from '@/components/shop/Sections';

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = asLocale((await params).lang);
  const [s, sections] = await Promise.all([
    getSettings(lang),
    db.homeSection.findMany({ where: { isEnabled: true }, orderBy: { position: 'asc' } }),
  ]);
  return <HomeSections sections={sections} fmt={s.shop} lang={lang} />;
}
