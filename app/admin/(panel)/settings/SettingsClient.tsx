'use client';

import SettingsCard from '@/components/admin/SettingsCard';
import type { Settings } from '@/lib/defaults';
import type { Locale } from '@/lib/i18n';

export default function SettingsClient({ tab, s, lang = 'fr' }: { tab: string; s: Settings; lang?: Locale }) {
  if (tab === 'product')
    return (
      <SettingsCard lang={lang} k="product" title="Fiche produit" initial={s.product} fields={[
        { key: 'addToCartLabel', label: 'Bouton « Ajouter au panier »', type: 'text' },
        { key: 'soldOutLabel', label: 'Libellé « Épuisé »', type: 'text' },
        { key: 'reviewsEnabled', label: 'Afficher la section des avis clients', type: 'boolean' },
        { key: 'reviewsEyebrow', label: 'Avis — sur-titre', type: 'text' },
        { key: 'reviewsTitle', label: 'Avis — titre', type: 'text' },
        { key: 'relatedTitle', label: 'Titre des produits similaires', type: 'text' },
        { key: 'trustItems', label: 'Bandeau de confiance', type: 'list', itemLabel: 'label', fields: [
          { key: 'icon', label: 'Icône', type: 'icon' },
          { key: 'label', label: 'Texte', type: 'text' },
        ] },
      ]} />
    );

  if (tab === 'composer')
    return (
      <SettingsCard lang={lang} k="composer" title="Compositeur de coffret" description="Page /pages/composez-votre-coffret : le client compose son coffret avec vos miels." initial={s.composer} fields={[
        { key: 'eyebrow', label: 'Sur-titre', type: 'text' },
        { key: 'title', label: 'Titre', type: 'text' },
        { key: 'text', label: 'Texte', type: 'textarea' },
        { key: 'productType', label: 'Type de produit proposé', type: 'text', help: 'Tous les produits actifs de ce type (fiche produit → Type) sont proposés.', noTr: true },
        { key: 'formats', label: 'Formats proposés (un par ligne)', type: 'strings', help: 'Doivent correspondre aux noms des variantes, ex. « 250 g », « 500 g ».', noTr: true },
        { key: 'sizes', label: 'Nombres de pots proposés (un par ligne)', type: 'strings', noTr: true },
        { key: 'boxPrice', label: 'Prix de l’écrin (ajouté au coffret, MAD)', type: 'number', min: 0 },
        { key: 'ctaLabel', label: 'Texte du bouton', type: 'text' },
      ]} />
    );

  if (tab === 'seo')
    return (
      <SettingsCard lang={lang} k="seo" title="Référencement" description="Titre et description par défaut (page d’accueil, partages)." initial={s.seo} fields={[
        { key: 'title', label: 'Titre du site', type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea' },
      ]} />
    );

  return (
    <SettingsCard lang={lang} k="shop" title="Boutique, livraison & paiement" initial={s.shop} fields={[
      { key: 'currency', label: 'Devise affichée', type: 'text' },
      { key: 'currencyPosition', label: 'Position de la devise', type: 'select', options: [{ value: 'after', label: 'Après le prix (99 MAD)' }, { value: 'before', label: 'Avant le prix (MAD 99)' }] },
      { key: 'country', label: 'Pays de livraison', type: 'text' },
      { key: 'freeShippingThreshold', label: 'Livraison gratuite à partir de (MAD)', type: 'number', min: 0, help: '0 = jamais gratuite.' },
      { key: 'shippingFee', label: 'Frais de livraison sous ce seuil (MAD)', type: 'number', min: 0 },
      { key: 'cities', label: 'Villes suggérées (séparées par des virgules)', type: 'textarea' },
      { key: 'codTitle', label: 'Paiement à la livraison — titre', type: 'text' },
      { key: 'codText', label: 'Paiement à la livraison — description', type: 'textarea' },
      { key: 'contactEmail', label: 'E-mail de contact', type: 'text', noTr: true },
      { key: 'phone', label: 'Téléphone', type: 'text', noTr: true },
      { key: 'whatsapp', label: 'WhatsApp', type: 'text', noTr: true },
      { key: 'address', label: 'Adresse', type: 'text' },
      { key: 'orderStartNumber', label: 'Premier numéro de commande', type: 'number', min: 1 },
      { key: 'lowStockThreshold', label: 'Alerte de stock faible à partir de', type: 'number', min: 0 },
    ]} />
  );
}
