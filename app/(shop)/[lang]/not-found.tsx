'use client';

import Link, { useI18n } from '@/components/shop/I18n';

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="empty-state" style={{ padding: '140px 16px' }}>
      <h1>{t('notFoundTitle')}</h1>
      <p>{t('notFoundText')}</p>
      <Link href="/collections/all" className="btn btn--dark">{t('continueShopping')}</Link>
    </div>
  );
}
