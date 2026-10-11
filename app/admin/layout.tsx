import type { Metadata } from 'next';
import './admin.css';
import NavProgress from '@/components/NavProgress';

export const metadata: Metadata = {
  title: { default: 'Back-office', template: '%s · Back-office ASAL' },
  robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <NavProgress />
        {children}
      </body>
    </html>
  );
}
