'use client';

import Icon from '@/components/Icon';

export default function PrintButton() {
  return <button type="button" className="btn btn-secondary" onClick={() => window.print()}><Icon name="print" /> Imprimer</button>;
}
