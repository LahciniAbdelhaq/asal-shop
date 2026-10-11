import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import HomeSections from '@/components/shop/Sections';

export default async function HomePage() {
  const [s, sections] = await Promise.all([
    getSettings(),
    db.homeSection.findMany({ where: { isEnabled: true }, orderBy: { position: 'asc' } }),
  ]);
  return <HomeSections sections={sections} fmt={s.shop} />;
}
