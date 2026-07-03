# raw/ — sources immuables

Couche 1 du pack research/. **Pas de modification après dépôt.** Le LLM lit, ne touche jamais.

## Quoi mettre ici

- Articles convertis en markdown (Obsidian Web Clipper, `pandoc`, copie manuelle).
- Threads exportés (X, Reddit, forums).
- Papiers de recherche (PDF si gros, .md si déjà converti).
- Captures de conversations importantes.
- Notes de lecture brutes prises pendant une session.

## Quoi NE PAS mettre

- Tes synthèses → vont dans `wiki/`.
- État du projet → va dans `core/memory/`.
- Code → va dans le repo applicatif.

## Convention de nommage

```
<YYYY-MM-DD>-<source-slug>.<ext>
```

- Date = jour de **capture** (quand tu l'as ajoutée), pas date de publication.
- Slug court, descriptif : `karpathy-llm-wiki`, `husain-evals-guide`.
- Extensions courantes : `.md`, `.pdf`, `.txt`, `.html`.

## Frontmatter (markdown uniquement)

```yaml
---
source_url: https://...
source_author: <nom>
source_date: <YYYY-MM-DD de publication>
type: paper | thread | article | dump | notes
domain: <topic principal>
captured_at: <YYYY-MM-DD de capture>
---
```

Pas obligatoire mais aide la compilation.

## Volume

Pas de limite. Quand un sujet est clos, on peut archiver dans `raw/archive/<sujet>/`.

## Le LLM peut

- Lire toutes les sources pour produire/mettre à jour le wiki.
- Citer une source dans une page wiki par référence (`voir [[raw/2026-04-karpathy-llm-wiki]]`).

## Le LLM ne peut pas

- Modifier une source.
- Renommer un fichier raw.
- Supprimer une source (archivage manuel uniquement).
