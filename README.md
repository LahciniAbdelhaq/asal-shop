# ASAL — boutique de miels du Maroc (Next.js)

Reconstruction complète d'asalmaroc.com en Next.js 15 : même design, mêmes images, tout en local
(plus aucune dépendance à Shopify) + back-office complet.

- **Boutique** : accueil par sections, collections (filtres, tri), fiches produit (variantes, stock, avis),
  compositeur de coffret, panier, commande avec paiement à la livraison et codes promo, compte client,
  blog, pages, contact, newsletter, recherche.
- **Back-office** (`/admin`) : tableau de bord et statistiques, commandes, clients, produits, catégories,
  codes promo, avis, messages et newsletter, page d'accueil (sections modifiables), pages, blog,
  apparence (logo, couleurs, polices, menus, barre d'annonce, pied de page), paramètres (livraison, paiement…).

## Déploiement sur Vercel (depuis GitHub)

1. Sur vercel.com : **Add New → Project → importer ce dépôt GitHub** (framework détecté : Next.js).
2. Onglet **Storage** du projet :
   - **Create → Neon (Postgres)** → relier au projet (remplit `DATABASE_URL` et `DATABASE_URL_UNPOOLED`) ;
   - **Create → Blob** → relier au projet (remplit `BLOB_READ_WRITE_TOKEN`).
3. **Settings → Environment Variables** : ajouter `AUTH_SECRET` (longue chaîne aléatoire).
4. **Deployments → Redeploy**. Le build crée les tables automatiquement (`vercel-build`).
5. Charger le catalogue une seule fois (depuis votre PC, avec les identifiants Neon dans `.env`) :
   ```bash
   npm install
   npm run db:seed          # catalogue, pages, blog, accueil, compte admin
   ```
6. Se connecter sur `https://<votre-projet>.vercel.app/admin` — `admin@asal.ma` / `admin123`
   puis **changer le mot de passe** (Paramètres → Administrateurs).

Chaque `git push` sur `main` redéploie le site.

## En local

```bash
cp .env.example .env     # renseigner une base PostgreSQL (ex. la même base Neon)
npm install
npm run db:push          # crée les tables
npm run db:seed          # ou : npm run db:seed:demo (avec clients/commandes de démonstration)
npm run dev              # http://localhost:3000  —  admin : /admin
```

`npm run db:seed` ne touche jamais une base qui contient déjà des produits (ajouter `--force` pour tout réinitialiser).
Sans `BLOB_READ_WRITE_TOKEN`, les fichiers envoyés depuis l'admin sont stockés dans `storage/uploads`.

## Réimporter depuis le site cloné

`node scripts/import-clone.mjs <dossier-du-clone>` régénère `prisma/seed-data.json` et `public/media/`.
