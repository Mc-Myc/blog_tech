---
description: Orchestrateur d'exécution d'une spec — déroule les chunks séquentiellement avec gate de review (tests concrets + @evaluator) à chaque fin de chunk. Modes supervised (défaut) et batch (zéro question, checkpoints). Conforme ADR-005.
allowed_tools: ["Task", "Read", "Write", "Edit", "Bash", "Glob", "Grep"]
argument-hint: "<id-spec> [--batch] [--checkpoint N]  — ex: /run-spec 042 --batch --checkpoint 3"
---

# /run-spec

Exécute le plan de prompts d'une spec, chunk par chunk, avec vérification du
critère de fin de chaque chunk avant de passer au suivant. C'est l'orchestrateur
minimal du pattern Orchestrator-Workers : pas de parallélisme magique, la boucle
chunk → check → chunk que l'utilisateur faisait à la main.

## Usage

```
/run-spec <id> [--batch] [--checkpoint N]
```

- `<id>` : id de la spec dans `core/specs/`.
- `--batch` : mode autonome (voir ADR-005). Défaut : supervised.
- `--checkpoint N` : override du `checkpoint_every` du frontmatter (défaut 3).

## Pré-vol (avant le chunk 1)

1. Lire la spec. Refuser si statut ≠ `prête` ou `en cours`.
2. Vérifier que chaque chunk a un **critère de fin** binaire. Sinon : retour à `/spec`, pas d'exécution.
3. Si `enjeu: critique` : vérifier qu'un pre-mortem figure dans la section Risques. Sinon, le proposer — **c'est la seule question autorisée en pré-vol batch**.
4. Résoudre l'ordre : tri topologique sur `depends_on`. Cycle = erreur, retour utilisateur.
5. Confirmer le tier de routing du frontmatter (ADR-006) et vérifier les `tier:` par chunk via `model-dispatch` — un chunk `escalade` sans signal A-E documenté redescend à `jugement` avec avertissement.

## Boucle d'exécution

Pour chaque chunk, dans l'ordre :

### 1. Dispatch puis exécution
Résoudre le modèle via la skill `model-dispatch` : tier du chunk si présent,
sinon tier de la spec, sinon défaut — puis `core/config/models.yaml` → modèle
concret. Indisponibilité ou refus-classifieur (Fable 5) = fallback en cascade,
**journalisé dans escalations.md**, jamais silencieux. Lancer le prompt du
chunk sur le modèle résolu.

**Mode supervised** : si une info manque, poser la question (une seule à la fois) et attendre.
**Mode batch** : ne JAMAIS poser de question. Info manquante → poser une **hypothèse
explicite**, l'appender immédiatement dans `core/specs/<id>-assumptions.log.md`
(write-ahead : une ligne datée par hypothèse), et continuer.

### 2. Gate de review — fin de chunk (les deux modes)
- **Tests concrets** (code-based) : exécuter les commandes listées dans « Tests concrets » du chunk (tests, build, schema-check). Verdict déterministe.
- **Tests virtuels** : invoquer `@evaluator` (contexte isolé) contre le critère de fin du chunk.
- Les deux PASS → chunk validé, appender une ligne au journal d'exécution, chunk suivant.
- FAIL → boucle evaluator-optimizer (max 3 itérations, skill `evaluator-optimizer`).

### 3. Arrêts

**Checkpoints volontaires (batch)** : tous les N chunks, STOP. Restituer : chunks
faits, verdicts, hypothèses posées depuis le dernier checkpoint. Attendre
validation ou réorientation.

**Arrêts forcés (batch, court-circuitent N — non négociables)** :
1. **FAIL persistant** après 3 itérations de la boucle — inutile de continuer sur des fondations cassées. C'est aussi un Signal A (mythos-triggers) : le proposer.
2. **Action irréversible imminente** (`irreversible: true` au niveau spec, ou opération détectée comme destructive : migration, suppression, déploiement). L'humain valide, toujours.
3. **Hypothèse touchant une contrainte explicite** de la spec (contraintes négatives ou conventions). L'agent ne tranche jamais contre la spec.

## Fin de run

1. Chunk final = validation de livraison (`@evaluator` contre les critères d'acceptation de la spec). PASS → proposer le passage au statut `livrée`. FAIL → statut reste `en cours`, actions correctives restituées.
2. Restituer : rapport par chunk, hypothèses posées (batch), verdict final, journal d'exécution archivé.
3. Rappeler `/debrief` si des événements notables ont eu lieu (FAIL, escalade, hypothèse risquée).

## Journalisation (learning-loop, write-ahead)

À chaque événement, append **immédiat** (pas en fin de run) :
- FAIL de gate → `core/memory/lessons-learned.md` (une ligne : chunk, critère, cause si connue).
- Escalade de tier → `core/memory/escalations.md`.
- Hypothèse batch → `core/specs/<id>-assumptions.log.md`.

Si la session est interrompue, tout ce qui s'est produit est déjà sur disque.
Un `/run-spec <id>` ultérieur reprend au premier chunk non validé.

## Garde-fous

- **Le mode batch n'assouplit aucune règle** : mêmes gates, mêmes tiers, mêmes arrêts forcés. Il supprime seulement les questions de confort.
- **Pas de modification de la spec pendant le run.** Une spec qui doit changer = run arrêté, retour à `/spec`, nouveau run.
- **Une seule spec à la fois** par session. Le parallélisme entre chunks indépendants (`depends_on`) se fait par sessions séparées, manuellement, pour l'instant.
