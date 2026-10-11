'use client';

import SettingsCard from '@/components/admin/SettingsCard';
import { ColorInput, type LinkOption } from '@/components/admin/ui';
import { COLOR_LABELS, DEFAULT_SETTINGS, FONT_CHOICES, type Settings } from '@/lib/defaults';
import type { Field } from '@/lib/sections';

/* eslint-disable @typescript-eslint/no-explicit-any */
const PRESETS: { name: string; colors: Partial<Settings['colors']> }[] = [
  { name: 'ASAL (origine)', colors: DEFAULT_SETTINGS.colors },
  { name: 'Olive & crème', colors: { primary: '#6B7F4E', primaryHover: '#566840', primaryLight: '#A9BC86', olive: '#8A6A2E', dark: '#1F2419', darkAlt: '#2C3324', announceBg: '#1F2419', announceAccent: '#C9D6A3' } },
  { name: 'Nuit dorée', colors: { primary: '#B8892D', primaryHover: '#94701F', primaryLight: '#E3C374', dark: '#0F1724', darkAlt: '#182235', announceBg: '#0F1724', ink: '#121A28', foreground: '#121A28' } },
  { name: 'Rose terre', colors: { primary: '#B5654A', primaryHover: '#964F38', primaryLight: '#E3A58F', dark: '#2A1A16', darkAlt: '#3A2620', announceBg: '#2A1A16', announceAccent: '#E3A58F' } },
];

const menuItem: Field[] = [
  { key: 'label', label: 'Libellé', type: 'text' },
  { key: 'href', label: 'Lien', type: 'link', help: '« # » pour un menu déroulant sans lien.' },
];
const menuFields: Field[] = [
  { key: 'header', label: 'Menu principal (en-tête)', type: 'list', itemLabel: 'label', fields: [...menuItem, { key: 'children', label: 'Sous-menu', type: 'list', itemLabel: 'label', fields: menuItem }] },
  { key: 'footer1Title', label: 'Pied de page — titre colonne 1', type: 'text' },
  { key: 'footer1', label: 'Pied de page — liens colonne 1', type: 'list', itemLabel: 'label', fields: menuItem },
  { key: 'footer2Title', label: 'Pied de page — titre colonne 2', type: 'text' },
  { key: 'footer2', label: 'Pied de page — liens colonne 2', type: 'list', itemLabel: 'label', fields: menuItem },
  { key: 'legal', label: 'Liens légaux (bas de page)', type: 'list', itemLabel: 'label', fields: menuItem },
];

function MiniPreview({ c, fonts }: { c: Record<string, string>; fonts?: Record<string, any> }) {
  return (
    <div className="preview-shop" style={{ background: c.bg, fontFamily: fonts?.body }}>
      <div style={{ background: c.announceBg, color: c.announceText, fontSize: 12, padding: '6px 12px', fontWeight: 700 }}>Livraison gratuite à partir de <span style={{ color: c.announceAccent }}>300 DH</span></div>
      <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ background: c.surface, border: `1px solid ${c.border}`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ height: 70, background: c.cream }} />
          <div style={{ padding: 10 }}>
            <div style={{ color: c.ink, fontWeight: 600, fontSize: 13 }}>Miel de Thym</div>
            <div style={{ color: c.muted, fontSize: 11 }}>250 g</div>
            <div style={{ color: c.primary, fontWeight: 700, fontSize: 13 }}>135 MAD</div>
          </div>
        </div>
        <div style={{ background: c.dark, borderRadius: 14, padding: 14, color: c.cream }}>
          <div style={{ color: c.primary, fontSize: 10, letterSpacing: '.2em', fontWeight: 800 }}>L’ART D’OFFRIR</div>
          <div style={{ fontFamily: fonts?.serif, fontSize: 18, margin: '6px 0' }}>Deux écrins. <em style={{ color: c.primary }}>Une attention.</em></div>
          <span style={{ display: 'inline-block', background: c.primary, color: '#fff', borderRadius: 99, padding: '6px 14px', fontSize: 12, fontWeight: 700 }}>Découvrir</span>
        </div>
      </div>
      <div style={{ padding: '0 16px 16px', color: c.text, fontSize: 12.5 }}>
        <strong style={{ color: c.ink, fontFamily: fonts?.heading }}>Questions fréquentes</strong> · <span style={{ color: c.olive }}>Sous-titre olive</span>
      </div>
    </div>
  );
}

export default function AppearanceClient({ tab, s, links }: { tab: string; s: Settings; links: LinkOption[] }) {
  if (tab === 'brand')
    return (
      <SettingsCard k="brand" title="Identité de la marque" initial={s.brand} links={links} fields={[
        { key: 'name', label: 'Nom de la boutique', type: 'text' },
        { key: 'tagline', label: 'Slogan', type: 'text' },
        { key: 'logo', label: 'Logo (en-tête)', type: 'image', help: 'PNG ou SVG à fond transparent recommandé.' },
        { key: 'logoWidth', label: 'Largeur du logo — ordinateur (px)', type: 'number', min: 20, max: 300 },
        { key: 'logoWidthMobile', label: 'Largeur du logo — mobile (px)', type: 'number', min: 20, max: 200 },
        { key: 'favicon', label: 'Icône d’onglet (favicon)', type: 'image' },
        { key: 'footerLogoText', label: 'Nom affiché dans le pied de page', type: 'text' },
        { key: 'footerBlurb', label: 'Texte de présentation (pied de page)', type: 'textarea' },
        { key: 'copyright', label: 'Mention copyright', type: 'text' },
      ]} />
    );

  if (tab === 'colors')
    return (
      <SettingsCard k="colors" title="Système de couleurs" description="Chaque couleur est une variable du thème, utilisée partout sur la boutique." initial={s.colors}
        render={(v, set) => (
          <div className="grid-2" style={{ gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,1fr)' }}>
            <div>
              <div className="field">
                <label>Palettes prêtes à l’emploi</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {PRESETS.map((p) => (
                    <button key={p.name} type="button" className="btn btn-secondary btn-sm" onClick={() => set({ ...DEFAULT_SETTINGS.colors, ...p.colors })}>
                      <span className="swatches">{['primary', 'dark', 'bg'].map((k) => <span key={k} style={{ background: (p.colors as any)[k] || (DEFAULT_SETTINGS.colors as any)[k], width: 14, height: 14 }} />)}</span>
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="cols-2" style={{ marginTop: 14 }}>
                {(Object.keys(COLOR_LABELS) as (keyof Settings['colors'])[]).map((k) => (
                  <div className="field" key={k} style={{ margin: 0 }}>
                    <label>{COLOR_LABELS[k]}</label>
                    <ColorInput value={v[k] || ''} onChange={(x) => set({ ...v, [k]: x })} />
                  </div>
                ))}
              </div>
            </div>
            <div><label className="lbl">Aperçu</label><div style={{ marginTop: 8, position: 'sticky', top: 80 }}><MiniPreview c={v} fonts={{ body: s.fonts.body, serif: s.fonts.serif, heading: s.fonts.heading }} /></div></div>
          </div>
        )}
      />
    );

  if (tab === 'fonts')
    return (
      <SettingsCard k="fonts" title="Typographie" description="Les polices autres qu’Inter, Georgia et Arial sont chargées depuis Google Fonts." initial={s.fonts}
        render={(v, set) => (
          <>
            <div className="cols-3">
              {([['body', 'Texte courant'], ['heading', 'Titres'], ['serif', 'Titres élégants (serif)']] as const).map(([k, l]) => (
                <div className="field" key={k} style={{ margin: 0 }}>
                  <label>{l}</label>
                  <select value={v[k]} onChange={(e) => set({ ...v, [k]: e.target.value })}>{FONT_CHOICES.map((f) => <option key={f} value={f}>{f}</option>)}</select>
                </div>
              ))}
            </div>
            <div className="cols-2">
              <div className="field"><label>Taille du texte de base (px)</label><input type="number" min={12} max={20} value={v.baseSize} onChange={(e) => set({ ...v, baseSize: Number(e.target.value) })} /></div>
              <div className="field"><label>Graisse des titres</label><select value={v.headingWeight} onChange={(e) => set({ ...v, headingWeight: Number(e.target.value) })}>{[400, 500, 600, 700].map((w) => <option key={w} value={w}>{w}</option>)}</select></div>
            </div>
          </>
        )}
      />
    );

  if (tab === 'announcement')
    return (
      <SettingsCard k="announcement" title="Barre d’annonce" description="Bandeau défilant tout en haut du site." initial={s.announcement} fields={[
        { key: 'enabled', label: 'Afficher la barre d’annonce', type: 'boolean' },
        { key: 'items', label: 'Messages (un par ligne, HTML autorisé : <strong>, <a href>)', type: 'strings' },
        { key: 'repeat', label: 'Répétitions dans le bandeau', type: 'number', min: 2, max: 12 },
        { key: 'speed', label: 'Durée d’un défilement (secondes)', type: 'number', min: 5, max: 120 },
      ]} />
    );

  if (tab === 'menus') return <SettingsCard k="menus" title="Menus" description="Menu de l’en-tête (avec sous-menus) et liens du pied de page." initial={s.menus} fields={menuFields} links={links} />;

  return (
    <div className="stack">
      <SettingsCard k="social" title="Réseaux sociaux" description="Laissez vide pour masquer une icône." initial={s.social} fields={[
        { key: 'title', label: 'Titre de la colonne', type: 'text' },
        { key: 'instagram', label: 'Instagram (URL)', type: 'text' },
        { key: 'facebook', label: 'Facebook (URL)', type: 'text' },
        { key: 'tiktok', label: 'TikTok (URL)', type: 'text' },
        { key: 'whatsapp', label: 'WhatsApp (numéro, ex. 212600000000)', type: 'text' },
      ]} />
      <SettingsCard k="newsletter" title="Bloc newsletter" initial={s.newsletter} fields={[
        { key: 'enabled', label: 'Afficher le bloc « Restez informé »', type: 'boolean' },
        { key: 'title', label: 'Titre', type: 'text' },
        { key: 'text', label: 'Texte', type: 'textarea' },
        { key: 'placeholder', label: 'Texte du champ', type: 'text' },
      ]} />
    </div>
  );
}
