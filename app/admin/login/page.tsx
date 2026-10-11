import { redirect } from 'next/navigation';
import { getAdmin } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import LoginForm from './LoginForm';

export const metadata = { title: 'Connexion' };

export default async function LoginPage() {
  if (await getAdmin()) redirect('/admin');
  const s = await getSettings();
  return (
    <div className="login-page">
      <div className="card login-card">
        {s.brand.logo && <img className="logo" src={s.brand.logo} alt={s.brand.name} />}
        <h1>Back-office {s.brand.name}</h1>
        <p className="sub">Connectez-vous pour gérer votre boutique.</p>
        <LoginForm />
      </div>
    </div>
  );
}
