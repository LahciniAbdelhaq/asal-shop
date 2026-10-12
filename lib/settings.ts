import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { db } from './db';
import { DEFAULT_SETTINGS, LOCAL_FONTS, type Settings, type SettingKey } from './defaults';
import { DICTS, type Dict, type DictKey } from './dict';
import { applyText, DEFAULT_LOCALE, fill, type Locale } from './i18n';

function merge<T>(base: T, over: unknown): T {
  if (over === null || over === undefined) return base;
  if (Array.isArray(base) || typeof base !== 'object' || base === null) return over as T;
  if (typeof over !== 'object' || Array.isArray(over)) return base;
  const out = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(over as Record<string, unknown>)) {
    out[k] = k in out ? merge(out[k], v) : v;
  }
  return out as T;
}

const loadRows = unstable_cache(() => db.setting.findMany(), ['settings'], { tags: ['shop'], revalidate: 300 });

const parse = (v: string | undefined) => {
  try { return v ? JSON.parse(v) : null; } catch { return null; }
};

// Clés réservées de la table Setting (hors réglages) :
//   « i18n.en », « i18n.ar » : traductions des réglages (textes seulement)
//   « strings »               : textes de l'interface modifiés depuis le back-office { en: { clé: texte } }
export const settingI18nKey = (lang: Locale) => `i18n.${lang}`;

/** Réglages de la boutique, avec les textes traduits dans la langue demandée. */
export const getSettings = cache(async (lang: Locale = DEFAULT_LOCALE): Promise<Settings> => {
  const rows = await loadRows();
  let s: Settings = structuredClone(DEFAULT_SETTINGS);
  for (const r of rows) {
    if (!(r.key in s)) continue;
    const v = parse(r.value);
    if (v === null) continue; // valeur corrompue : on garde le défaut
    const k = r.key as SettingKey;
    s = { ...s, [k]: merge(s[k], v) };
  }
  if (lang !== DEFAULT_LOCALE) {
    const over = parse(rows.find((r) => r.key === settingI18nKey(lang))?.value);
    if (over && typeof over === 'object') {
      for (const k of Object.keys(s) as SettingKey[]) if (k in over) s = { ...s, [k]: applyText(s[k], over[k]) };
    }
  }
  return s;
});

/** Traductions brutes des réglages pour une langue (back-office). */
export async function getSettingsOverrides(lang: Locale): Promise<Record<string, unknown>> {
  const rows = await loadRows();
  return parse(rows.find((r) => r.key === settingI18nKey(lang))?.value) || {};
}

/** Textes de l'interface modifiés dans le back-office, par langue. */
export async function getStringOverrides(): Promise<Partial<Record<Locale, Partial<Dict>>>> {
  const rows = await loadRows();
  return parse(rows.find((r) => r.key === 'strings')?.value) || {};
}

/** Dictionnaire de l'interface (textes du code + modifications du back-office). */
export const getDict = cache(async (lang: Locale): Promise<Dict> => {
  const over = (await getStringOverrides())[lang] || {};
  const d = { ...DICTS[lang] };
  for (const [k, v] of Object.entries(over)) if (typeof v === 'string' && v.trim() && k in d) d[k as DictKey] = v;
  return d;
});

export type T = (k: DictKey, vars?: Record<string, string | number>) => string;
export async function getT(lang: Locale): Promise<T> {
  const d = await getDict(lang);
  return (k, vars) => fill(d[k] ?? k, vars);
}

export async function saveSetting<K extends SettingKey>(key: K, value: Settings[K]) {
  await saveRaw(key, value);
}

export async function saveRaw(key: string, value: unknown) {
  const v = JSON.stringify(value);
  await db.setting.upsert({ where: { key }, update: { value: v }, create: { key, value: v } });
}

const kebab = (s: string) => s.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
const fontStack = (f: string, fallback: string) => (f.includes(' ') ? `'${f}'` : f) + ', ' + fallback;

/** Variables CSS du thème, injectées dans <head> : les couleurs et polices du back-office. */
export function themeCss(s: Settings, lang: Locale = DEFAULT_LOCALE) {
  const vars = Object.entries(s.colors).map(([k, v]) => `--c-${kebab(k)}:${v};`).join('');
  // version arabe : la police arabe d'abord (Inter et Georgia n'ont pas de caractères arabes)
  const ar = lang === 'ar' && s.fonts.arabic ? fontStack(s.fonts.arabic, '') : '';
  return `:root{${vars}--font-body:${ar}${fontStack(s.fonts.body, 'sans-serif')};--font-heading:${ar}${fontStack(
    s.fonts.heading,
    'sans-serif',
  )};--font-serif:${ar}${fontStack(s.fonts.serif, "'Times New Roman', serif")};--fs-base:${s.fonts.baseSize}px;--fw-heading:${s.fonts.headingWeight};--logo-w:${s.brand.logoWidth}px;--logo-w-m:${s.brand.logoWidthMobile}px;}`;
}

export function googleFontsUrl(s: Settings, lang: Locale = DEFAULT_LOCALE) {
  const arabic = lang === 'ar' && s.fonts.arabic && !LOCAL_FONTS.includes(s.fonts.arabic) ? s.fonts.arabic : '';
  const fams = [...new Set([s.fonts.body, s.fonts.heading, s.fonts.serif])].filter((f) => f && f !== arabic && !LOCAL_FONTS.includes(f));
  const parts = fams.map((f) => `family=${encodeURIComponent(f)}:ital,wght@0,400;0,500;0,600;0,700;1,400`);
  // les polices arabes n'ont pas d'italique : axe de graisse seul
  if (arabic) parts.push(`family=${encodeURIComponent(arabic)}:wght@400;500;600;700`);
  if (!parts.length) return null;
  return `https://fonts.googleapis.com/css2?${parts.join('&')}&display=swap`;
}
