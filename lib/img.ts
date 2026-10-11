// Images responsives : chaque /media/nom.webp existe aussi en nom-480.webp et nom-960.webp
// (générés par scripts/optimize-images.mjs). Le navigateur choisit la plus petite suffisante.

const RESPONSIVE = /^\/media\/(.+)\.webp$/;

export function srcSet(url: string | undefined | null) {
  if (!url) return undefined;
  const m = url.match(RESPONSIVE);
  if (!m || /-(480|960)$/.test(m[1])) return undefined;
  return `/media/${m[1]}-480.webp 480w, /media/${m[1]}-960.webp 960w, ${url} 1600w`;
}

/** Plus petite variante (pour les fonds CSS et les miniatures). */
export function small(url: string | undefined | null, w: 480 | 960 = 480) {
  if (!url) return '';
  const m = url.match(RESPONSIVE);
  return m && !/-(480|960)$/.test(m[1]) ? `/media/${m[1]}-${w}.webp` : url;
}

/** Attributs prêts à étaler sur une balise <img>. */
export function imgProps(url: string | undefined | null, sizes: string, priority = false) {
  return {
    src: url || undefined,
    srcSet: srcSet(url),
    sizes: srcSet(url) ? sizes : undefined,
    loading: priority ? ('eager' as const) : ('lazy' as const),
    decoding: 'async' as const,
    ...(priority ? { fetchPriority: 'high' as const } : {}),
  };
}
