import { Fragment } from 'react';

/** Insère des éléments React dans un texte traduit : rich('Plus que {amount}…', { amount: <strong>30 MAD</strong> }). */
export function rich(s: string, nodes: Record<string, React.ReactNode>): React.ReactNode {
  const parts = s.split(/(\{\w+\})/g);
  return parts.map((p, i) => {
    const m = p.match(/^\{(\w+)\}$/);
    return <Fragment key={i}>{m && m[1] in nodes ? nodes[m[1]] : p}</Fragment>;
  });
}
