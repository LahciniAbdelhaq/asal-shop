// Les pages légales (/policies/...) sont des pages CMS comme les autres.
import { db } from '@/lib/db';

export { default, generateMetadata } from '../../pages/[slug]/page';

export async function generateStaticParams() {
  return (await db.page.findMany({ where: { isPublished: true, template: 'policy' }, select: { slug: true } })).map((p) => ({ slug: p.slug }));
}
