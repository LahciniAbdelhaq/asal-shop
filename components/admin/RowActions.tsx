import Link from 'next/link';
import Icon from '@/components/Icon';
import { ConfirmButton } from './ui';

/** Boutons de gestion d'une ligne de tableau : Détails · Modifier · Supprimer. */
export default function RowActions({ id, view, viewExternal = false, edit, remove, confirm }: {
  id: number;
  view?: string; // page de détails (ou page publique si viewExternal)
  viewExternal?: boolean;
  edit?: string;
  remove?: (f: FormData) => Promise<void>;
  confirm?: string;
}) {
  return (
    <div className="row-actions">
      {view && (viewExternal ? (
        <a className="btn btn-ghost btn-sm" href={view} target="_blank" rel="noreferrer" title="Voir sur la boutique"><Icon name="eye" /> Détails</a>
      ) : (
        <Link className="btn btn-ghost btn-sm" href={view} title="Détails"><Icon name="eye" /> Détails</Link>
      ))}
      {edit && <Link className="btn btn-secondary btn-sm" href={edit} title="Modifier"><Icon name="edit" /> Modifier</Link>}
      {remove && (
        <form action={remove}>
          <input type="hidden" name="id" value={id} />
          <ConfirmButton message={confirm || 'Supprimer définitivement cet élément ?'}><Icon name="trash" /> Supprimer</ConfirmButton>
        </form>
      )}
    </div>
  );
}
