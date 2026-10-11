import { ORDER_STATUSES, PAYMENT_STATUSES } from '@/lib/defaults';

const CLS: Record<string, string> = { pending: 'amber', confirmed: '', shipped: '', delivered: 'green', cancelled: 'red' };

export function StatusPill({ status }: { status: string }) {
  const s = ORDER_STATUSES[status];
  return (
    <span className={`pill ${CLS[status] ?? ''}`} style={CLS[status] === '' ? { background: `${s?.color}1A`, color: s?.color } : undefined}>
      {s?.label || status}
    </span>
  );
}

export function PaymentPill({ status }: { status: string }) {
  return <span className={`pill ${status === 'paid' ? 'green' : status === 'refunded' ? 'gray' : 'amber'}`}>{PAYMENT_STATUSES[status] || status}</span>;
}
