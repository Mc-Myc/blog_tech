# blog_tech — Scaffold Claude Code (v4.1)

Scaffold v4.1 (add-on cumulatif v3+v4+v4.1 mergé le 2026-07-05). Voir
`.claude/core/` pour l'architecture (patterns, ADRs) et `.claude/packs/` pour
les packs métier. Projet : blog Django + Next.js — spec dans
`docs/superpowers/specs/`, plan en cours dans `docs/superpowers/plans/`.

## Slash commands

- `/spec [titre]` — Wizard spec-first v2 (routing pré-calculé, leçons, dataset généré)
- `/run-spec <id> [--batch] [--checkpoint N]` — Orchestrateur d'exécution (ADR-005)
- `/eval <cible>` — Eval suite (méthode Husain) + journalisation auto
- `/lint <chemin>` — Health-check d'un knowledge store + journalisation auto
- `/compact <store>` — Compaction d'un knowledge store
- `/debrief` — Consolidation de fin de session (3 questions)

## Sous-agents

- `@architect` — Conception, ADRs (Opus 4.8)
- `@auditor` — Audits avec preuves fichier:ligne (Opus 4.8)
- `@evaluator` — Juge une sortie contre des critères, verdict binaire (Sonnet 5, escalade auto)
- `@critic` — Red-team sans critères prédéfinis (Opus 4.8)

## Skills

evaluator-optimizer · compile-wiki · health-check · knowledge-store ·
reasoning-discipline (CoT partagé) · voting (Signal B) · pre-mortem (enjeu
critique) · distill-lessons · model-dispatch (ADR-006)

## Routing modèle (ADR-006)

| Niveau | Modèle | Expert de |
|---|---|---|
| mecanique | Haiku 4.5 | volume, mécanique : extraction, formatage, checks |
| courant | Sonnet 5 | dev courant, interactif, wizards, gates @evaluator |
| jugement | Opus 4.8 | conception, jugement, @architect/@auditor/@critic — défaut |
| escalade | Fable 5 | signaux A-E uniquement, jamais par défaut, jamais interactif |

> Sources de vérité : `core/config/models.yaml` (opérationnel), ADR-006 (politique),
> `mythos-triggers.md` (signaux d'escalade). Ne pas dupliquer la règle ici.

## Structure

```
.claude/
  agents/      → architect, auditor, evaluator, critic
  commands/    → spec, run-spec, eval, lint, compact, debrief
  skills/      → 9 skills (voir .claude/skills/README.md)
  core/        → architecture (patterns, 5 ADRs), config/models.yaml,
                 memory (lessons-learned, recall-misses, escalations), specs
  packs/       → evals, research, produit, marketing, design, data-ia, 3d,
                 providers-externes.disabled
```

## À faire (côté humain — v4.1)

1. Premier `/run-spec` en supervised sur une petite spec réelle.
2. Premier batch avec `--checkpoint 2` le temps de prendre confiance.
3. Désactiver (`.disabled`) les packs métier qui ne servent pas tout de suite.
4. Calibration : journal des escalades → bilan à 10-15 entrées → réviser ADR-006.
5. `distill-lessons` : premier run quand `lessons-learned.md` atteint ~15 entrées.
