'use client';

import { useActionState } from 'react';
import { deleteAdminUser, saveAdminUser } from '../../actions';
import { ConfirmButton, SaveBar } from '@/components/admin/ui';

type U = { id: number; email: string; name: string; role: string };

function UserForm({ u, canRole }: { u?: U; canRole: boolean }) {
  const [state, action] = useActionState(saveAdminUser, null);
  return (
    <form action={action}>
      {u && <input type="hidden" name="id" value={u.id} />}
      <div className="cols-2">
        <div className="field"><label>Nom</label><input name="name" defaultValue={u?.name} /></div>
        <div className="field"><label>E-mail</label><input name="email" type="email" defaultValue={u?.email} required /></div>
      </div>
      <div className="cols-2">
        <div className="field"><label>{u ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'}</label><input name="password" type="password" minLength={6} required={!u} autoComplete="new-password" /></div>
        {canRole && (
          <div className="field"><label>Rôle</label><select name="role" defaultValue={u?.role || 'editor'}><option value="admin">Administrateur (accès complet)</option><option value="editor">Éditeur</option></select></div>
        )}
      </div>
      <SaveBar state={state} label={u ? 'Mettre à jour' : 'Créer le compte'} />
    </form>
  );
}

export default function AdminUsers({ users, me }: { users: U[]; me: { id: number; role: string } }) {
  const isAdmin = me.role === 'admin';
  return (
    <div className="stack">
      {users.filter((u) => isAdmin || u.id === me.id).map((u) => (
        <div className="card" key={u.id}>
          <div className="card-head">
            <h2>{u.name} {u.id === me.id && <span className="pill plain amber">vous</span>} <span className="pill plain gray">{u.role === 'admin' ? 'Administrateur' : 'Éditeur'}</span></h2>
            {isAdmin && u.id !== me.id && (
              <form action={deleteAdminUser}><input type="hidden" name="id" value={u.id} /><ConfirmButton message={`Supprimer le compte ${u.email} ?`}>Supprimer</ConfirmButton></form>
            )}
          </div>
          <div className="card-body"><UserForm u={u} canRole={isAdmin && u.id !== me.id} /></div>
        </div>
      ))}
      {isAdmin && (
        <div className="card">
          <div className="card-head"><h2>Ajouter un administrateur</h2></div>
          <div className="card-body"><UserForm canRole /></div>
        </div>
      )}
    </div>
  );
}
