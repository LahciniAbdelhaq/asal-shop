// Valeurs par défaut de tous les réglages éditables dans le back-office.
// Ce qui est enregistré en base (table Setting) est fusionné par-dessus.

export type MenuItem = { label: string; href: string; children?: MenuItem[] };

export const DEFAULT_SETTINGS = {
  brand: {
    name: 'ASAL',
    tagline: "L'or naturel du Maroc",
    logo: '/media/8a0f20c6_logo_asal_maroc.png',
    logoWidth: 54,
    logoWidthMobile: 42,
    favicon: '/media/8a0f20c6_logo_asal_maroc.png',
    footerLogoText: 'Asal',
    footerBlurb: 'Des miels rares du Maroc, sélectionnés à la source et livrés avec soin partout au Maroc.',
    copyright: '© 2026 ASAL Maroc',
  },
  // Système de couleurs : chaque clé devient une variable CSS --c-<clé>
  colors: {
    bg: '#FBF7EF', // fond général
    cream: '#FAF6EE', // fond des sections crème
    surface: '#FFFFFF', // cartes
    ink: '#2B2118', // titres
    text: '#5C5245', // texte courant
    foreground: '#1A1207', // texte de base / header
    muted: '#8A7C66', // texte secondaire
    primary: '#C8861A', // ambre (boutons, prix)
    primaryHover: '#A96F14',
    primaryLight: '#E9B44C',
    olive: '#6B7F4E', // sous-titres
    dark: '#1E1A16', // bandes sombres, footer
    darkAlt: '#2B2118', // cartes sombres
    border: '#EFE6D4',
    announceBg: '#1A1207',
    announceText: '#F3EAD8',
    announceAccent: '#C89B2A',
    inputText: '#C89B2A',
    inputBorder: '#E8DCC3',
  },
  fonts: {
    body: 'Inter',
    heading: 'Inter',
    serif: 'Georgia',
    baseSize: 14,
    headingWeight: 700,
  },
  announcement: {
    enabled: true,
    items: ['Livraison gratuite à partir de <strong>300 DH</strong>'],
    repeat: 6,
    speed: 22,
  },
  menus: {
    header: [] as MenuItem[],
    footer1Title: 'La marque',
    footer1: [] as MenuItem[],
    footer2Title: 'Informations',
    footer2: [] as MenuItem[],
    legal: [] as MenuItem[],
  },
  social: {
    title: 'Suivez-nous',
    instagram: 'https://www.instagram.com/abeille__bio/',
    facebook: '',
    tiktok: '',
    whatsapp: '',
  },
  newsletter: {
    enabled: true,
    title: 'Restez informé',
    text: 'Recevez nos offres exclusives et soyez les premiers informés de nos nouveautés.',
    placeholder: 'Adresse e-mail',
  },
  shop: {
    currency: 'MAD',
    currencyPosition: 'after' as 'after' | 'before',
    country: 'Maroc',
    freeShippingThreshold: 300,
    shippingFee: 30,
    codEnabled: true,
    codTitle: 'Paiement à la livraison',
    codText: 'Payez en espèces à la réception de votre commande.',
    contactEmail: 'contact@asalmaroc.com',
    phone: '',
    whatsapp: '',
    address: 'Marrakech, Maroc',
    orderStartNumber: 1001,
    lowStockThreshold: 5,
    cities: 'Casablanca, Rabat, Marrakech, Fès, Tanger, Agadir, Meknès, Oujda, Kénitra, Tétouan, El Jadida, Safi, Mohammedia, Béni Mellal, Nador, Autre',
  },
  product: {
    trustItems: [
      { icon: 'drop', label: '100 % naturel, brut et pur' },
      { icon: 'flask', label: 'Analysé en laboratoire' },
      { icon: 'box', label: 'Expédition soignée sous 48 h' },
      { icon: 'lock', label: 'Paiement 100 % sécurisé' },
    ],
    reviewsEnabled: true,
    reviewsEyebrow: 'Votre avis compte',
    reviewsTitle: 'Avis clients',
    relatedTitle: 'Vous aimerez aussi',
    addToCartLabel: 'Ajouter au panier',
    soldOutLabel: 'Épuisé',
  },
  composer: {
    eyebrow: 'Sur mesure',
    title: 'Composez votre coffret',
    text: 'Choisissez votre format, le nombre de pots, puis vos miels préférés.',
    formats: ['250 g', '500 g'],
    sizes: [3, 4, 6],
    productType: 'Miel',
    boxPrice: 0,
    ctaLabel: 'Ajouter mon coffret au panier',
  },
  seo: {
    title: "ASAL — Miels d'exception du Maroc",
    description: "Miels rares et 100 % naturels du Maroc : Thym, Daghmous, Jujubier (Sidr), Euphorbe… Coffrets cadeaux et livraison partout au Maroc.",
  },
};

export type Settings = typeof DEFAULT_SETTINGS;
export type SettingKey = keyof Settings;

export const FONT_CHOICES = [
  'Inter', 'Georgia', 'Playfair Display', 'Cormorant Garamond', 'Lora', 'Poppins', 'Montserrat',
  'DM Sans', 'Manrope', 'Outfit', 'Libre Baskerville', 'EB Garamond', 'Cairo', 'Tajawal', 'Arial',
];
// polices fournies localement ou système (pas de Google Fonts à charger)
export const LOCAL_FONTS = ['Inter', 'Georgia', 'Arial'];

export const COLOR_LABELS: Record<keyof Settings['colors'], string> = {
  bg: 'Fond du site',
  cream: 'Fond des sections crème',
  surface: 'Fond des cartes',
  ink: 'Titres',
  text: 'Texte courant',
  foreground: 'Texte de base / menu',
  muted: 'Texte secondaire',
  primary: 'Couleur principale (boutons, prix)',
  primaryHover: 'Couleur principale — survol',
  primaryLight: 'Couleur principale claire',
  olive: 'Sous-titres (olive)',
  dark: 'Fond sombre (bandeaux, footer)',
  darkAlt: 'Fond sombre secondaire',
  border: 'Bordures',
  announceBg: 'Barre d’annonce — fond',
  announceText: 'Barre d’annonce — texte',
  announceAccent: 'Barre d’annonce — accent',
  inputText: 'Champs — texte',
  inputBorder: 'Champs — bordure',
};

export const ORDER_STATUSES: Record<string, { label: string; color: string }> = {
  pending: { label: 'En attente', color: '#B7791F' },
  confirmed: { label: 'Confirmée', color: '#2B6CB0' },
  shipped: { label: 'Expédiée', color: '#6B46C1' },
  delivered: { label: 'Livrée', color: '#2F855A' },
  cancelled: { label: 'Annulée', color: '#C53030' },
};

export const PAYMENT_STATUSES: Record<string, string> = {
  unpaid: 'Non payée',
  paid: 'Payée',
  refunded: 'Remboursée',
};

export const PAGE_TEMPLATES: Record<string, string> = {
  default: 'Page de contenu',
  contact: 'Contact (formulaire)',
  faq: 'FAQ (questions/réponses)',
  composer: 'Compositeur de coffret',
  policy: 'Page légale',
};
