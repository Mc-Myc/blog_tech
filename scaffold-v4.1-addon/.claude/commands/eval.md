---
description: Lance une eval suite sur un sub-agent, une skill, une commande, ou une sortie spécifique. Méthode Husain (critique shadowing + LLM-as-judge + analyse d'erreurs). Archive le rapport.
allowed_tools: ["Task", "Read", "Write", "Edit", "Bash", "Glob", "Grep"]
argument-hint: "<cible> [dataset]  — ex: /eval auditor  |  /eval architect adr-quality-v1"
---

# /eval

Évalue une **cible** (sub-agent, skill, commande, ou sortie ponctuelle) contre un **dataset** d'eval. Renvoie un verdict, un rapport priorisé, et archive le tout.

## Pourquoi

Sans eval :
- On modifie un prompt et on ne sait pas si on a amélioré ou dégradé.
- On accepte des sorties au *vibe-check*, ce qui marche jusqu'au jour où ça ne marche plus.
- On ne peut pas faire confiance à un agent en production parce qu'on ne sait pas mesurer sa qualité.

L'eval est au LLM ce que le test est au code : tu ne livres pas sans, et tu ne modifies pas sans.

## Usage

```
/eval <cible> [dataset]
```

- `<cible>` : nom de l'objet à évaluer (`auditor`, `architect`, `memory-keeper`, `compile-wiki`, ou un chemin de fichier).
- `[dataset]` (optionnel) : nom du dataset à utiliser. Défaut : le dataset le plus récent associé à la cible.

Exemples :
- `/eval auditor` → évalue `@auditor` sur le dataset par défaut.
- `/eval auditor security-audit-v2` → utilise un dataset spécifique.
- `/eval ./packs/security/audits/2026-04-12-security.md` → évalue un rapport ponctuel.

## Méthodologie (méthode Husain)

### 1. Analyse d'erreurs AVANT infrastructure

Si c'est la première fois que tu évalues cette cible, **ne pas** créer de dataset complexe d'emblée. Husain : *« passer 30 minutes à revoir manuellement 20-50 sorties LLM dès qu'on fait un changement significatif »*. Workflow :

- Récupérer les 20-50 dernières sorties réelles de la cible (dans `packs/<pack>/audits/`, `core/architecture/decisions/`, etc.).
- Identifier 3-5 **modes d'échec récurrents** par observation directe.
- Chaque mode d'échec devient un critère du dataset.

### 2. Critique shadowing (au lieu de scores 1-5)

Pour chaque sortie évaluée :
- Verdict binaire : `PASS` ou `FAIL`.
- Critique détaillée écrite par un expert humain (toi) OU par un LLM judge entraîné sur des critiques humaines.
- Les critiques humaines deviennent les *few-shot examples* du judge LLM. Le judge devient progressivement plus aligné sur ton jugement.

### 3. Combinaison code-based + LLM-as-judge

- **Code-based** : critères déterministes (regex sur le format, schéma JSON valide, présence d'une section attendue). Fiable, rapide, pas d'ambiguïté.
- **LLM-as-judge** : critères qualitatifs (« la critique de sécurité est-elle priorisée correctement ? », « l'ADR justifie-t-elle la décision ? »). Délégué au sub-agent `@evaluator`.

Un dataset bien formé mélange les deux. **Pas de LLM judge sur ce qui est mesurable par code**.

## Workflow

### Étape 1 — Résoudre la cible et le dataset

- Charger la skill `evaluator-optimizer`.
- Localiser le dataset (`packs/evals/datasets/<nom>.md`). Si absent, proposer d'amorcer un dataset par analyse d'erreurs (cf. point 1 ci-dessus).
- Lire les critères du dataset.

### Étape 2 — Préparer les cas de test

Selon la cible :
- **Sub-agent** : lancer la cible sur N cas réels ou synthétiques du dataset, collecter les sorties.
- **Skill** : invoquer la skill via une commande ou un agent, collecter la sortie.
- **Sortie ponctuelle** : utiliser directement le fichier passé en argument.

### Étape 3 — Évaluation

Pour chaque cas :
1. Critères **code-based** vérifiés directement (bash, grep, schema check).
2. Critères **LLM-as-judge** délégués à `@evaluator` (contexte isolé).
3. Agrégation : verdict global = `PASS` si tous les critères critiques sont `PASS`, `FAIL` sinon.

### Étape 4 — Restitution

Produire un rapport au format :

```markdown
# Eval Run — <cible> — <dataset> — <date>

## Synthèse
- Cas évalués : N
- PASS : x / N (pourcentage)
- FAIL : y / N
- Modes d'échec dominants : <top 3>

## Détail par cas

### Cas 1 : <titre>
- Verdict : PASS
- Critères code-based : ✅✅✅
- Critères LLM-judge : ✅✅
- Critique : <2 phrases>

### Cas 2 : <titre>
- Verdict : FAIL
- Critères code-based : ✅✅❌
- Critères LLM-judge : ✅❌
- Critique détaillée : <verbatim de @evaluator>
- Action corrective : <ce qui doit changer dans le prompt/la skill>

...

## Analyse d'erreurs
- <Pattern récurrent 1 — combien de cas, exemples>
- <Pattern récurrent 2>

## Recommandations
- Si pass rate ≥ 95% : envisager de durcir le dataset (Husain : "un eval qui passe à 100% ne stresse rien").
- Si pass rate ≤ 50% : c'est la cible OU le dataset qui dérive. Faire une session manuelle d'analyse d'erreurs.
- Si modes d'échec concentrés sur un critère : modifier le prompt de la cible OU clarifier le critère.

## Archivage
Rapport sauvegardé dans : packs/evals/results/<date>-<cible>-<dataset>.md
```

### Étape 5 — Action corrective optionnelle

À la fin, **demander à l'utilisateur** (une seule question) :
> Pass rate : X%. Veux-tu :
> a) lancer une boucle evaluator-optimizer pour corriger les FAIL ?
> b) modifier le prompt/la skill de la cible ?
> c) durcir le dataset ?
> d) ne rien faire (rapport pour info) ?

Attendre la réponse. Aucune action automatique.

## Journalisation automatique (learning-loop, write-ahead)

À la fin de chaque run — et non « en fin de session » :

1. Ajouter la ligne du run dans `packs/evals/results/INDEX.md`.
2. Pour chaque **FAIL** : appender immédiatement une entrée `[auto]` dans `core/memory/lessons-learned.md` (une ligne : cible, critère, mode d'échec).
3. **Flywheel Husain** : pour chaque FAIL sur un cas réel non couvert par le dataset, proposer (une question) d'ajouter le cas au dataset de la cible — l'échec d'aujourd'hui devient le test de régression de demain.
4. **Few-shot du judge** : si l'utilisateur a validé ou corrigé une critique de `@evaluator` pendant le run, proposer de l'ajouter aux exemples few-shot du dataset (section judges/). La critique humaine aligne progressivement le judge.

Ces appends sont de la **capture**, pas de la modification de comportement — la promotion en règles passe par `distill-lessons` (validation humaine).

## Garde-fous

- **Pas de modification de prompt en prod sans eval préalable.** Convention du scaffold : tout changement à un fichier de `agents/` ou `skills/` doit être suivi d'un `/eval` sur la cible avant merge.
- **Aucun score 1-5.** Verdict binaire uniquement.
- **Un dataset ≠ une vérité absolue.** Un dataset est un instantané du jugement humain. Il évolue : `versioner` les datasets (`v1`, `v2`...).
- **Pas d'eval automatique silencieuse.** L'utilisateur valide chaque exécution.

## Datasets connus

Voir `packs/evals/datasets/INDEX.md`. Au démarrage, un seul dataset existant : `auditor-quality-v1` (exemple fourni, à compléter avec des cas réels).
