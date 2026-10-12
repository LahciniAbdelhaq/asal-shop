'use client';

import { useI18n } from '@/components/shop/I18n';

// Affiché instantanément pendant le chargement d'une page de la boutique.
export default function ShopLoading() {
  const { t } = useI18n();
  return (
    <div className="shop-loading" aria-busy="true" aria-label={t('loading')}>
      <div className="honey-loader">
        <span /><span /><span />
      </div>
      <p>{t('loading')}</p>
    </div>
  );
}
