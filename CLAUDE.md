# blog_tech — Scaffold Claude Code

Scaffold issu de `scaffold-phases-1-to-4-addon` (phases 1 à 4). Voir
`.claude/core/` pour l'architecture (patterns, ADR) et `.claude/packs/` pour les
packs evals et research.

## Slash commands custom

- `/spec [titre]` — Wizard spec-first, produit spec + prompt plan dans `core/specs/`
- `/eval <cible>` — Eval suite (méthode Husain) sur un sub-agent, skill, ou sortie
- `/lint <chemin>` — Health-check d'un knowledge store (cohérence, doublons, liens)

## Sous-agents disponibles

- `@evaluator` — Juge une sortie contre des critères, verdict binaire + critique

## Skills

- `evaluator-optimizer` — Boucle générer→évaluer→raffiner (pattern Anthropic)
- `compile-wiki` — Compilation `packs/research/raw/` → `wiki/` (pattern Karpathy)
- `health-check` — Diagnostic santé d'un knowledge store (utilisé par `/lint`)

## Routing modèle (ADR-004)

Trois tiers, arbitrage sur **complexité × tolérance à la latence × coût** :

- **Volume** — modèles locaux (Mistral / Qwen / DeepSeek) : tâches courantes, volumineuses, pré-traitement, classification.
- **Workhorse** — Claude Opus 4.8 : défaut raisonnable pour tâches complexes.
- **Escalade** — Claude Fable 5 (classe Mythos publique) : escalade *consciente*, jamais par défaut.

Règle de décision :

1. Tâche interactive / sensible au temps → **JAMAIS Escalade**, quelle que soit la complexité. Volume si simple, Workhorse si complexe.
2. Async + volumineuse + faible enjeu de justesse → **Volume** (local).
3. Complexe + async + enjeu de justesse élevé → **Workhorse (Opus 4.8)** par défaut. Escalade vers Fable 5 seulement si Opus 4.8 a échoué le critère d'acceptation OU si l'enjeu justifie explicitement le surcoût/latence.
4. Dans le doute → **Workhorse (Opus 4.8)**.

> Pour la grille fine des cas d'escalade : `.claude/core/architecture/patterns/mythos-triggers.md`.
> Mythos Preview / Mythos 5 (accès Glasswing restreint) sont hors périmètre tant que l'accès n'est pas en place.

## Structure

```
.claude/
  agents/      → evaluator
  commands/    → spec, eval, lint
  skills/      → evaluator-optimizer, compile-wiki, health-check
  templates/   → _spec-template.md
  core/        → architecture (patterns, decisions/ADR), specs
  packs/       → evals (datasets, judges, results, error-analysis), research (raw, wiki)
```

## À faire (côté humain)

1. Tester `/spec` dans une session pour valider le wizard.
2. Calibrer avec `/eval auditor` sur `packs/evals/datasets/auditor-quality-v1.md`.
3. Tenir `core/memory/recall-misses.md` : à 3 entrées, rouvrir ADR-002.
4. Routing (ADR-004 + mythos-triggers) : journaliser les escalades dans `lessons-learned.md` pendant 2-3 semaines.
5. Au bout de 10-15 escalades effectives, faire un bilan ; si un domaine ne se justifie jamais, créer ADR-005 qui supersede partiellement ADR-004.
