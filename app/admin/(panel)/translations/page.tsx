import Link from 'next/link';
import { getSettings, getStringOverrides } from '@/lib/settings';
import { DICT_GROUPS, DICTS } from '@/lib/dict';
import { LOCALE_NAMES, LOCALES, asLocale } from '@/lib/i18n';
import SettingsCard from '@/components/admin/SettingsCard';
import StringsForm from './StringsForm';

export const metadata = { title: 'Traductions' };

export default async function TranslationsPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const lang = asLocale((await searchParams).lang || 'en');
  const [s, overrides] = await Promise.all([getSettings(), getStringOverrides()]);
  const current = { ...DICTS[lang], ...(overrides[lang] || {}) };

  return (
    <>
      <div className="page-title">
        <div>
          <h1>Traductions</h1>
          <p>La boutique existe en français (adresse d’origine), en anglais (/en) et en arabe (/ar, de droite à gauche).</p>
        </div>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)' }}>
        <div>
          <div className="card">
            <div className="card-head">
              <div>
                <h2>Textes de l’interface</h2>
                <div className="muted" style={{ fontSize: 12.5 }}>Boutons, libellés, messages… Le texte d’origine reste utilisé tant que vous ne le modifiez pas.</div>
              </div>
            </div>
            <div className="card-body">
              <div className="tabs" style={{ marginBottom: 14 }}>
                {LOCALES.map((l) => <Link key={l} href={`/admin/translations?lang=${l}`} className={l === lang ? 'on' : ''} lang={l}>{LOCALE_NAMES[l]}</Link>)}
              </div>
              <StringsForm key={lang} lang={lang} groups={DICT_GROUPS} fr={DICTS.fr} defaults={DICTS[lang]} initial={current} />
            </div>
          </div>
        </div>
        <div>
          <SettingsCard k="languages" title="Langues de la boutique" description="Langues proposées dans le sélecteur de l’en-tête (le français est toujours actif)." initial={s.languages} fields={[
            { key: 'en', label: 'English — /en', type: 'boolean' },
            { key: 'ar', label: 'العربية — /ar', type: 'boolean' },
          ]} />
          <div className="card card-pad">
            <h2 style={{ fontSize: 15, marginTop: 0 }}>Traduire les contenus</h2>
            <p className="muted" style={{ fontSize: 13 }}>Dans chaque formulaire, choisissez la langue en haut (Français / English / العربية) puis enregistrez la traduction :</p>
            <ul style={{ fontSize: 13.5, lineHeight: 1.9, paddingInlineStart: 18, margin: 0 }}>
              <li><Link href="/admin/products">Produits</Link> — titre, description, libellés des variantes</li>
              <li><Link href="/admin/categories">Catégories</Link></li>
              <li><Link href="/admin/home">Page d’accueil</Link> — chaque section</li>
              <li><Link href="/admin/pages">Pages</Link> et <Link href="/admin/blog">Blog</Link></li>
              <li><Link href="/admin/appearance?tab=menus&lang=en">Menus</Link>, <Link href="/admin/appearance?tab=announcement&lang=en">barre d’annonce</Link>, <Link href="/admin/appearance?tab=footer&lang=en">pied de page</Link></li>
              <li><Link href="/admin/settings?tab=product&lang=en">Fiche produit</Link>, <Link href="/admin/settings?tab=shop&lang=en">livraison & paiement</Link>, <Link href="/admin/settings?tab=seo&lang=en">référencement</Link></li>
            </ul>
            <p className="muted" style={{ fontSize: 12.5, marginBottom: 0 }}>Police de la version arabe : <Link href="/admin/appearance?tab=fonts">Apparence → Typographie</Link>.</p>
          </div>
        </div>
      </div>
    </>
  );
}
