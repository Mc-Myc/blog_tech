---
store_name: research-wiki
store_kind: wiki
budget_tokens: 3000
current_tokens: 0
last_compact: never
parent_path: packs/research/wiki
---

# INDEX — Wiki de recherche

> Knowledge store conforme à **ADR-001**. Seul ce fichier est chargé au `SessionStart`.
> Les pages individuelles sont lues à la demande.

## Pages actives

| entité | type | domain | sources | dernière compile |
|--------|------|--------|---------|-------------------|
| (vide) | | | | |

## Archive

| période | fichier | nb d'entrées | sujets dominants |
|---------|---------|--------------|-------------------|
| (vide) | | | |

## Conventions

- **Types** : `person` / `project` / `concept` / `tool` / `technique`.
- **Une page = une entité.** Si une page traite plusieurs choses, la scinder.
- Quand `current_tokens` approche `budget_tokens` : `/compact packs/research/wiki`.
