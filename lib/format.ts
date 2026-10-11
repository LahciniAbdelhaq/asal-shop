export type MoneyFormat = { currency: string; currencyPosition: 'after' | 'before' };

export function money(amount: number, f: MoneyFormat = { currency: 'MAD', currencyPosition: 'after' }) {
  const n = Math.round(amount * 100) / 100;
  const s = Number.isInteger(n)
    ? n.toLocaleString('fr-FR').replace(/ | /g, ' ')
    : n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/ | /g, ' ');
  return f.currencyPosition === 'before' ? `${f.currency} ${s}` : `${s} ${f.currency}`;
}

export function slugify(s: string) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function frDate(d: Date | string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }) {
  return new Date(d).toLocaleDateString('fr-FR', opts);
}

export function frDateTime(d: Date | string) {
  return new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
