# wiki/ — synthèse compilée

Couche 2 du pack research/. **Géré par le LLM**, lu par toi.

## Structure

Une page par **entité** : personne, projet, concept, technique, outil.

```
wiki/
├── README.md
├── INDEX.md             ← chargé au SessionStart
├── obsidian.md
├── qmd.md
├── mcp-protocol.md
├── evaluator-optimizer-pattern.md
└── ...
```

## Format d'une page wiki

```markdown
---
entity: <nom de l'entité>
type: person | project | concept | tool | technique
domain: <topic>
sources: [raw/2026-04-...-md, raw/2026-04-...-md]
last_compiled: <YYYY-MM-DD>
---

# <Entité>

## Résumé en une phrase

## Détails synthétisés

(Issu du contenu de raw/, jamais verbatim.)

## Liens

- Voir aussi : [[autre-entité]], [[autre-entité-2]]
- Source : `raw/<fichier>` (la source originale reste accessible)
```

## Conventions

- **Backlinks `[[entité]]`** entre pages.
- **Pas de verbatim** des sources. Synthèse uniquement.
- Une page contradictoire à une autre = signaler explicitement avec un `> ⚠️ Contradiction avec [[autre-page]] : <résumé du désaccord>`.
- Recompilation = autorisée. Une page wiki n'est pas append-only — git garde l'historique.

## Lecture

- Tu lis `INDEX.md` au démarrage.
- Tu ouvres les pages spécifiques selon ton besoin.
- Le LLM peut grepper le wiki pour répondre à une question.
