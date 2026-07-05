# Specs — store des spécifications de features

Toute feature non triviale passe par une **spec écrite** avant d'être codée. C'est la traduction du principe « spec-first » : le bottleneck n'est presque jamais le modèle, c'est la spec.

## Pivot d'entrée

Conforme à **ADR-001** (knowledge-store-pattern). Seul `INDEX.md` est chargé au `SessionStart`. Les specs individuelles sont lues à la demande.

## Quand créer une spec

- Feature > 1 jour de travail
- Décision technique impactante (a fortiori si elle mérite un ADR)
- Spec produit-side venant d'une autre source (issue GitHub, ticket Jira…) — on la rapatrie et on la complète

## Quand NE PAS créer une spec

- Bug fix simple
- Refacto local < 100 lignes
- Tâche dont le périmètre tient en 1 phrase

## Workflow

1. `/spec [titre]` → wizard interactif, produit le fichier.
2. Le fichier vit en statut `brouillon` jusqu'à validation.
3. Statut `prête` quand critères d'acceptation validés.
4. Statut `en cours` quand premier chunk attaqué.
5. Statut `livrée` après merge + critères cochés.
6. Statut `abandonnée` si pivot — garder le fichier pour traçabilité.

## Conventions

- Nommage : `<id>-<titre-kebab>.md` (id sur 3 chiffres : `001`, `002`…).
- Append-only : pas d'effacement, statut `abandonnée` à la place.
- Une spec qui dépasse 1500 tokens est probablement deux specs.
- Critères d'acceptation **mesurables** uniquement. Pas de « doit être bien ».

## Lien avec les autres stores

- **ADR** (`core/architecture/decisions/`) : si la spec révèle une décision structurante, créer un ADR avant le premier chunk.
- **Eval** (`packs/evals/`) : les critères d'acceptation peuvent alimenter un dataset d'eval.
- **Memory** (`core/memory/`) : les specs livrées peuvent faire l'objet d'une `lesson:` si une difficulté inattendue est apparue.
