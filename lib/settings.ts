import { cache } from 'react';
import { db } from './db';
import { DEFAULT_SETTINGS, LOCAL_FONTS, type Settings, type SettingKey } from './defaults';

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

export const getSettings = cache(async (): Promise<Settings> => {
  const rows = await db.setting.findMany();
  let s: Settings = structuredClone(DEFAULT_SETTINGS);
  for (const r of rows) {
    if (!(r.key in s)) continue;
    try {
      const k = r.key as SettingKey;
      s = { ...s, [k]: merge(s[k], JSON.parse(r.value)) };
    } catch { /* valeur corrompue : on garde le défaut */ }
  }
  return s;
});

export async function saveSetting<K extends SettingKey>(key: K, value: Settings[K]) {
  const v = JSON.stringify(value);
  await db.setting.upsert({ where: { key }, update: { value: v }, create: { key, value: v } });
}

const kebab = (s: string) => s.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
const fontStack = (f: string, fallback: string) => (f.includes(' ') ? `'${f}'` : f) + ', ' + fallback;

/** Variables CSS du thème, injectées dans <head> : les couleurs et polices du back-office. */
export function themeCss(s: Settings) {
  const vars = Object.entries(s.colors).map(([k, v]) => `--c-${kebab(k)}:${v};`).join('');
  return `:root{${vars}--font-body:${fontStack(s.fonts.body, 'sans-serif')};--font-heading:${fontStack(
    s.fonts.heading,
    'sans-serif',
  )};--font-serif:${fontStack(s.fonts.serif, "'Times New Roman', serif")};--fs-base:${s.fonts.baseSize}px;--fw-heading:${s.fonts.headingWeight};--logo-w:${s.brand.logoWidth}px;--logo-w-m:${s.brand.logoWidthMobile}px;}`;
}

export function googleFontsUrl(s: Settings) {
  const fams = [...new Set([s.fonts.body, s.fonts.heading, s.fonts.serif])].filter((f) => !LOCAL_FONTS.includes(f));
  if (!fams.length) return null;
  return `https://fonts.googleapis.com/css2?${fams
    .map((f) => `family=${encodeURIComponent(f)}:ital,wght@0,400;0,500;0,600;0,700;1,400`)
    .join('&')}&display=swap`;
}
