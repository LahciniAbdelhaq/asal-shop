// Langues de la boutique : français (par défaut, sans préfixe d'URL), anglais (/en/…), arabe (/ar/…, de droite à gauche).
// Fonctions pures : utilisables côté serveur, navigateur et middleware.

export const LOCALES = ['fr', 'en', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'fr';
export const TRANSLATED: Locale[] = ['en', 'ar']; // langues traduites depuis le français

export const LOCALE_NAMES: Record<Locale, string> = { fr: 'Français', en: 'English', ar: 'العربية' };
export const LOCALE_SHORT: Record<Locale, string> = { fr: 'FR', en: 'EN', ar: 'ع' };
export const INTL_LOCALE: Record<Locale, string> = { fr: 'fr-FR', en: 'en-GB', ar: 'ar-MA' };
export const LANG_COOKIE = 'lang';

export const isLocale = (x: unknown): x is Locale => typeof x === 'string' && (LOCALES as readonly string[]).includes(x);
export const asLocale = (x: unknown): Locale => (isLocale(x) ? x : DEFAULT_LOCALE);
export const dirOf = (l: Locale) => (l === 'ar' ? 'rtl' : 'ltr');

// chemins jamais préfixés (fichiers, API, back-office)
const RAW = /^\/(api|admin|media|uploads|brand|fonts|_next)(\/|$)/;

/** Retire le préfixe de langue d'un chemin : « /en/products/x » → { lang: 'en', path: '/products/x' }. */
export function stripLocale(path: string): { lang: Locale; path: string } {
  const m = path.match(/^\/(fr|en|ar)(?=\/|$|\?|#)/);
  if (!m) return { lang: DEFAULT_LOCALE, path: path || '/' };
  return { lang: m[1] as Locale, path: path.slice(m[0].length) || '/' };
}

/** Ajoute le préfixe de langue à un lien interne (« /products/x » → « /en/products/x »). */
export function localePath(lang: Locale, href: string): string {
  if (!href || !href.startsWith('/') || href.startsWith('//') || RAW.test(href)) return href;
  const { path } = stripLocale(href);
  if (lang === DEFAULT_LOCALE) return path;
  return `/${lang}${path === '/' ? '' : path.startsWith('/?') ? path.slice(1) : path}`;
}

/** Remplace {variables} dans un texte. */
export function fill(s: string, vars?: Record<string, string | number>) {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

/* ------------------------------------------------------------------ contenus traduits
 * Chaque enregistrement traduisible (produit, catégorie, page, article, section, réglage)
 * garde le français dans ses champs habituels et les traductions dans un JSON :
 *   { "en": { "title": "…" }, "ar": { "title": "…" } }
 * Seuls les textes différents du français sont stockés : un texte non traduit suit le français.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
export type I18nMap = Partial<Record<Locale, Record<string, any>>>;

export function parseI18n(raw: string | null | undefined): I18nMap {
  if (!raw) return {};
  try {
    const v = JSON.parse(raw);
    return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  } catch {
    return {};
  }
}

/** Applique une traduction sur un objet : seuls les textes (chaînes non vides) sont remplacés, la structure reste celle du français. */
export function applyText<T>(base: T, over: unknown): T {
  if (over === undefined || over === null) return base;
  if (typeof base === 'string') return (typeof over === 'string' && over.trim() !== '' ? over : base) as T;
  if (Array.isArray(base)) {
    if (!Array.isArray(over)) return base;
    return base.map((b, i) => applyText(b, over[i])) as T;
  }
  if (base && typeof base === 'object') {
    if (typeof over !== 'object' || Array.isArray(over)) return base;
    const out: Record<string, any> = { ...(base as any) };
    for (const k of Object.keys(out)) if (k in (over as any)) out[k] = applyText(out[k], (over as any)[k]);
    return out as T;
  }
  return base;
}

/** Inverse d'applyText : ne garde que les textes qui diffèrent du français (undefined si rien à garder). */
export function diffText(base: unknown, val: unknown): any {
  if (typeof base === 'string') return typeof val === 'string' && val.trim() !== '' && val !== base ? val : undefined;
  if (Array.isArray(base)) {
    if (!Array.isArray(val)) return undefined;
    const out = base.map((b, i) => diffText(b, val[i]));
    return out.some((x) => x !== undefined) ? out.map((x) => (x === undefined ? null : x)) : undefined;
  }
  if (base && typeof base === 'object') {
    if (!val || typeof val !== 'object') return undefined;
    const out: Record<string, any> = {};
    for (const k of Object.keys(base)) {
      const d = diffText((base as any)[k], (val as any)[k]);
      if (d !== undefined) out[k] = d;
    }
    return Object.keys(out).length ? out : undefined;
  }
  return undefined;
}

/** Version traduite d'un enregistrement (champ JSON `i18n`). */
export function localize<T extends { i18n?: string | null }>(rec: T, lang: Locale): T {
  if (lang === DEFAULT_LOCALE || !rec.i18n) return rec;
  const over = parseI18n(rec.i18n)[lang];
  if (!over) return rec;
  const out: Record<string, any> = { ...rec };
  for (const [k, v] of Object.entries(over)) {
    if (typeof out[k] === 'string' && typeof v === 'string' && v.trim() !== '') out[k] = v;
  }
  return out as T;
}
