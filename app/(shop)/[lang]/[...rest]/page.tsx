import { notFound } from 'next/navigation';

// Toute URL inconnue affiche la page 404 aux couleurs de la boutique.
export default function CatchAll() {
  notFound();
}
