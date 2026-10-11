import 'server-only';
import { db } from './db';

/** Liens internes proposés dans les champs « lien » du back-office. */
export async function getLinkOptions() {
  const [cats, prods, pages, posts] = await Promise.all([
    db.category.findMany({ orderBy: { sortOrder: 'asc' }, select: { slug: true, title: true } }),
    db.product.findMany({ orderBy: { sortOrder: 'asc' }, select: { slug: true, title: true } }),
    db.page.findMany({ select: { slug: true, title: true, template: true } }),
    db.post.findMany({ select: { slug: true, title: true } }),
  ]);
  return [
    { href: '/', label: 'Accueil' },
    { href: '/collections/all', label: 'Tous les produits' },
    ...cats.map((c) => ({ href: `/collections/${c.slug}`, label: `Catégorie · ${c.title}` })),
    ...prods.map((p) => ({ href: `/products/${p.slug}`, label: `Produit · ${p.title}` })),
    ...pages.map((p) => ({ href: `/${p.template === 'policy' ? 'policies' : 'pages'}/${p.slug}`, label: `Page · ${p.title}` })),
    { href: '/blogs/le-miel-un-art-de-vivre', label: 'Blog' },
    ...posts.map((p) => ({ href: `/blogs/le-miel-un-art-de-vivre/${p.slug}`, label: `Article · ${p.title}` })),
    { href: '/account', label: 'Mon compte' },
    { href: '/cart', label: 'Panier' },
  ];
}

export async function getPickProducts() {
  const list = await db.product.findMany({ orderBy: { sortOrder: 'asc' }, select: { id: true, slug: true, title: true, images: { take: 1, orderBy: { position: 'asc' } } } });
  return list.map((p) => ({ id: p.id, slug: p.slug, title: p.title, image: p.images[0]?.url || '' }));
}
