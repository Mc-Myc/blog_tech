---
store_name: architecture-decisions
store_kind: adr
budget_tokens: 4000
current_tokens: 680
last_compact: never
parent_path: core/architecture/decisions
---

# INDEX — Architecture Decision Records

> Knowledge store conforme à **ADR-001** (knowledge-store-pattern).
> Seul ce fichier est chargé au `SessionStart`. Les ADR individuelles sont lues à la demande.

## Entrées actives

| id  | date       | statut   | titre                                       | tags                                  |
|-----|------------|----------|---------------------------------------------|---------------------------------------|
| 001 | 2026-05-28 | accepté  | Knowledge Store Pattern                     | mémoire, scaffold, transversal        |
| 002 | 2026-05-28 | accepté  | Mémoire vectorielle — différée              | mémoire, vectoriel, différé, qmd      |
| 003 | 2026-05-29 | accepté  | Patterns praticiens — convergences/divergences | attribution, karpathy, osmani, husain, anthropic |
| 004 | 2026-06-13 | accepté  | Stratégie de routing par capacité           | routing, multi-modèle, latence, coût, opus, mythos |

## Archive

| période | fichier | nb d'entrées | sujets dominants |
|---------|---------|--------------|-------------------|
| (vide)  |         |              |                   |

## Conventions

- **Append-only**, statuts : `proposé` / `accepté` / `déprécié` / `supersédé par adr-NNN`.
- Pour changer une décision : créer une nouvelle ADR qui supersede l'ancienne, **ne jamais modifier** une ADR acceptée.
- Numérotation continue, padding 3 chiffres (`adr-001-*.md`, `adr-002-*.md`…).
- Quand `current_tokens` approche `budget_tokens` : `/compact core/architecture/decisions`.
