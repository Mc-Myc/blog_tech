---
description: Wizard spec-first — produit une spec structurée + un prompt plan avant tout codage, avec routing pré-calculé (ADR-004), suggestion de contraintes négatives depuis les leçons, et squelette de dataset d'eval. Archive dans core/specs/.
allowed_tools: ["Read", "Write", "Edit", "Bash", "Glob", "Grep"]
argument-hint: "[titre-court]  — ex: /spec auth-stripe-checkout"
---

# /spec (v2)

Wizard *spec-first* : avant tout codage, une spec structurée + un plan de prompts
atomiques. Conforme ADR-001 (store `core/specs/`), ADR-004 (routing) et ADR-005
(exécutable par /run-spec). Le bottleneck n'est presque jamais le modèle — c'est
la spec (Osmani). Cette commande automatise spec + prompt plan.

## Usage

```
/spec [titre-court]
```

## Règle d'interactivité — non négociable

> ⚠️ **UNE SEULE question à la fois.** Après chaque question, STOP, attendre la
> réponse. Numéroter (`Question 4/11`). `?` = explication, `skip` = passer,
> `stop` = annuler. Jamais de pré-remplissage depuis la mémoire sans confirmation
> explicite. (Cette règle vaut pour ce wizard — l'amont. L'exécution, elle,
> relève d'ADR-005.)

## Workflow

### Étape 1 — Cadrage (questions 1-5)

1. **Titre** : kebab-case (si absent de l'argument).
2. **Objectif en une phrase** : « permettre à <qui> de <faire quoi> ».
3. **Pourquoi maintenant** : déclencheur business/technique.
4. **Périmètre inclus** : 3-5 puces concrètes.
5. **Périmètre exclus** : 2-4 puces. Ce point seul évite la moitié des dérives.

### Étape 2 — Contraintes (questions 6-8)

6. **Conventions** : ADRs concernés, patterns du projet, choix techno imposés.
7. **Contraintes négatives** — AVANT de poser la question : grepper
   `core/memory/lessons-learned.md` (et les règles distillées) sur les tags/mots
   du périmètre. S'il y a des correspondances, les présenter :
   > « Voici N leçons du projet qui semblent pertinentes : <liste>. On les inclut
   > comme contraintes négatives ? (oui / non / choisir) »
   Puis demander les contraintes négatives supplémentaires. **Critique** : elles
   évitent les régressions silencieuses — et sans ce raccord, elles repartaient
   de zéro à chaque spec.
8. **Critères d'acceptation** : 3-6 conditions binaires mesurables.

### Étape 3 — Routing et enjeu (questions 9-10, nouvelles — ADR-004)

9. **Enjeu et réversibilité** : « Enjeu de cette spec : normal / élevé / critique ?
   Et : une étape est-elle irréversible (migration destructive, déploiement sans
   rollback, exposition de données) ? »
   → remplit `enjeu` et `irreversible`. `critique` ou `true` = Signal D actif.
10. **Tags sensibles** : « Le périmètre touche-t-il : crypto, concurrency, pii,
    formal-proof, migration-irreversible ? » → remplit `tags` (Signal E).

**Pré-calcul du tier** (aucune question — grille ADR-006, échelle 4 niveaux,
registre `core/config/models.yaml`) :
- Signal D ou E actif → `tier: escalade` (Fable 5).
- Sinon, conception / jugement / enjeu élevé → `tier: jugement` (Opus 4.8, défaut).
- Sinon, dev courant / interactif → `tier: courant` (Sonnet 5).
- Sinon, mécanique / volume → `tier: mecanique` (Haiku 4.5).
Annoncer le tier retenu et la règle appliquée. L'utilisateur peut l'overrider.

### Étape 4 — Plan de prompts (question 11)

11. Confirmation pour générer la séquence de **chunks** (1 chunk = 1 action
    testable, ≤ 30 min, sinon subdiviser). Chaque chunk : `depends_on`, prompt
    suggéré, critère de fin binaire, tests concrets (code-based) — et un
    `tier:` par chunk quand il diverge du tier de la spec : chercher activement
    les chunks **descendables** (extraction/formatage → `mecanique`, dev
    standard → `courant`) ; on ne prend pas un architecte pour une cabane
    (skill `model-dispatch`).
    **Toujours ajouter le chunk final obligatoire** : `@evaluator` contre les
    critères d'acceptation — PASS = condition du statut `livrée`.

### Étape 5 — Production

1. Charger la skill `knowledge-store`.
2. Lire `core/specs/INDEX.md`, attribuer le prochain id (padding 3 chiffres).
3. Créer `core/specs/<id>-<titre>.md` depuis `templates/_spec-template.md`.
4. **Générer le squelette de dataset d'eval** : chaque critère d'acceptation
   devient un cas dans `packs/evals/datasets/spec-<id>-acceptance-v1.md`
   (statut `brouillon`), marqué code-based ou LLM-judge. Ajouter la ligne dans
   `packs/evals/datasets/INDEX.md`. Zéro coût, et la spec livrée est évaluable.
5. Mettre à jour `core/specs/INDEX.md` (+ `current_tokens`).
6. Si `enjeu: critique` : rappeler que la skill `pre-mortem` est **obligatoire
   avant le chunk 1**, et que `@critic` doit attaquer la spec enrichie ensuite.
7. Restituer : chemin de la spec, tier retenu, résumé des chunks, et :
   « Prêt ? `/run-spec <id>` (supervised) ou `/run-spec <id> --batch`. »

## Garde-fous

- **Aucune spec sans critères d'acceptation mesurables.** Redemander si flou.
- **Aucune spec sans contraintes négatives.** Si « je ne vois pas » : proposer les ADRs récents et les leçons du projet, reformuler.
- Une spec > 1500 tokens est probablement deux specs. Proposer le split.
- Le plan de prompts est une séquence d'invocations, pas un planning. Pas d'estimations de temps.

## Lien avec les autres commandes

- `/run-spec` exécute la spec (ADR-005). `@architect` la consomme si une décision structurante émerge.
- `@evaluator` vérifie l'implémentation contre les critères (chunk final). `@critic` attaque la spec elle-même sur les enjeux critiques.
- `/eval` utilise le dataset `spec-<id>-acceptance-v1` généré ici.
