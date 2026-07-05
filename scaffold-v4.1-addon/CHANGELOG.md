# Changelog — scaffold add-on

## v4.1.0 — 2026-07-04

Add-on cumulatif (contient v3 + v4 + les ajouts ci-dessous).

### Gestion des modèles par tâche + orchestration (ADR-006)
- **ADR-006** : échelle Claude-native à 4 niveaux — mecanique (Haiku 4.5), courant (Sonnet 5, sorti le 2026-06-30), jugement (Opus 4.8), escalade (Fable 5, signaux A-E inchangés). Supersede partiellement ADR-004 (la table des tiers ; la politique d'escalade survit).
- **`core/config/models.yaml`** : source de vérité opérationnelle — IDs vérifiés contre la doc Anthropic le 2026-07-03, chaînes de fallback, affectation des agents.
- **Skill `model-dispatch`** : résolution chunk → tier → modèle, fallback en cascade journalisé dans escalations.md (y compris le refus-classifieur spécifique à Fable 5), garde-fou « escalade exige un signal », grille de descente volontaire.
- **`tier:` par chunk** dans le template (override optionnel du tier de la spec).
- `/spec` : pré-calcul sur la grille 4 niveaux + proposition de tiers par chunk à la génération du plan.
- `/run-spec` : dispatch en début de chaque chunk, vérification des tiers en pré-vol.
- Frontmatter `model:` posé sur les 4 agents (architect/auditor/critic → Opus 4.8 ; evaluator → Sonnet 5 avec escalade auto vers Opus sur enjeu élevé/critique ; base patchée par merge.sh).
- Pack `providers-externes` (**désactivé**) : squelette pour locaux/ChatGPT le jour venu — rien n'en dépend.
- merge.sh : remplace le bloc routing 3 tiers (v4) de CLAUDE.md par la table 4 niveaux.


## v4.0.0 — 2026-07-03

Add-on **cumulatif** : contient tout le contenu v3 + les ajouts ci-dessous. Se merge sur le scaffold de base, avec ou sans v3 déjà appliqué.

### Corrections
- `packs/evals/datasets/INDEX.md` et `packs/evals/results/INDEX.md` créés (conformité ADR-001 ; référence cassée dans `/eval` réparée).
- `_spec-template.md` : frontmatter enrichi (`enjeu`, `irreversible`, `tier`, `checkpoint_every`, tags sensibles) — les Signaux D/E de mythos-triggers deviennent opérants.
- `merge.sh` : application automatique des patches manuels + vérification.
- Règle de routing dédupliquée : CLAUDE.md ne porte plus que la table des tiers + pointeur vers ADR-004 (source de vérité).
- Discipline chain-of-thought extraite en skill partagée `reasoning-discipline` ; les agents la chargent au lieu de la dupliquer.
- MERGE-GUIDE : section Prérequis avec check bash des dépendances.
- `VERSION` + `CHANGELOG.md`.

### Workflow
- `/spec` v2 : questions de routing (enjeu/irréversibilité/tags) → tier pré-calculé dans le frontmatter ; suggestion de contraintes négatives depuis `lessons-learned.md` ; génération d'un squelette de dataset d'eval depuis les critères ; chunk final `@evaluator` systématique (PASS = condition du statut `livrée`).
- Store `core/memory/escalations.md` (journal des escalades, calibration ADR-005).

### Profondeur de réflexion
- Skill `voting` (3 passes isolées, détection Signal B).
- Agent `@critic` (red-team sans critères prédéfinis).
- Skill `pre-mortem` (obligatoire sur spec `enjeu: critique`).

### Orchestration
- `/run-spec` : exécution des chunks, modes supervised/batch, gates de review, checkpoints.
- `depends_on` entre chunks dans le template.
- `/debrief` : consolidation optionnelle des leçons.

### Apprentissage auto
- Capture write-ahead : hooks de journalisation dans `/eval`, `/lint`, flux d'escalade et `/run-spec`.
- Skill `distill-lessons` : consolidation + détection de récurrences (seuil 3 = candidate à promotion).
- Raccords : leçons → contraintes négatives de `/spec` ; FAIL réel → cas de dataset ; critiques validées → few-shot du judge.
- Pattern doc `learning-loop.md` : règle « capture automatique, promotion validée », leçons 2 niveaux (projet / tag `scaffold`).

### ADR
- ADR-005 : modes d'exécution (supervised/batch/checkpoints/arrêts forcés) + politique de capture des leçons. INDEX décisions mis à jour.

### Packs métier (5)
- `packs/produit/` — product-owner, chef-de-projet ; priorisation, user-stories.
- `packs/marketing/` — growth, content-manager ; funnel AARRR, copywriting, calendrier éditorial.
- `packs/design/` (extension) — ux-ui, motion ; heuristiques Nielsen, design tokens, principes motion, revue de maquette.
- `packs/data-ia/` — ingenieur-ia, data-engineer, ethique-ia ; qualité de données, model cards, RGPD/AI Act.
- `packs/3d/` — skills uniquement : Three.js/WebGL, pipeline d'assets, optimisation de scènes.

## v3 — 2026-06-13
- `mythos-triggers.md`, ADR-004, discipline chain-of-thought (evaluator + patches architect/auditor).

## v2 — 2026-05-29
- Phases 1 à 4 : /spec, /eval, /lint, @evaluator, packs evals/ et research/, patterns docs.
