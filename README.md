# La Voie Internationale

PWA hébergée sur **Cloudflare Workers** (Static Assets) avec une base **D1**.

**Contenu :** écran « Études et des formations bibliques », 4 provinces (sans noms de villes/régions), Section 1 et Section 2 par province, croyants, comité exécutif, ajouts d'enseignement, vidéos, médias, mode hors ligne (PWA) et icônes.

## Structure

```
public/        Fichiers statiques (HTML, CSS, JS, icônes, manifest, sw.js, _headers)
src/worker.js  Worker : routes /api/* uniquement
migrations/    Migrations D1 (ne jamais modifier une migration déjà appliquée)
wrangler.jsonc Configuration Cloudflare
```

## Démarrage

```bash
npm install
npm run db:migrate:local   # crée les tables en local
npm run dev                # http://localhost:8787
```

## Déploiement

```bash
npx wrangler login
npm run db:migrate:remote  # applique les migrations sur la base D1
npm run deploy
```

Le `database_id` de D1 est déjà dans `wrangler.jsonc`. S'il est refusé au déploiement, récupère le bon avec `npx wrangler d1 list`.

## Bonnes pratiques incluses

- En-têtes de sécurité + CSP stricte (`public/_headers`), aucun script inline
- `run_worker_first: ["/api/*"]` : les fichiers statiques ne consomment pas de requêtes Worker
- Service worker versionné (changer `VERSION` dans `public/sw.js` à chaque mise à jour des fichiers précachés)
- Manifest avec icônes `any` et `maskable` séparées
- Route de test : `/api/health` (et `/api/health?db=1` pour tester D1)

## Important avant d'ajouter de vraies données

Les données affichées (croyants, comité…) sont pour l'instant des exemples dans `app.js`. Avant d'exposer un vrai registre de croyants via l'API, protège l'application avec **Cloudflare Access** (Zero Trust) ou une authentification, car ce sont des données personnelles.
