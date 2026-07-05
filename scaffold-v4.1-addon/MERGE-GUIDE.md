# Guide de fusion — add-on v4.1 (cumulatif)

> Version : voir `VERSION`. Diff détaillé : `CHANGELOG.md`.
> Cet add-on est **cumulatif** : il contient tout le contenu v3 + les ajouts v4.
> Il se merge sur le scaffold de base, que la v3 ait été appliquée ou non.

## 0. Prérequis

L'add-on suppose que le scaffold de base contient : `CLAUDE.md`,
`.claude/agents/README.md` + `architect.md` + `auditor.md`,
`.claude/skills/README.md`, la skill `knowledge-store`, la commande `/compact`,
et `core/memory/lessons-learned.md` + `recall-misses.md`.

**`merge.sh` vérifie tout ça et refuse de merger si un prérequis manque**
(échec bruyant > échec silencieux).

## 1. Comment fusionner

Depuis la racine de ton scaffold :

```bash
unzip -o scaffold-v4-addon.zip   # -o : 2 fichiers v3 sont remplacés + fichiers v4
bash merge.sh                    # prérequis + patches + vérification, idempotent
```

C'est tout. Les 6 patches manuels de la v3 sont appliqués par le script
(et convertis au passage : les sections chain-of-thought verbeuses des agents
deviennent un chargement de la skill partagée `reasoning-discipline`).

## 2. Ce que contient l'add-on

### Nouveaux fichiers v4

```
VERSION, CHANGELOG.md, merge.sh
.claude/commands/run-spec.md                 ← orchestrateur (ADR-005)
.claude/commands/debrief.md
.claude/agents/critic.md                     ← red-team
.claude/skills/reasoning-discipline/SKILL.md ← CoT partagé (déduplication)
.claude/skills/voting/SKILL.md               ← détecteur Signal B
.claude/skills/pre-mortem/SKILL.md
.claude/skills/distill-lessons/SKILL.md
.claude/core/memory/escalations.md           ← journal des escalades
.claude/core/architecture/decisions/adr-005-execution-modes-and-learning.md
.claude/core/architecture/patterns/learning-loop.md
.claude/core/config/models.yaml              ← v4.1 : registre des modèles (source de vérité opérationnelle)
.claude/skills/model-dispatch/SKILL.md       ← v4.1 : résolution tâche → modèle + fallback
.claude/core/architecture/decisions/adr-006-model-ladder-and-dispatch.md ← v4.1
.claude/packs/providers-externes.disabled/   ← v4.1 : extension hors-Claude, dormante
.claude/packs/evals/datasets/INDEX.md        ← correction (référence cassée de /eval)
.claude/packs/evals/results/INDEX.md         ← correction
.claude/packs/produit/**                     ← 5 fichiers (2 rôles, 2 skills)
.claude/packs/marketing/**                   ← 6 fichiers (2 rôles, 3 skills)
.claude/packs/design/roles/** + skills/**    ← 6 fichiers (extension du pack existant)
.claude/packs/data-ia/**                     ← 7 fichiers (3 rôles, 3 skills)
.claude/packs/3d/**                          ← 4 fichiers (3 skills, pas de rôle)
```

### Fichiers v3 modifiés en v4 (livrés, overwrite)

```
.claude/commands/spec.md        ← v2 : routing pré-calculé, leçons → Q7, dataset généré, chunk final @evaluator
.claude/commands/eval.md        ← + journalisation auto, flywheel FAIL→dataset, few-shot judge
.claude/commands/lint.md        ← + journalisation des ERROR
.claude/templates/_spec-template.md ← frontmatter enjeu/irreversible/tier/checkpoint_every, depends_on, chunk final
.claude/agents/evaluator.md     ← CoT via skill partagée
.claude/core/architecture/decisions/INDEX.md ← entrée 005
```

Le reste = contenu v3 inchangé (mythos-triggers, ADR-004, skills evals/research, etc.).

## 3. Conventions nouvelles à connaître

- **Les rôles des packs métier vivent DANS le pack** (`packs/<pack>/roles/`), pas dans `.claude/roles/` : ils s'activent/désactivent avec le pack. Divergence assumée, documentée dans chaque README de pack.
- **Capture write-ahead** : /eval, /lint et /run-spec journalisent leurs événements au moment où ils se produisent. Aucune action de ta part — mais ne t'étonne pas de voir `lessons-learned.md` grossir tout seul avec des entrées `[auto]`.
- **CLAUDE.md ne porte plus la règle de routing complète** — juste la table 4 niveaux + les pointeurs. models.yaml (opérationnel) et ADR-006 (politique) sont les sources de vérité ; mythos-triggers garde les signaux d'escalade.
- **Les documents référencent des niveaux (`jugement`), jamais des IDs de modèles** — un changement de gamme = une ligne dans models.yaml. Sonnet 5 est sorti 4 jours avant cette livraison : repli documenté vers Sonnet 4.6 dans ADR-006 si besoin.

## 4. Vérification rapide

`merge.sh` l'affiche en fin de run. Manuellement :

```bash
grep -l "reasoning-discipline" .claude/agents/*.md | wc -l   # 4 (architect, auditor, evaluator, critic)
ls .claude/core/architecture/decisions/adr-*.md | wc -l      # 5 ADRs
test -f .claude/packs/evals/datasets/INDEX.md && echo OK     # correction appliquée
ls -d .claude/packs/{produit,marketing,data-ia,3d}           # 4 packs métier
```

Puis un test fonctionnel : `/lint core/architecture/decisions` (doit passer),
et `/spec test-v4` pour dérouler le wizard v2 (questions 9-10 de routing incluses).

## 5. Ce qu'il reste à faire (côté toi, pas généré)

1. **Premier /run-spec en supervised** sur une petite spec réelle — valider les gates avant de passer en batch.
2. **Premier batch avec `--checkpoint 2`** (plus serré que le défaut 3) le temps de prendre confiance.
3. **Packs métier** : désactiver (`.disabled`) ceux qui ne servent pas tout de suite — un pack dormant est du bruit dans le contexte.
4. **Calibration** (inchangé depuis v3) : journal des escalades → bilan à 10-15 entrées → ADR-006 si un domaine ne se justifie jamais. `checkpoint_every: 3` se calibre pareil.
5. **distill-lessons** : premier run quand `lessons-learned.md` atteint ~15 entrées.
