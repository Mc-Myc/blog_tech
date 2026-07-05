# Pack : Research

**Ingestion de matière externe** (papiers, threads, articles, dumps de conversations, captures) et compilation en wiki structuré. Pattern issu de Karpathy (avril 2026) : *raw → wiki via LLM-as-compiler*.

## Quand activer ce pack

- Tu lis/digères beaucoup pour un sujet (recherche pour Agent IDE Phase 3, veille sur un domaine…).
- Tu accumules des sources brutes qui sinon polluent `core/memory/` ou se perdent dans des onglets.
- Tu veux pouvoir retrouver "le truc que j'avais lu sur X" dans 6 mois.

Désactiver pour : projets pur-build sans phase de veille/recherche.

## Architecture en 3 couches

```
research/
├── README.md
├── raw/                  ← Couche 1 : sources IMMUABLES
│   ├── README.md
│   └── <YYYY-MM-DD>-<source-slug>.{md,pdf,txt}
├── wiki/                 ← Couche 2 : SYNTHÈSE compilée par le LLM
│   ├── README.md
│   ├── INDEX.md         ← chargé au SessionStart
│   └── <entité-slug>.md ← une page par entité/concept
└── (schéma = ce README + CLAUDE.md à la racine du projet)
```

### Couche 1 — `raw/` (immuable)

- Sources brutes telles que reçues : papiers PDF convertis, threads X exportés, articles enregistrés.
- **Le LLM lit mais ne modifie jamais.** Tu peux toujours re-compiler le wiki depuis raw/ en cas de besoin.
- Nommage : `<YYYY-MM-DD>-<source-slug>.<ext>`. La date = date de capture, pas date de publication.
- Tags via frontmatter YAML si markdown : `---\ntype: paper|thread|article|dump\ndomain: <topic>\n---`

### Couche 2 — `wiki/` (compilé)

- Markdown propre, géré par la skill `compile-wiki`.
- Une page par **entité** (personne, projet, concept, technique) : `obsidian.md`, `qmd.md`, `mcp-protocol.md`.
- Liens internes `[[entité]]` entre pages.
- `INDEX.md` (knowledge store conforme à ADR-001) liste les pages actives.

## Workflow

1. **Capture** : tu déposes une source dans `raw/` (manuel pour l'instant — éventuellement un script plus tard).
2. **Compile** : tu lances la skill `compile-wiki` (via une commande ou en demande explicite).
3. **Le LLM** lit la nouvelle source + le wiki existant, et :
   - crée/met à jour les pages d'entités concernées dans `wiki/`,
   - ajoute des backlinks,
   - signale les contradictions avec ce qui est déjà dans le wiki.
4. **Tu lis** uniquement `wiki/INDEX.md` au quotidien, et les pages spécifiques selon ton besoin.

## Principes

- **Le wiki ne contient pas de verbatim** des sources. Que de la synthèse. Les sources restent dans `raw/`.
- **Pas de duplication** entre pages. Si une info appartient à 2 entités, mettre dans l'une et linker depuis l'autre.
- **Append-only au niveau projet** : une source n'est jamais effacée de `raw/`. Une page wiki peut être réécrite, mais l'historique git la conserve.
- **Le wiki est de la matière, pas la mémoire vivante.** Ne pas y mettre l'état du projet (qui va dans `core/memory/`).

## Outillage futur (non implémenté)

Quand le wiki dépasse ~50 pages, envisager :
- **qmd** (Tobi Lutke, recherche locale BM25+vectoriel sur markdown, CLI + MCP) — mentionné dans ADR-002 comme implémentation cible si la mémoire vectorielle est activée.
- **Obsidian** comme front-end de lecture (non obligatoire — VSCode, Helix, cat, n'importe quel éditeur markdown fait l'affaire).

Aucune dépendance imposée par le scaffold.

## Lien avec le reste

- `core/specs/` : une spec peut référencer des pages wiki comme contexte (« voir `wiki/auth-stripe.md` pour le contexte »).
- `core/memory/` : si une session de recherche aboutit à une **leçon**, elle va dans `lessons-learned.md`, pas dans le wiki.
- `core/architecture/decisions/` : si une recherche conclut sur une décision, elle déclenche un ADR.
