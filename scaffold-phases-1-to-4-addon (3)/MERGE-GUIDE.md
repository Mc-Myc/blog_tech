# Guide de fusion — phases 1 à 4 + ADR-004 + chain-of-thought + mythos-triggers

## Quoi extraire

Cet add-on contient :

### Fichiers NOUVEAUX (à ajouter)

```
.claude/commands/spec.md
.claude/commands/eval.md
.claude/commands/lint.md
.claude/templates/_spec-template.md
.claude/core/specs/README.md
.claude/core/specs/INDEX.md
.claude/core/architecture/patterns/llm-as-compiler.md
.claude/core/architecture/patterns/agent-workflows.md
.claude/core/architecture/patterns/agent-antipatterns.md
.claude/core/architecture/patterns/mythos-triggers.md           ← NOUVEAU (itération routing)
.claude/core/architecture/decisions/adr-003-practitioner-patterns.md
.claude/core/architecture/decisions/adr-004-model-routing-strategy.md
.claude/agents/evaluator.md                                     ← MAJ : section chain-of-thought ajoutée
.claude/skills/evaluator-optimizer/SKILL.md
.claude/skills/compile-wiki/SKILL.md
.claude/skills/health-check/SKILL.md
.claude/packs/evals/README.md
.claude/packs/evals/datasets/README.md
.claude/packs/evals/datasets/auditor-quality-v1.md
.claude/packs/evals/judges/README.md
.claude/packs/evals/results/README.md
.claude/packs/evals/error-analysis/README.md
.claude/packs/research/README.md
.claude/packs/research/raw/README.md
.claude/packs/research/wiki/README.md
.claude/packs/research/wiki/INDEX.md
```

### Fichiers OVERWRITE (à remplacer par les versions de l'add-on)

```
.claude/core/architecture/decisions/INDEX.md          ← entrées 003 et 004 ajoutées
.claude/core/architecture/decisions/adr-002-deferred-vector-memory.md  ← ajoute la mention qmd
```

### Fichiers à MODIFIER À LA MAIN dans ton scaffold existant

Six patches dans des fichiers existants à la racine de ton scaffold :

**1. `CLAUDE.md` à la racine** — ajouter dans la section "Slash commands custom" :

```
- `/spec [titre]` — Wizard spec-first, produit spec + prompt plan dans core/specs/
- `/eval <cible>` — Eval suite (méthode Husain) sur un sub-agent, skill, ou sortie
- `/lint <chemin>` — Health-check d'un knowledge store (cohérence, doublons, liens)
```

Et dans la section "Sous-agents disponibles" :

```
- `@evaluator` — Juge une sortie contre des critères, verdict binaire + critique
```

**2. `.claude/agents/README.md`** — ajouter une ligne dans la table "Agents par défaut" :

```
| `evaluator` | Juge sorties contre critères, pattern evaluator-optimizer | /eval, validation d'ADR/audit/spec avant acceptation |
```

**3. `.claude/skills/README.md`** — ajouter dans la table des skills :

```
| `evaluator-optimizer` | Boucle générer→évaluer→raffiner (pattern Anthropic) | @evaluator + @architect/@auditor |
| `compile-wiki` | Compilation raw/ → wiki/ (pattern Karpathy) | packs/research/, @memory-keeper |
| `health-check` | Diagnostic santé d'un knowledge store | /lint |
```

**4. `CLAUDE.md` à la racine — section ROUTING (ADR-004)** :

````markdown
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
````

**5. `.claude/agents/architect.md` — section Chain-of-thought (NOUVEAU)** :

À ajouter juste après la section "Mode opératoire" (ou équivalent), avant les règles intangibles :

````markdown
## Discipline de raisonnement (chain-of-thought)

Avant de proposer une option ou de rédiger une ADR, mène **INTERNEMENT** une passe structurée :

1. **Énumère 2-3 approches alternatives plausibles** pour le problème courant.
2. **Pèse explicitement leurs trade-offs** : coût, latence, maintenabilité, équipe, retrocompat, sécu.
3. **Tranche en justifiant** pourquoi tu écartes les autres.

Cette passe est **interne par défaut** : ne l'inclus dans ta sortie utilisateur que si la justification fait partie du livrable (typiquement : section "Options considérées" d'une ADR, étude de faisabilité). Sinon, ne fabrique pas d'angles artificiels — si une approche est évidemment dominante, dis-le et passe à la production.

Cette discipline rend ton raisonnement auditable et compense par méthode ce que les modèles à raisonnement plus profond (palier Mythos) font automatiquement (cf. ADR-004 + `core/architecture/patterns/mythos-triggers.md`).
````

**6. `.claude/agents/auditor.md` — section Chain-of-thought (NOUVEAU)** :

À ajouter juste après la section "Mode opératoire" (ou équivalent), avant les règles intangibles :

````markdown
## Discipline de raisonnement (chain-of-thought)

Avant de finaliser ton rapport, mène **INTERNEMENT** une passe structurée :

1. **Énumère 2-3 angles d'analyse plausibles** pour ce périmètre : par exemple architecture / surface d'attaque / comportement runtime ; ou par couche : données / logique / interface ; ou selon la skill chargée.
2. **Passe l'audit sous chacun.** Un finding visible sous l'angle A est-il aussi visible sous l'angle B ? Y a-t-il des défauts subtils qu'un seul angle aurait manqués ?
3. **Consolide** en un rapport unique, en éliminant les doublons et en hiérarchisant.

Cette passe est **interne par défaut** : elle ne paraît pas dans le rapport, sauf si une mention « angles d'analyse retenus » aide le lecteur à valider la couverture.

Cette discipline réduit le risque de manquer des défauts subtils — défaut typique d'une seule passe d'analyse. Elle compense par méthode ce que les modèles à raisonnement plus profond (palier Mythos) font automatiquement (cf. ADR-004 + `core/architecture/patterns/mythos-triggers.md`).
````

> Le patch équivalent pour `@evaluator` est **déjà intégré** dans le fichier `agents/evaluator.md` livré dans cet add-on. Tu n'as rien à modifier de plus pour `@evaluator`.

## Comment fusionner

Depuis le dossier de ton scaffold existant :

```bash
unzip -o scaffold-phases-1-to-4-addon.zip
# -o pour overwrite, vu qu'on a 2 fichiers à remplacer
```

Puis applique les 6 patches manuels ci-dessus.

## Vérification rapide

Une fois fusionné, tu devrais voir :

```bash
find .claude -name "*.md" | wc -l                   # ~127 fichiers au total (avec mythos-triggers)
ls .claude/commands/ | wc -l                        # 12 commandes (3 nouvelles)
ls .claude/skills/ | wc -l                          # 6 skills (3 nouvelles)
ls .claude/agents/ | grep "\.md$" | wc -l           # 4 agents (1 nouveau : evaluator)
ls .claude/core/architecture/decisions/             # 4 ADRs
ls .claude/core/architecture/patterns/              # 4 patterns docs (mythos-triggers ajouté)
grep -l "chain-of-thought" .claude/agents/*.md      # devrait lister evaluator + architect + auditor une fois les patches appliqués
```

## Ce qu'il reste à faire (côté toi, pas généré)

1. **Test rapide** : lancer `/spec` dans une session Claude Code pour vérifier que le wizard fonctionne.
2. **Premier vrai usage** : utiliser `/eval auditor` sur le dataset exemple — l'idée est de calibrer.
3. **Recall-misses tracker** : si lors d'une session tu cherches un truc via grep INDEX et tu ne le trouves pas alors qu'il existe, incrémente `core/memory/recall-misses.md`. À 3 entrées, on rouvre ADR-002.
4. **Routing en pratique (ADR-004 + mythos-triggers)** : observer pendant 2-3 semaines si la grille à 3 tiers tient à l'usage réel. Tenir un journal des escalades dans `lessons-learned.md` : *qu'est-ce que Mythos a effectivement apporté que l'orchestration Opus n'aurait pas pu ?*
5. **Calibration mythos-triggers** : au bout de 10-15 escalades effectives, faire un bilan. Si un domaine ne s'est jamais avéré justifié, créer ADR-005 qui supersede partiellement ADR-004.
