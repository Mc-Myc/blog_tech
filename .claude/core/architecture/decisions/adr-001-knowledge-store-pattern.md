# ADR-001 — Knowledge Store Pattern

- **Date** : 2026-05-28 (reconstituée le 2026-07-05 — fichier du scaffold de
  base jamais livré ; contenu rétabli depuis l'INDEX et la skill `knowledge-store`)
- **Statut** : accepté
- **Tags** : mémoire, scaffold, transversal

## Contexte

Le scaffold accumule de la connaissance (ADRs, leçons, evals, recherches).
Tout charger à chaque session explose le contexte ; ne rien charger fait
perdre la mémoire du projet.

## Décision

Toute connaissance persistante vit dans des **knowledge stores** : un dossier
par store, un `INDEX.md` avec frontmatter (`store_name`, `store_kind`,
`budget_tokens`, `current_tokens`, `last_compact`) chargé seul au
`SessionStart` ; les entrées individuelles sont lues à la demande.

Règles : append-only ; archivage par `/compact` quand `current_tokens`
approche `budget_tokens` ; conventions d'écriture dans la skill
`knowledge-store`.

## Options considérées

1. **Tout dans CLAUDE.md** — simple mais contexte saturé, rejeté.
2. **Mémoire vectorielle** — différée (ADR-002) tant que le grep d'INDEX suffit.
3. **Stores indexés à chargement paresseux** — retenu.

## Conséquences

- Chaque nouveau type de connaissance = un nouveau store conforme, jamais un
  fichier isolé.
- La santé des stores se mesure (`/lint`) et se maintient (`/compact`,
  `distill-lessons`).
