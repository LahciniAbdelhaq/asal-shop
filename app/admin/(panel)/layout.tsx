import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import Shell from '@/components/admin/Shell';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const [s, unread, pending, reviews] = await Promise.all([
    getSettings(),
    db.message.count({ where: { isRead: false, archived: false } }),
    db.order.count({ where: { status: 'pending' } }),
    db.review.count({ where: { approved: false } }),
  ]);
  return (
    <Shell brand={{ name: s.brand.name, logo: s.brand.logo }} admin={{ name: admin.name, email: admin.email }} badges={{ messages: unread, orders: pending, reviews }}>
      {children}
    </Shell>
  );
}
