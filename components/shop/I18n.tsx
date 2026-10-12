'use client';

import NextLink from 'next/link';
import { createContext, useContext, useMemo } from 'react';
import type { Dict, DictKey } from '@/lib/dict';
import { DEFAULT_LOCALE, fill, localePath, type Locale } from '@/lib/i18n';

type Ctx = { lang: Locale; dict: Dict };
const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ lang, dict, children }: Ctx & { children: React.ReactNode }) {
  const value = useMemo(() => ({ lang, dict }), [lang, dict]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** Langue courante, traduction des textes de l'interface et liens préfixés par la langue. */
export function useI18n() {
  const c = useContext(I18nContext);
  const lang = c?.lang || DEFAULT_LOCALE;
  return useMemo(
    () => ({
      lang,
      t: (k: DictKey, vars?: Record<string, string | number>) => fill(c?.dict[k] ?? k, vars),
      href: (h: string) => localePath(lang, h),
    }),
    [lang, c?.dict],
  );
}

/** <Link> de la boutique : ajoute automatiquement la langue aux liens internes. */
export default function Link({ href, ...props }: React.ComponentProps<typeof NextLink>) {
  const c = useContext(I18nContext);
  const lang = c?.lang || DEFAULT_LOCALE;
  return <NextLink href={typeof href === 'string' ? localePath(lang, href) : href} {...props} />;
}
