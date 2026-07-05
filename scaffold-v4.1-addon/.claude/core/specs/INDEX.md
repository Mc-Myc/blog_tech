---
store_name: specs
store_kind: spec
budget_tokens: 3000
current_tokens: 0
last_compact: never
parent_path: core/specs
---

# INDEX — Spécifications de features

> Knowledge store conforme à **ADR-001**. Seul ce fichier est chargé au `SessionStart`.
> Les specs individuelles sont lues à la demande par leur `id`.

## Specs actives

| id  | date | statut | titre | tags |
|-----|------|--------|-------|------|
| (vide) | | | | |

## Archive

| période | fichier | nb d'entrées | sujets dominants |
|---------|---------|--------------|-------------------|
| (vide) | | | |

## Conventions

- **Statuts** : `brouillon` / `prête` / `en cours` / `livrée` / `abandonnée`.
- **Append-only** : `abandonnée` plutôt qu'effacée.
- Quand `current_tokens` approche `budget_tokens` (≥ 90%) : `/compact core/specs`.
- Cible d'archivage : specs `livrée` ou `abandonnée` depuis > 90 jours.
