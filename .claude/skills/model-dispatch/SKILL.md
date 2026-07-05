---
name: model-dispatch
description: >
  Résolution tâche → niveau → modèle Claude concret, avec chaîne de fallback
  journalisée. Consomme core/config/models.yaml (source de vérité opérationnelle).
  Utilisée par /run-spec en début de chaque chunk, et par toute invocation
  d'agent qui veut router explicitement.
when_to_use: >
  Automatiquement en début de chunk (/run-spec) ; manuellement pour choisir le
  modèle d'une tâche ponctuelle ; à chaque indisponibilité ou refus de modèle.
---

# Skill : model-dispatch

## Résolution (dans l'ordre)

1. **Tier du chunk** (`tier:` dans le chunk du plan de prompts) s'il existe ;
2. sinon **tier de la spec** (frontmatter, pré-calculé par /spec) ;
3. sinon `dispatch.defaut_spec` de models.yaml (`jugement`).

Puis `ladder.<tier>.model` dans models.yaml → ID du modèle à invoquer.

## Garde-fou escalade

Le niveau `escalade` (Fable 5) exige un **signal A-E documenté** (mythos-triggers) :
- posé par /spec (Signal D/E détectés au wizard → `tier: escalade` au frontmatter), ou
- constaté en cours de run (Signal A : FAIL persistant après boucle ; Signal B : divergence de fond via voting).
Un chunk marqué `tier: escalade` sans signal référencé = erreur de dispatch, on
redescend à `jugement` et on le signale. `escalade_requiert_signal: true` n'est
pas une préférence, c'est la discipline d'ADR-004 qui survit dans ADR-006.

## Fallback en cascade

À l'invocation, deux cas de repli, tous deux via `ladder.<tier>.fallback` :

1. **Indisponibilité** (modèle absent du plan, erreur d'accès, surcharge persistante).
2. **Refus par classifieur** — spécifique à Fable 5 : l'API répond `stop_reason: "refusal"` (HTTP 200). Ne PAS reformuler pour contourner : retomber sur `jugement` (Opus 4.8) et continuer, comme l'API le prévoit.

Chaîne complète : `escalade → jugement → courant`. `mecanique` remonte vers
`courant` (un modèle plus capable peut toujours faire une tâche mécanique,
l'inverse est faux).

**Chaque fallback est journalisé** (write-ahead, ADR-005) dans
`core/memory/escalations.md` :

```
- [YYYY-MM-DD] fallback de:<tier> vers:<tier> cause:<indispo|refus-classifieur|autre> tâche:<une phrase> verdict:pending
```

Un fallback silencieux est un bug : le run continue, mais la trace existe.

## Descente volontaire (l'autre moitié du travail)

Le dispatch ne fait pas que monter. À la génération du plan (/spec) et en revue
de plan, chercher activement les chunks descendables :

| Le chunk est... | Alors |
|---|---|
| extraction, formatage, renommage, conversion, classification | `tier: mecanique` |
| dev standard, premier jet, doc, test simple | `tier: courant` |
| conception, refacto structurant, debug retors, sécurité | `tier: jugement` (ou héritage) |

Le réflexe « tout sur Opus » annule le bénéfice de l'échelle — on ne prend pas
un architecte pour construire une cabane.

## Ce que cette skill ne fait PAS

- Décider de la politique d'escalade (mythos-triggers) ni des niveaux (ADR-006 / models.yaml) — elle les applique.
- Router vers des modèles hors-Claude : c'est le pack `providers-externes` (désactivé par défaut) qui étendra models.yaml le jour venu.
