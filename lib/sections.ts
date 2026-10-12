// Schémas des sections de la page d'accueil.
// Un même schéma sert au rendu (components/shop/sections) et à l'éditeur du back-office.

// noTr : champ texte à ne pas traduire (valeur technique : URL, e-mail, nom de variante…)
export type Field = (
  | { key: string; label: string; type: 'text' | 'textarea' | 'html' | 'image' | 'video' | 'link' | 'icon' | 'product' | 'color'; help?: string }
  | { key: string; label: string; type: 'number'; min?: number; max?: number; help?: string }
  | { key: string; label: string; type: 'boolean'; help?: string }
  | { key: string; label: string; type: 'select'; options: { value: string; label: string }[]; help?: string }
  | { key: string; label: string; type: 'products'; help?: string }
  | { key: string; label: string; type: 'strings'; help?: string }
  | { key: string; label: string; type: 'list'; fields: Field[]; itemLabel?: string; help?: string }
) & { noTr?: boolean };

const TEXT_TYPES = ['text', 'textarea', 'html', 'strings'];

/** Champs à traduire d'un schéma : textes uniquement (les listes gardent leurs éléments, sans ajout ni suppression). */
export function trFields(fields: Field[]): Field[] {
  return fields.flatMap((f): Field[] => {
    if (f.noTr) return [];
    if (f.type === 'list') {
      const sub = trFields(f.fields);
      return sub.length ? [{ ...f, fields: sub }] : [];
    }
    return TEXT_TYPES.includes(f.type) ? [f] : [];
  });
}

export type SectionSchema = { label: string; description: string; fields: Field[]; defaults: Record<string, unknown> };

const ctaFields = (n: string, label: string): Field[] => [
  { key: `${n}Label`, label: `${label} — texte`, type: 'text' },
  { key: `${n}Link`, label: `${label} — lien`, type: 'link' },
];

export const SECTION_SCHEMAS: Record<string, SectionSchema> = {
  hero_video: {
    label: 'Bannière vidéo',
    description: 'Grande bannière avec vidéo (ou image) en fond, titre et boutons.',
    fields: [
      { key: 'video', label: 'Vidéo (mp4)', type: 'video', help: 'Laisser vide pour n’afficher que l’image.' },
      { key: 'poster', label: 'Image de fond / affiche', type: 'image' },
      { key: 'eyebrow', label: 'Sur-titre', type: 'text' },
      { key: 'heading', label: 'Titre (HTML autorisé : <br>, <em>)', type: 'text' },
      { key: 'text', label: 'Texte', type: 'textarea' },
      ...ctaFields('btn1', 'Bouton principal'),
      ...ctaFields('btn2', 'Bouton secondaire'),
      { key: 'mobileHeading', label: 'Mobile — titre', type: 'text' },
      { key: 'mobileText', label: 'Mobile — texte', type: 'textarea' },
      ...ctaFields('mobileBtn', 'Mobile — bouton'),
      { key: 'mobileLinkLabel', label: 'Mobile — lien secondaire', type: 'text' },
      { key: 'mobileLinkHref', label: 'Mobile — lien secondaire (URL)', type: 'link' },
    ],
    defaults: { eyebrow: 'Nouveau', heading: 'Votre titre', text: '', btn1Label: 'Découvrir', btn1Link: '/collections/all' },
  },
  reassurance: {
    label: 'Bandeau de réassurance',
    description: 'Arguments clés avec icônes (livraison, paiement…).',
    fields: [{ key: 'items', label: 'Arguments', type: 'list', itemLabel: 'title', fields: [
      { key: 'icon', label: 'Icône', type: 'icon' },
      { key: 'title', label: 'Titre', type: 'text' },
      { key: 'text', label: 'Texte', type: 'text' },
    ] }],
    defaults: { items: [{ icon: 'truck', title: 'Livraison gratuite', text: 'Dès 300 MAD' }] },
  },
  product_band: {
    label: 'Bandeau produits (fond sombre)',
    description: 'Sélection de produits mise en avant sur fond sombre — ex. « Les Pépites ».',
    fields: [
      { key: 'style', label: 'Style', type: 'select', options: [{ value: 'dark', label: 'Sombre' }, { value: 'light', label: 'Clair' }] },
      { key: 'eyebrow', label: 'Sur-titre', type: 'text' },
      { key: 'title', label: 'Titre', type: 'text' },
      { key: 'titleLink', label: 'Lien du titre', type: 'link' },
      { key: 'text', label: 'Texte', type: 'textarea' },
      { key: 'products', label: 'Produits', type: 'products' },
      { key: 'variant', label: 'Variante affichée (ex. « 250 g »)', type: 'text', help: 'Prix et libellé de cette variante sur les cartes.', noTr: true },
      { key: 'badge', label: 'Pastille sur les images', type: 'text' },
      { key: 'columns', label: 'Colonnes', type: 'number', min: 2, max: 5 },
    ],
    defaults: { style: 'dark', title: 'Sélection', products: [], columns: 3 },
  },
  product_row: {
    label: 'Rangée de produits',
    description: 'Titre à gauche, lien « Voir tout », cartes produits — ex. « Nos Miels ».',
    fields: [
      { key: 'title', label: 'Titre', type: 'text' },
      { key: 'titleLink', label: 'Lien du titre', type: 'link' },
      { key: 'text', label: 'Sous-titre', type: 'text' },
      { key: 'linkLabel', label: 'Lien — texte', type: 'text' },
      { key: 'link', label: 'Lien — URL', type: 'link' },
      { key: 'products', label: 'Produits', type: 'products' },
      { key: 'variant', label: 'Variante affichée (ex. « 250 g »)', type: 'text', noTr: true },
      { key: 'columns', label: 'Colonnes', type: 'number', min: 2, max: 5 },
    ],
    defaults: { title: 'Nos produits', products: [], columns: 4, linkLabel: 'Voir tout →', link: '/collections/all' },
  },
  needs: {
    label: 'Cartes catégories (photo)',
    description: 'Grandes cartes photo vers des catégories — ex. « Par besoin ».',
    fields: [
      { key: 'heading', label: 'Titre', type: 'text' },
      { key: 'text', label: 'Sous-titre', type: 'text' },
      { key: 'cards', label: 'Cartes', type: 'list', itemLabel: 'title', fields: [
        { key: 'image', label: 'Image', type: 'image' },
        { key: 'title', label: 'Titre', type: 'text' },
        { key: 'text', label: 'Texte', type: 'text' },
        { key: 'linkLabel', label: 'Lien — texte', type: 'text' },
        { key: 'link', label: 'Lien — URL', type: 'link' },
      ] },
    ],
    defaults: { heading: 'Par besoin', cards: [] },
  },
  gift_split: {
    label: 'Bloc texte + photo',
    description: 'Bloc en deux colonnes : texte sur fond sombre et grande photo — ex. « L’art d’offrir ».',
    fields: [
      { key: 'eyebrow', label: 'Sur-titre', type: 'text' },
      { key: 'heading', label: 'Titre (HTML : <br>, <em>)', type: 'text' },
      { key: 'text', label: 'Texte', type: 'textarea' },
      { key: 'pills', label: 'Pastilles', type: 'list', itemLabel: 'label', fields: [
        { key: 'icon', label: 'Icône', type: 'icon' },
        { key: 'label', label: 'Texte', type: 'text' },
      ] },
      { key: 'image', label: 'Photo', type: 'image' },
      { key: 'imageAlt', label: 'Texte alternatif', type: 'text' },
      { key: 'seal', label: 'Médaillon (HTML)', type: 'text' },
    ],
    defaults: { heading: 'Titre', pills: [] },
  },
  coffrets: {
    label: 'Coffrets (grandes cartes)',
    description: 'Deux grandes cartes produit avec liste d’avantages et bouton prix.',
    fields: [
      { key: 'eyebrow', label: 'Sur-titre', type: 'text' },
      { key: 'heading', label: 'Titre', type: 'text' },
      { key: 'text', label: 'Texte', type: 'textarea' },
      { key: 'cards', label: 'Cartes', type: 'list', itemLabel: 'title', fields: [
        { key: 'product', label: 'Produit lié', type: 'product' },
        { key: 'image', label: 'Image (sinon image du produit)', type: 'image' },
        { key: 'badge', label: 'Pastille', type: 'text' },
        { key: 'title', label: 'Titre', type: 'text' },
        { key: 'tagline', label: 'Accroche', type: 'text' },
        { key: 'features', label: 'Avantages (un par ligne)', type: 'strings' },
        { key: 'ctaLabel', label: 'Bouton', type: 'text' },
      ] },
    ],
    defaults: { heading: 'Coffrets', cards: [] },
  },
  blog_latest: {
    label: 'Derniers articles',
    description: 'Les derniers articles du blog.',
    fields: [
      { key: 'heading', label: 'Titre', type: 'text' },
      { key: 'text', label: 'Sous-titre', type: 'text' },
      { key: 'count', label: 'Nombre d’articles', type: 'number', min: 1, max: 9 },
    ],
    defaults: { heading: 'Le blog', count: 3 },
  },
  compose_cta: {
    label: 'Étapes + bouton',
    description: 'Étapes numérotées et appel à l’action — ex. « Composez votre coffret ».',
    fields: [
      { key: 'eyebrow', label: 'Sur-titre', type: 'text' },
      { key: 'heading', label: 'Titre', type: 'text' },
      { key: 'text', label: 'Texte', type: 'text' },
      { key: 'note', label: 'Note', type: 'text' },
      { key: 'steps', label: 'Étapes', type: 'list', itemLabel: 'title', fields: [
        { key: 'num', label: 'Numéro', type: 'text' },
        { key: 'title', label: 'Titre', type: 'text' },
        { key: 'text', label: 'Texte', type: 'text' },
      ] },
      { key: 'ctaLabel', label: 'Bouton — texte', type: 'text' },
      { key: 'ctaLink', label: 'Bouton — lien', type: 'link' },
    ],
    defaults: { heading: 'Comment ça marche', steps: [] },
  },
  story: {
    label: 'Image + texte',
    description: 'Photo à gauche, texte et lien à droite — ex. « Notre histoire ».',
    fields: [
      { key: 'image', label: 'Image', type: 'image' },
      { key: 'imageAlt', label: 'Texte alternatif', type: 'text' },
      { key: 'eyebrow', label: 'Sur-titre', type: 'text' },
      { key: 'heading', label: 'Titre', type: 'text' },
      { key: 'text', label: 'Texte', type: 'textarea' },
      { key: 'linkLabel', label: 'Lien — texte', type: 'text' },
      { key: 'link', label: 'Lien — URL', type: 'link' },
    ],
    defaults: { heading: 'Notre histoire' },
  },
  faq: {
    label: 'Questions fréquentes',
    description: 'Accordéon de questions + encart contact.',
    fields: [
      { key: 'heading', label: 'Titre', type: 'text' },
      { key: 'text', label: 'Sous-titre', type: 'text' },
      { key: 'items', label: 'Questions', type: 'list', itemLabel: 'q', fields: [
        { key: 'q', label: 'Question', type: 'text' },
        { key: 'a', label: 'Réponse', type: 'textarea' },
      ] },
      { key: 'cardTitle', label: 'Encart — titre', type: 'text' },
      { key: 'cardText', label: 'Encart — texte', type: 'textarea' },
      { key: 'cardBtnLabel', label: 'Encart — bouton', type: 'text' },
      { key: 'cardBtnLink', label: 'Encart — lien', type: 'link' },
    ],
    defaults: { heading: 'Questions fréquentes', items: [] },
  },
  rich_text: {
    label: 'Bloc libre (texte / HTML)',
    description: 'Contenu libre : texte mis en forme, images, HTML.',
    fields: [
      { key: 'html', label: 'Contenu', type: 'html' },
      { key: 'center', label: 'Centrer le texte', type: 'boolean' },
    ],
    defaults: { html: '<h2>Titre</h2><p>Votre texte…</p>', center: true },
  },
};
