import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="empty-state" style={{ padding: '140px 16px' }}>
      <h1>Page introuvable</h1>
      <p>Le lien est peut-être incorrect, ou la page a été supprimée.</p>
      <Link href="/collections/all" className="btn btn--dark">Continuer vos achats</Link>
    </div>
  );
}
