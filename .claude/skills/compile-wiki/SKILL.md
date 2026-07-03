---
name: compile-wiki
description: >
  Compilation de sources brutes (packs/research/raw/) en pages structurées
  (packs/research/wiki/). Pattern issu de Karpathy (avril 2026) : « LLM as
  compiler » sur des fichiers markdown.
when_to_use: >
  Quand de nouvelles sources sont déposées dans raw/, quand l'utilisateur demande
  de mettre à jour le wiki, ou de répondre à une question impliquant la matière
  digérée plutôt que les sources brutes.
---

# Skill : compile-wiki

## Métaphore directrice

Le LLM agit comme un **compilateur** : il lit des sources hétéroclites (raw/), il produit un wiki structuré (wiki/). Comme un compilateur, il :
- ne modifie jamais les sources,
- produit toujours un output déterministe (au prompt près),
- peut tout re-compiler depuis zéro si nécessaire.

## Quand opérer

Trois opérations principales (vocabulaire Karpathy) :

1. **Ingest** — une ou plusieurs nouvelles sources viennent d'être déposées dans `raw/`. Compiler les nouveautés, mettre à jour les pages existantes, créer les nouvelles.
2. **Query** — l'utilisateur pose une question. Lire `wiki/INDEX.md`, identifier les pages pertinentes, répondre depuis le wiki (jamais depuis raw, sauf besoin de vérifier une citation).
3. **Lint** — passe de santé : détecter contradictions internes, liens cassés, pages sans sources, sources orphelines (présentes en raw mais jamais référencées en wiki).

## Procédure — INGEST

1. **Lister** les nouvelles sources : `raw/` vs entrées dans le frontmatter `sources:` des pages wiki existantes. Différence = nouveau.
2. Pour chaque nouvelle source :
   - Lire la source en entier.
   - Identifier les **entités** qu'elle concerne (personnes, projets, concepts, techniques, outils).
   - Pour chaque entité :
     - Si une page `wiki/<entité>.md` existe : la lire, identifier ce qui est nouveau par rapport au contenu existant, mettre à jour. Marquer toute **contradiction** explicitement (`> ⚠️ Contradiction avec source précédente : ...`).
     - Sinon : créer la page à partir du format imposé par `wiki/README.md`.
   - Ajouter la source dans le frontmatter `sources:` de chaque page concernée.
3. Mettre à jour les **backlinks** : pour chaque nouvelle relation `A → B`, ajouter `[[A]]` dans la section Liens de B si pas déjà présent.
4. Mettre à jour `INDEX.md` :
   - Ajouter les nouvelles pages.
   - Recalculer `current_tokens`.
   - Mettre à jour `last_compile` à la date du jour.
5. Restituer un **résumé court** au thread principal :
   - X nouvelles pages créées (lister).
   - Y pages mises à jour (lister).
   - Z contradictions détectées (lister, demander à l'utilisateur de trancher).

## Procédure — QUERY

1. Lire `wiki/INDEX.md`.
2. Grepper sur entité / domain / tags pour trouver les pages pertinentes.
3. Lire **uniquement** les pages identifiées (max 3-5 par requête).
4. Répondre depuis le wiki en citant les pages utilisées (`selon [[entité]]`).
5. Si rien de pertinent dans le wiki **mais** quelque chose dans `raw/` : signaler, proposer de lancer un ingest.
6. Si rien nulle part : incrémenter `core/memory/recall-misses.md` (ADR-002).

## Procédure — LINT

Pas la responsabilité de cette skill. Voir `skills/health-check/SKILL.md` qui couvre la santé de tous les knowledge stores, wiki inclus.

## Règles intangibles

- **Aucune modification de `raw/`.** Jamais. C'est la couche immuable.
- **Pas de verbatim** dans le wiki. Synthèse uniquement. Citation courte autorisée pour préserver un sens précis, mais pas un paragraphe entier.
- **Une page = une entité.** Si tu te retrouves à écrire « cette page parle aussi de X et Y », c'est qu'il faut scinder.
- **Contradictions explicites.** Si deux sources se contredisent, ne pas trancher silencieusement. Marquer le conflit, demander à l'utilisateur.
- **Pages sans sources interdites.** Toute page wiki doit avoir au moins une source listée dans son frontmatter. Pas d'invention.
- **Synthèse > exhaustivité.** Si une source de 50 pages produit une page wiki de 30 pages, tu ne synthétises pas — tu recopies. Reformuler plus dense.

## Format de pages wiki

Voir `packs/research/wiki/README.md` — format imposé, à respecter strictement.

## Lien avec le reste

- Cette skill ne s'occupe **que** du couple raw/ ↔ wiki/. Pas de mémoire projet, pas de specs, pas d'ADR.
- Si une recherche aboutit à une décision projet → l'utilisateur déclenche un ADR séparé.
- Si une recherche révèle une leçon → l'utilisateur l'ajoute à `core/memory/lessons-learned.md`.

## Mode dégradé

Si `raw/` est très volumineux (> 100 sources) et que la compile prend trop de tokens :
- Compiler **par lot** (10 sources max par invocation).
- L'utilisateur valide entre les lots.
- Pas d'ingestion silencieuse en masse.
